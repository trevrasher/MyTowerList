from rest_framework import serializers
from .models import Tower, Creator


class TowerSerializer(serializers.ModelSerializer):
    area = serializers.StringRelatedField()
    creators = serializers.SerializerMethodField()
    class Meta:
        model = Tower
        fields = '__all__'

    def get_creators(self, obj):
        return [creator.name for creator in obj.creators_m2m.all()]
    

class CreatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Creator
        fields = ['name', 'roblox_user_id', 'avatar_url']