import os
import django
from bs4 import BeautifulSoup
import requests
import re

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Tower, Area

def extract_towers_from_html(html_source):
    if html_source.startswith('http://') or html_source.startswith('https://'):
        response = requests.get(html_source)
        response.raise_for_status() 
        html = response.text
    else:
        with open(html_source, 'r', encoding='utf-8') as f:
            html = f.read()
    
    soup = BeautifulSoup(html, 'html.parser')
    
    tower_names = []
    
    all_tables = soup.find_all('table', class_=['wikitable', 'mw-collapsible', 'mw-made-collapsible'])
    
    if not all_tables:
        return []
    
    sections_to_extract = ['Beginner Towers', 'Intermediate Towers', 'Advanced Towers', 'Psychologically Unsafe Towers', 'Soul Crushing Tower', 'Soul Crushing Towers', 'Citadel', 'Mini Tower', 'Beginner Towers/Steeples','Intermediate Towers/Steeples', 'Advanced Towers/Steeples', 'Psychologically Unsafe Towers/Steeples', 'Psychologically Unsafe Towers', 'Insanity Inducing Towers', 'Mentally Traumatizing Towers', 'Life Ending Towers', 'Beginner Steeples', 'Intermediate Steeples', 'Advanced Steeples', 'Psychologically Unsafe Steeples', 'Tower', 'Soul-Crushing Towers', 'Advanced Steeples', 'Introductory Towers[a]',   ]
    
    for table_idx, table in enumerate(all_tables):
        rows = table.find_all('tr')
        current_section = None
        for row in rows:
            header_cell = row.find('td', colspan=True)
            if header_cell:
                section_text = header_cell.get_text(strip=True)
                if section_text in sections_to_extract:
                    current_section = section_text
                else:
                    current_section = None
            elif current_section:
                tds = row.find_all('td')
                if len(tds) >= 2:
                    links = tds[1].find_all('a')
                    for link in links:
                        tower_href = link.get('href')
                        if not tower_href or tower_href.startswith('#'):
                            continue
                        if tower_href.startswith('/'):
                            tower_href = 'https://jtoh.fandom.com' + tower_href
                        if tower_href not in tower_names:
                            tower_names.append(tower_href)

    return tower_names

def extract_stats_from_html(html_source):
    response = requests.get(html_source)
    response.raise_for_status()
    html = response.text  

    soup = BeautifulSoup(html, 'html.parser')

    tower_info = {
        "name": None,
        "difficulty": None,
        "creators": [],
        "floors": None,
        "area": None,
        "type": None
    }

    aside = soup.find('aside', class_=['portable-infobox', 'pi-background', 'pi-border-color', 'pi-theme-wikia', 'pi-layout-default'])

    if not aside:
        return tower_info
    
    nameH2 = aside.find('h2')
    if nameH2:
        tower_info['name'] = nameH2.get_text(strip=True)

    floors_text = aside.find('td', attrs={'data-source': 'type_of_tower1'})
    if not floors_text:
        floors_text = aside.find('td', attrs={'data-source': 'type_of_tower'})
    if floors_text:
        floors_value = floors_text.get_text(strip=True) 
        type_match = re.search(r'Tower|Citadel|Mini[\s-]?tower|Steeple', floors_value, re.IGNORECASE)
        if type_match:
            tower_info["type"] = type_match.group().lower()  
            floors_number = re.sub(r'\D', '', floors_value)  
            if floors_number:
                tower_info['floors'] = int(floors_number)
    
    difficulty_div = aside.find('div', attrs={'data-source': 'difficulty'})
    if not difficulty_div:
        difficulty_div = aside.find('div', attrs={'data-source': 'difficulty1'})
    if difficulty_div:
        difficulty_value = difficulty_div.get_text(strip=True)
        match = re.search(r'([\d]+\.[\d]+|[\d]+)', difficulty_value)
        if match:
            tower_info['difficulty'] = float(match.group(1))

    creator_div = aside.find('div', attrs={'data-source': 'creator(s)1'})
    if not creator_div:
        creator_div = aside.find('div', attrs={'data-source': 'creator(s)'})
    if creator_div:
        value_div = creator_div.find('div', class_='pi-data-value')
        if value_div:
            li_tags = value_div.find_all('li')
            if li_tags:
                creators = [li.get_text(strip=True) for li in li_tags]
            else:
                creators = [c.strip() for c in value_div.get_text(strip=True).split(',')]
        tower_info['creators'] = creators

    area_div = aside.find('div', attrs={'data-source': 'found_in1'})
    if not area_div:
        area_div = aside.find('div', attrs={'data-source': 'found_in'})
    if area_div:
        value_div = area_div.find('div', class_='pi-data-value')
        if value_div:
            for a in value_div.find_all('a'):
                text = a.get_text(strip=True)
                if text:
                    tower_info['area'] = text
                    break
    

    print("\n=== Tower Info ===")
    for key, value in tower_info.items():
        print(f"{key}: {value}")
    print("==================\n")
    
    return tower_info
    
if __name__ == "__main__":
    html_source = input("Enter URL or file path: ")
    html_source = html_source.strip().strip('"').strip("'")
    extract_stats_from_html(html_source)
