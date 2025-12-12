from rest_framework import serializers
from .models import Tower, Creator



class CreatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Creator
        fields = ['name', 'roblox_user_id', 'avatar_url']
        
class TowerSerializer(serializers.ModelSerializer):
    area = serializers.CharField(source='area.name', read_only=True)
    creators = CreatorSerializer(source='creators_m2m', many=True, read_only=True)
    
    class Meta:
        model = Tower
        fields = '__all__'
    

