import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Badge, Tower

def link_badges_to_towers():
    badges = Badge.objects.all()
    linked_count = 0
    not_found_count = 0

    for badge in badges:
        if badge.name.startswith("Beat The "):
            tower_name = badge.name.replace("Beat The ", "").strip()
        
            try:
                tower= Tower.objects.get(name=tower_name)
                tower.badge = badge
                tower.save()
                linked_count+=1
            except Tower.DoesNotExist:
                not_found_count += 1
                print(f"✗ Tower not found: {tower_name}")
            except Tower.MultipleObjectsReturned:
                print(f"⚠ Multiple towers found for: {tower_name}")

    print(f"Successfully linked: {linked_count}")

if __name__ == '__main__':
    link_badges_to_towers()
