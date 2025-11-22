import requests
from bs4 import BeautifulSoup
import os
import time

input_file = "towerlinks_urls.txt"
output_folder = "tower_thumbnails"

headers = {
    "User-Agent": "Mozilla/5.0"
}


def get_thumbnail_url(html):
    soup = BeautifulSoup(html, "html.parser")
    tag = soup.find("a", class_="image image-thumbnail")
    if tag and tag.get("href"):
        return tag["href"]
    return None

with open(input_file, encoding="utf-8") as fin:
    for line in fin:
        url = line.strip()
        if not url:
            continue
        print(f"Fetching {url} ...")
        try:
            resp = requests.get(url, headers=headers, timeout=10)
            if resp.status_code == 200:
                thumb_url = get_thumbnail_url(resp.text)
                if thumb_url:
                    img_name = url.split("/")[-1] + ".webp"
                    img_path = os.path.join(output_folder, img_name)
                    img_resp = requests.get(thumb_url, headers=headers)
                    if img_resp.status_code == 200:
                        with open(img_path, "wb") as img_file:
                            img_file.write(img_resp.content)
                        print(f"Saved thumbnail: {img_path}")
                    else:
                        print(f"Failed to download image: {thumb_url}")
                else:
                    print("No thumbnail found.")
            else:
                print(f"Failed to fetch page: {resp.status_code}")
        except Exception as e:
            print(f"Error fetching {url}: {e}")
        time.sleep(1) 

print("Done!")
