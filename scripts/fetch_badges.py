import requests
import csv

etohUniverseID = 3264581003

def fetch_game_badges():
    all_badges = []
    cursor = None

    print("Fetching badges from Roblox API...")
    
    while True:
        params = {'limit': 100}
        if cursor:
            params['cursor'] = cursor

        response = requests.get(
            f'https://badges.roblox.com/v1/universes/{etohUniverseID}/badges',
            params=params
        )
        data = response.json()
        all_badges.extend(data.get('data', []))
        cursor = data.get('nextPageCursor')
        
        print(f"Fetched {len(all_badges)} badges so far...")
        
        if not cursor:
            break
    
    output_file = '../assets/badges.csv'
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['Badge ID', 'Badge Name'])
        for badge in all_badges:
            writer.writerow([badge['id'], badge['name']])

    print(f'✓ Saved {len(all_badges)} badges to {output_file}')

if __name__ == '__main__':
    fetch_game_badges()