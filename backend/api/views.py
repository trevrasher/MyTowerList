from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics
from urllib.parse import unquote
from .models import Tower
from .serializer import TowerSerializer

class GetTowerByName(generics.RetrieveAPIView):
    queryset = Tower.objects.all()
    serializer_class = TowerSerializer
    lookup_field = 'name'
    

class GetAllTowersByScore(generics.ListAPIView):
    queryset = Tower.objects.all().order_by('-score')
    serializer_class = TowerSerializer