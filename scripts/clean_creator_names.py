import os
import django
import sys
import re

sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Creator, Tower

def clean_creator_names():
    pattern = r'\s*\[[a-z0-9]\]|\s*\(Host\)|\s*\(Original version\)|\s*\(.*?\)'
    
    creators = Creator.objects.all()
    updated_count = 0
    
    for creator in creators:
        if re.search(pattern, creator.name, re.IGNORECASE):
            clean_name = re.sub(pattern, '', creator.name, flags=re.IGNORECASE).strip()
            
            if not clean_name:
                print(f'WARNING: Cleaned name is empty for "{creator.name}", skipping')
                continue
            
            print(f'Found: "{creator.name}" -> "{clean_name}"')
            
            clean_creator, created = Creator.objects.get_or_create(
                name=clean_name,
                defaults={
                    'roblox_user_id': creator.roblox_user_id,
                    'avatar_url': creator.avatar_url
                }
            )
            
            if created:
                print(f'  Created new creator: {clean_name}')
            else:
                if not clean_creator.roblox_user_id and creator.roblox_user_id:
                    clean_creator.roblox_user_id = creator.roblox_user_id
                if not clean_creator.avatar_url and creator.avatar_url:
                    clean_creator.avatar_url = creator.avatar_url
                clean_creator.save()
            
            towers = Tower.objects.filter(creators_m2m=creator)
            
            for tower in towers:
                tower.creators_m2m.remove(creator)
                tower.creators_m2m.add(clean_creator)
                print(f'  Updated tower: {tower.name}')
            
            if not creator.towers.exists():
                creator.delete()
                print(f'  Deleted fragmented creator: {creator.name}')
            
            updated_count += 1
    
    print(f'\nCleaned {updated_count} creator names')

if __name__ == '__main__':
    clean_creator_names()