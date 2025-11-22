import os
import django
from parse_html import extract_stats_from_html

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Tower, Area
from parse_html import extract_towers_from_html 

def import_towers_from_ring(html_source):
    tower_names = extract_towers_from_html(html_source)
    print(f"Found {len(tower_names)} towers")
    
    for tower_name in tower_names:
        print(f"Processing: {tower_name}")
        tower_data = extract_stats_from_html(tower_name)
        
        if tower_data and tower_data["difficulty"]:
            area = None
            if tower_data["area"]:
                area, _ = Area.objects.get_or_create(
                    name=tower_data["area"],
                    defaults={"order": 0}
                )

            tower, created = Tower.objects.update_or_create(
                name=tower_data["name"],
                defaults={
                    "difficulty": tower_data["difficulty"],
                    "creators": tower_data["creators"],
                    "floors": tower_data["floors"] or 10,  
                    "area": area,
                    "score": 50,  
                    "type": tower_data["type"]
                }
            )
            
            action = "Created" if created else "Updated"
            print(f"  {action}: {tower.name} (Difficulty: {tower.difficulty})")
        else:
            print(f"  Skipped: {tower_name} (incomplete data)")

if __name__ == "__main__":
    ring = input("Enter HTML Source: ")
    import_towers_from_ring(ring)
