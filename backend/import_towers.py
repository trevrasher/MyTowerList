import os
import django
from parse_html import extract_stats_from_html

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Tower, Area, Creator

def load_tower_urls():
    file_path = os.path.join(os.path.dirname(__file__), '..', 'scripts', 'towerlinks_urls.txt')
    with open(file_path, 'r') as f:
        return [line.strip() for line in f if line.strip()]

def get_diff_category(difficulty):
    """Calculate difficulty category from difficulty number"""
    if difficulty < 2:
        return 'easy'
    elif difficulty < 3:
        return 'medium'
    elif difficulty < 4:
        return 'hard'
    elif difficulty < 5:
        return 'difficult'
    elif difficulty < 6:
        return 'challenging'
    elif difficulty < 7:
        return 'intense'
    elif difficulty < 8:
        return 'remorseless'
    elif difficulty < 9:
        return 'insane'
    elif difficulty < 10:
        return 'extreme'
    elif difficulty < 11:
        return 'terrifying'
    else:
        return 'catastrophic'

def import_towers_from_ring():
    tower_urls = load_tower_urls()
    print(f"Found {len(tower_urls)} towers")
    
    for tower_url in tower_urls:
        print(f"Processing: {tower_url}")
        tower_data = extract_stats_from_html(tower_url)
        
        if tower_data and tower_data["difficulty"]:
            area = None
            if tower_data["area"]:
                area, _ = Area.objects.get_or_create(
                    name=tower_data["area"],
                    defaults={"order": 0}
                )

            diff_category = get_diff_category(tower_data["difficulty"])

            tower, created = Tower.objects.update_or_create(
                name=tower_data["name"],
                defaults={
                    "difficulty": tower_data["difficulty"],
                    "diff_category": diff_category,
                    "floors": tower_data["floors"] or 10,  
                    "area": area,
                    "score": 50,  
                    "type": tower_data["type"]
                }
            )
            

            if tower_data["creators"]:
                tower.creators_m2m.clear() 
                for creator_name in tower_data["creators"]:
                    creator, _ = Creator.objects.get_or_create(name=creator_name)
                    tower.creators_m2m.add(creator)
            
            action = "Created" if created else "Updated"
            print(f"  {action}: {tower.name} (Difficulty: {tower.difficulty}, Category: {diff_category})")
        else:
            print(f"  Skipped: {tower_url} (incomplete data)")

if __name__ == "__main__":
    import_towers_from_ring()