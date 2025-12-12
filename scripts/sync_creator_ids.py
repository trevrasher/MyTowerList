import os
import django
import sys

sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Creator
import requests
import time

def sync_creator_ids():
    creators_without_id = Creator.objects.filter(roblox_user_id__isnull=True)
    total = creators_without_id.count()
    
    if total == 0:
        print('All creators already have user IDs')
        return

    print(f'Found {total} creators without user IDs')
    
    creators_list = list(creators_without_id)
    updated_count = 0
    
    for i in range(0, len(creators_list), 100):
        batch = creators_list[i:i+100]
        usernames = [creator.name for creator in batch]
        
        try:
            response = requests.post(
                'https://users.roblox.com/v1/usernames/users',
                json={'usernames': usernames, 'excludeBannedUsers': False}
            )
            response.raise_for_status()
            data = response.json()
            
            username_to_id = {
                user['name']: user['id'] 
                for user in data.get('data', [])
            }
            
            for creator in batch:
                if creator.name in username_to_id:
                    creator.roblox_user_id = username_to_id[creator.name]
                    creator.save()
                    updated_count += 1
                    print(f'Updated {creator.name}: {creator.roblox_user_id}')
                else:
                    print(f'WARNING: User not found: {creator.name}')
            
            time.sleep(0.5)  
        except requests.RequestException as e:
            print(f'ERROR: {e}')
    
    print(f'Updated {updated_count}/{total} creators')

if __name__ == '__main__':
    sync_creator_ids()