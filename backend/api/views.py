from rest_framework.response import Response
from rest_framework import generics
from .models import Tower, Area, TowerReview
from .serializer import TowerSerializer, TowerReviewSerializer
import requests
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework import status
import csv
from rest_framework.pagination import LimitOffsetPagination

etohUniverseID = 3264581003

class GetTowerByName(generics.RetrieveAPIView):
    queryset = Tower.objects.select_related('area', 'badge').prefetch_related('creators_m2m').all()
    serializer_class = TowerSerializer
    lookup_field = 'name'

class TowerListView(generics.ListAPIView):
    serializer_class = TowerSerializer
    def get_queryset(self):
        queryset = Tower.objects.select_related('area', 'badge').prefetch_related('creators_m2m').all().order_by('-score', 'id')

        areas = self.request.query_params.getlist('area')
        if areas:
            queryset = queryset.filter(area__name__in=areas)

        diff_min = self.request.query_params.get('difficulty_min')
        diff_max = self.request.query_params.get('difficulty_max')
        if diff_min is not None and diff_max is not None:
            queryset = queryset.filter(difficulty__gte=diff_min, difficulty__lte=diff_max)

        exclude_completed = self.request.query_params.get('exclude_completed')
        completed_ids = self.request.query_params.getlist('completed_ids')
        if exclude_completed == "true" and completed_ids:
            queryset = queryset.exclude(id__in=completed_ids)

        search = self.request.query_params.get('search')
        if search:
            search=search.strip().lower()
            def get_acronym(name):
                return ''.join([w[0] for w in name.split()]).lower()
            queryset = [tower for tower in queryset if
                        search in tower.name.lower() or
                        search in get_acronym(tower.name)]
            
        return queryset


class GetAllTowersByScore(generics.ListAPIView):
    queryset = Tower.objects.select_related('area', 'badge').prefetch_related('creators_m2m').all().order_by('-score')
    serializer_class = TowerSerializer


class GetUserBadges(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        roblox_user_id = request.user.roblox_user_id
    
        if not roblox_user_id:
            return Response(
                {'error': 'No Roblox account linked'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            response = requests.get(
                f'https://badges.roblox.com/v1/users/{roblox_user_id}/badges',
                params={'limit': 100, 'sortOrder': 'Asc'}
            )
            response.raise_for_status()
            badges_data = response.json()
            
            return Response(badges_data)
        except requests.RequestException as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class GetGameBadgesCSV(APIView):
    def get(self, request):
        all_badges = []
        cursor = None

        while True:
            params ={'limit': 100}
            if cursor:
                params['cursor'] = cursor

            response = requests.get(f'https://badges.roblox.com/v1/universes/{etohUniverseID}/badges', params=params)
            data = response.json()
            all_badges.extend(data.get('data', []))
            cursor = data.get('nextPageCursor')
            if not cursor:
                break
        
        with open('badges.csv', 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['Badge ID', 'Badge Name'])
            for badge in all_badges:
                writer.writerow([badge['id'], badge['name']])

        print(f'Saved {len(all_badges)} badges to badges.csv')

class SyncTowerCompletions(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile = request.user.profile
        result = profile.sync_tower_completions()

        if 'error' in result:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'message': f"Synced {result['newly_completed_count']} new completions",
            'newly_completed': result['newly_completed'],
            'total_checked': result['total_checked']
        })
            
class GetCompletedTowers(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = request.user.profile
        completed_tower_ids = profile.tower_statuses.filter(status='completed').values_list('tower_id', flat=True)
        completed_towers = Tower.objects.filter(id__in=completed_tower_ids).select_related('area', 'badge').prefetch_related('creators_m2m').values('id')
        return Response(list(completed_towers))
    
class GetEligibleAreas(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        profile = request.user.profile
        areas = Area.objects.all()
        completed_tower_ids = profile.tower_statuses.filter(status='completed').values_list('tower_id', flat=True)
        completed = Tower.objects.filter(id__in=completed_tower_ids)
        diff_counts = {}
        for tower in completed:
            cat = tower.diff_category
            diff_counts[cat] = diff_counts.get(cat, 0) + 1

        data = []
        print("User:", request.user)
        print("Completed towers:", completed.count())
        print("Areas:", areas.count())
        print("Diff counts:", diff_counts)
        for area in areas:
            eligible = (
                completed.count() >= area.required_completions and
                diff_counts.get('medium', 0) >= area.required_medium and
                diff_counts.get('hard', 0) >= area.required_hard and
                diff_counts.get('difficult', 0) >= area.required_difficult and
                diff_counts.get('challenging', 0) >= area.required_challenging and
                diff_counts.get('intense', 0) >= area.required_intense and
                diff_counts.get('remorseless', 0) >= area.required_remorseless
            )
            if eligible:
                data.append(area.name)
        return Response(data)
    
class GetUserProfile(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = request.user.profile
        roblox_user_id = profile.roblox_user_id
        avatar_url = None

        if roblox_user_id:
            resp = requests.get(
                f"https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds={roblox_user_id}&size=150x150&format=Png&isCircular=false"
            )
            data = resp.json()
            if data.get("data") and data["data"][0].get("imageUrl"):
                avatar_url = data["data"][0]["imageUrl"]

        return Response({
            "roblox_user_id": roblox_user_id,
            "username": request.user.username,
            "avatar_url": avatar_url
        })
    
class HealthCheck(APIView):
    def get(self, request):
        return Response({"status": "ok"}, status=status.HTTP_200_OK)

class GetTowerCompletion(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, tower_id):
        profile = request.user.profile
        tower_status = profile.tower_statuses.filter(tower_id=tower_id).first()
        
        if tower_status:
            return Response({"status": tower_status.status})
        else:
            return Response({"status": "incomplete"})

    
class SetTowerStatus(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, tower_id):
        from .models import ProfileTowerStatus
        
        profile = request.user.profile
        status_value = request.data.get('status')  
        
        valid_statuses = ['completed', 'bookmarked', 'ignored', 'incomplete']
        if status_value not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Must be one of: {valid_statuses}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            tower = Tower.objects.get(id=tower_id)
        except Tower.DoesNotExist:
            return Response(
                {'error': 'Tower not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        ProfileTowerStatus.objects.update_or_create(
            profile=profile,
            tower=tower,
            defaults={'status': status_value}
        )
        
        return Response({
            'message': f'Tower status set to {status_value}',
        })

class SetTowerReview(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, tower_id):
        from .models import TowerReview

        profile = request.user.profile
        review = request.data.get('review')
        summary = request.data.get('summary')
        score = request.data.get('score')

        try:
            tower = Tower.objects.get(id=tower_id)
        except Tower.DoesNotExist:
            return Response(
                {'error': 'Tower not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        TowerReview.objects.update_or_create(
            profile = profile,
            tower =tower,
            score = score,
            review_text=review,
            summary = summary,
        )

        return Response({
            'message': f'Tower review created for {tower}',
        })


class GetTowerReviews(generics.ListAPIView):
    serializer_class = TowerReviewSerializer
    pagination_class = LimitOffsetPagination
    permission_classes = []
    
    def get_queryset(self):
        tower_id = self.kwargs['tower_id']
        return TowerReview.objects.filter(tower_id=tower_id).select_related('profile__user').order_by('-id')