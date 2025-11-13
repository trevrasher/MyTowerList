from rest_framework import serializers
from .models import Tower

class TowerSerializer(serializers.ModelSerializer):
    area = serializers.StringRelatedField()
    creators = serializers.SerializerMethodField()
    class Meta:
        model = Tower
        fields = '__all__'

    def get_creators(self, obj):
        return ", ".join([creator.name for creator in obj.creators_m2m.all()])