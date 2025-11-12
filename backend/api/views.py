from rest_framework.decorators import api_view
from rest_framework.response import Response
from urllib.parse import unquote
from .models import Tower

@api_view(['GET'])
def get_tower_by_name(request, tower_name):
    decoded_name = unquote(tower_name)

    try:
        tower = Tower.objects.get(name=decoded_name)
        return Response({
            'id': tower.id,
            'name': tower.name,
            'difficulty': tower.difficulty,
            'creators': tower.creators,
            'floors': tower.floors,
            'area': tower.area.name if tower.area else None,
            'score': tower.score,
        })
    except Tower.DoesNotExist:
        return Response({'error': 'Tower not found'}, status=404)