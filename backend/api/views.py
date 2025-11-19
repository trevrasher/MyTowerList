from rest_framework.response import Response
from rest_framework import generics
from urllib.parse import unquote
from .models import Tower, Area
from .serializer import TowerSerializer
import requests
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework import status
import csv

etohUniverseID = 3264581003

class GetTowerByName(generics.RetrieveAPIView):
    queryset = Tower.objects.select_related('area', 'badge').prefetch_related('creators_m2m').all()
    serializer_class = TowerSerializer
    lookup_field = 'name'
    

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

    def get (self, request):
        profile = request.user.profile
        completed_towers = profile.complete_towers.select_related('area', 'badge').prefetch_related('creators_m2m').all().values('id')
        return Response(list(completed_towers))
    
class GetEligibleAreas(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        profile = request.user.profile
        areas = Area.objects.all()
        completed = profile.complete_towers.all()
        diff_counts = {}
        for tower in completed:
            cat = tower.diff_category
            diff_counts[cat] = diff_counts.get(cat, 0) + 1

        data = []
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
                data.append({
                    "name": area.name})
        return Response(data)