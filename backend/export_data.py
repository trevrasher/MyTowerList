import json
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Tower, Badge, Profile, Area, Creator

data = []

# Export Areas
for area in Area.objects.all():
    data.append({
        'model': 'api.area',
        'pk': area.id,
        'fields': {
            'name': area.name,
            'order': area.order,
            'required_completions': area.required_completions,
            'required_medium': area.required_medium,
            'required_hard': area.required_hard,
            'required_difficult': area.required_difficult,
            'required_challenging': area.required_challenging,
            'required_intense': area.required_intense,
            'required_remorseless': area.required_remorseless
        }
    })

# Export Creators
for creator in Creator.objects.all():
    data.append({
        'model': 'api.creator',
        'pk': creator.id,
        'fields': {'name': creator.name}
    })

# Export Badges
for badge in Badge.objects.all():
    data.append({
        'model': 'api.badge',
        'pk': badge.id,
        'fields': {'name': badge.name}
    })

# Export Towers
for tower in Tower.objects.all():
    data.append({
        'model': 'api.tower',
        'pk': tower.id,
        'fields': {
            'name': tower.name,
            'difficulty': float(tower.difficulty),
            'floors': tower.floors,
            'area': tower.area_id,
            'score': tower.score,
            'type': tower.type,
            'diff_category': tower.diff_category,
            'badge': tower.badge_id,
            'creators_m2m': list(tower.creators_m2m.values_list('id', flat=True))
        }
    })

# Export Profiles
for profile in Profile.objects.all():
    data.append({
        'model': 'api.profile',
        'pk': profile.id,
        'fields': {
            'user': profile.user_id,
            'roblox_user_id': profile.roblox_user_id,
            'complete_towers': list(profile.complete_towers.values_list('id', flat=True))
        }
    })

# Write with ASCII encoding to avoid special character issues
with open('safe_export.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=True)

print(f"Exported {len(data)} objects successfully")