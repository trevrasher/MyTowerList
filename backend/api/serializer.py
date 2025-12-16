from rest_framework import serializers
from .models import Tower, Creator, Profile, TowerReview



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
    
class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Profile
        fields = ['username', 'roblox_user_id', '']

class TowerReviewSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    
    class Meta:
        model = TowerReview
        fields = '__all__'
    
    def get_username(self, obj):
        if obj.profile and obj.profile.user:
            return obj.profile.user.username
        return "Unknown User"