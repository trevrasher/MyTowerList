import requests
from bs4 import BeautifulSoup
import os
import time

input_file = "towerlinks_urls.txt"
output_folder = "tower_thumbnails"

def get_thumbnail_url_from_api(page_url):
    """Extract thumbnail URL using Fandom MediaWiki API"""
    if 'wiki/' in page_url:
        page_name = page_url.split('wiki/')[-1]
    else:
        page_name = page_url
    
    api_url = "https://jtoh.fandom.com/api.php"
    params = {
        'action': 'parse',
        'page': page_name,
        'format': 'json'
    }
    
    try:
        response = requests.get(api_url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if 'error' in data:
            print(f"  API Error: {data['error'].get('info', 'Unknown error')}")
            return None
        
        html = data['parse']['text']['*']
        soup = BeautifulSoup(html, 'html.parser')
        
        tag = soup.find("a", class_="image image-thumbnail")
        if tag and tag.get("href"):
            return tag["href"]
        
        return None
    except Exception as e:
        print(f"  Error: {e}")
        return None

os.makedirs(output_folder, exist_ok=True)

with open(input_file, encoding="utf-8") as fin:
    for line in fin:
        url = line.strip()
        if not url:
            continue
        
        page_name = url.split('wiki/')[-1] if 'wiki/' in url else url
        print(f"Fetching thumbnail for {page_name}...")
        
        thumb_url = get_thumbnail_url_from_api(url)
        
        if thumb_url:
            img_name = page_name + ".webp"
            img_path = os.path.join(output_folder, img_name)
            
            try:
                img_resp = requests.get(thumb_url, timeout=10)
                if img_resp.status_code == 200:
                    with open(img_path, "wb") as img_file:
                        img_file.write(img_resp.content)
                    print(f"  ✓ Saved: {img_path}")
                else:
                    print(f"  ✗ Failed to download image: {img_resp.status_code}")
            except Exception as e:
                print(f"  ✗ Error downloading image: {e}")
        else:
            print("  ✗ No thumbnail found")
        
        time.sleep(1)

print("\nDone!")