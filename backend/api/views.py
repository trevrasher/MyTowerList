from rest_framework.response import Response
from rest_framework import generics
from urllib.parse import unquote
from .models import Tower
from .serializer import TowerSerializer
import requests
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework import status
import csv

etohUniverseID = 3264581003

class GetTowerByName(generics.RetrieveAPIView):
    queryset = Tower.objects.all()
    serializer_class = TowerSerializer
    lookup_field = 'name'
    

class GetAllTowersByScore(generics.ListAPIView):
    queryset = Tower.objects.all().order_by('-score')
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
            
                    
        


