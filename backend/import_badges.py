import os
import django
import csv


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from api.models import Badge

def import_badges(csv_file):
    with open(csv_file, 'r', encoding ='utf-8' ) as f:
        reader = csv.DictReader(f)
        created_count = 0
        
        for row in reader:
            badge_id = int(row['Badge ID'])
            badge_name = row['Badge Name'].strip()

            badge, created = Badge.objects.update_or_create(
                id = badge_id,
                defaults={'name': badge_name}
            )

            if created: 
                created_count +=1
        
        print(f'Successfully imported {created_count} new badges')
        

if __name__ == '__main__':
    import_badges('badges.csv')