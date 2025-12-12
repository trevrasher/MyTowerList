import os
import django
import sys

sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Creator
import requests
import time

def sync_creator_avatars():
    creators_without_avatar = Creator.objects.filter(
        roblox_user_id__isnull=False,
        avatar_url__isnull=True
    )
    total = creators_without_avatar.count()
    
    if total == 0:
        print('All creators already have avatar URLs')
        return

    print(f'Found {total} creators without avatar URLs')
    
    creators_list = list(creators_without_avatar)
    updated_count = 0
    
    for i in range(0, len(creators_list), 100):
        batch = creators_list[i:i+100]
        user_ids = [str(creator.roblox_user_id) for creator in batch]
        
        try:
            response = requests.get(
                'https://thumbnails.roblox.com/v1/users/avatar-headshot',
                params={
                    'userIds': ','.join(user_ids),
                    'size': '150x150',
                    'format': 'Png',
                    'isCircular': 'false'
                }
            )
            response.raise_for_status()
            data = response.json()
            
            id_to_avatar = {
                avatar['targetId']: avatar.get('imageUrl')
                for avatar in data.get('data', [])
                if avatar.get('imageUrl')
            }
            
            for creator in batch:
                if creator.roblox_user_id in id_to_avatar:
                    creator.avatar_url = id_to_avatar[creator.roblox_user_id]
                    creator.save()
                    updated_count += 1
                    print(f'Updated {creator.name}: {creator.avatar_url}')
                else:
                    print(f'WARNING: Avatar not found for {creator.name} (ID: {creator.roblox_user_id})')
            
            time.sleep(0.5)  
            
        except requests.RequestException as e:
            print(f'ERROR: {e}')
    
    print(f'Updated {updated_count}/{total} creators')

if __name__ == '__main__':
    sync_creator_avatars()