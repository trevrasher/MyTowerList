from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.core.validators import MaxValueValidator, MinValueValidator
from django.contrib.auth.models import User
import requests

class Area(models.Model):
    name = models.CharField(max_length=100, unique=True)
    order = models.IntegerField(default=0)
    required_completions = models.IntegerField(default=0)
    required_medium = models.IntegerField(default=0)
    required_hard = models.IntegerField(default=0)
    required_difficult = models.IntegerField(default=0)
    required_challenging = models.IntegerField(default=0)
    required_intense = models.IntegerField(default=0)
    required_remorseless = models.IntegerField(default=0)

    def __str__(self):
        return self.name
    
    def check_requirements(self, profile):
        completed = profile.complete_towers
        
        if completed.count() < self.required_completions:
            return False

        for diff_category, required_count in self.required_difficulties.items():
            actual = completed.filter(diff_category=diff_category).count()
            if actual < required_count:
                return False
        
        return True
    

class Tower(models.Model):
    name=models.CharField(max_length=200)
    difficulty = models.FloatField()
    creators_m2m = models.ManyToManyField('Creator', related_name='towers', blank=True)
    floors = models.IntegerField()
    area = models.ForeignKey(Area, on_delete=models.SET_NULL, null=True)
    score = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)], db_index=True)
    type = models.CharField(
        choices=[
            ('tower', 'Tower'),
            ('mini_tower', 'Mini-Tower'),
            ('steeple', 'Steeple'),
            ('citadel', 'Citadel'),
        ],
        default='tower'
    )
    diff_category = models.CharField(
        default='easy',
        choices=[
            ('easy', 'Easy'),
            ('medium', 'Medium'),
            ('hard', 'Hard'),
            ('difficult', 'Difficult'),
            ('challenging', 'Challenging'),
            ('intense', 'Intense'),
            ('remorseless', 'Remorseless'),
            ('insane', 'Insane'),
            ('extreme', 'Extreme'),
            ('terrifying', 'Terrifying'),
            ('catastrophic', 'Catastrophic'),
        ]
    )
    badge = models.ForeignKey('Badge', on_delete=models.SET_NULL, null=True, blank=True, related_name='tower')

class Creator(models.Model):
    name = models.CharField(max_length=100, unique=True)
    

    def __str__(self):
        return self.name

class Badge(models.Model):
    id = models.BigIntegerField(unique= True, primary_key = True)
    name = models.CharField(max_length = 100, null = True)


class Profile(models.Model):
    complete_towers = models.ManyToManyField('Tower', blank = True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile', null=True)
    roblox_user_id = models.BigIntegerField(unique=True, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"
    
    def sync_tower_completions(self):
        uncompleted_towers = Tower.objects.exclude(id__in=self.complete_towers.all()).filter(badge__isnull=False) 
   
        if not uncompleted_towers.exists():
            return {'newly_completed': [], 'total_checked': 0}
            
        badge_ids = list(uncompleted_towers.values_list('badge__id', flat=True))
        owned_badge_ids = []
        for i in range(0, len(badge_ids), 100):
            batch = badge_ids[i:i+100]
            badge_ids_str = ','.join([str(bid) for bid in batch])
        
            try:
                response = requests.get(f'https://badges.roblox.com/v1/users/{self.roblox_user_id}/badges/awarded-dates', params={'badgeIds': badge_ids_str})
                response.raise_for_status()
                data = response.json()
                owned_badge_ids.extend([item['badgeId'] for item in data.get('data', [])])
            except requests.RequestException as e:
                return {'error': str(e)}
        newly_completed = uncompleted_towers.filter(badge__id__in=owned_badge_ids)

        self.complete_towers.add(*newly_completed)

        return {
            'newly_completed': list(newly_completed.values('id', 'name')),
            'total_checked': uncompleted_towers.count(),
            'newly_completed_count': newly_completed.count()
        }
        


        
