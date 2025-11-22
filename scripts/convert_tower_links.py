input_file = "towerlinks.txt"
output_file = "towerlinks_urls.txt"

def to_fandom_url(name):
    name = name.strip()
    if not name:
        return None
    name = name.replace(" ", "_")
    name = name.replace("'", "%27")
    name = name.replace("/", "%2F")
    return f"https://jtoh.fandom.com/wiki/{name}"

with open(input_file, encoding="utf-8") as fin, open(output_file, "w", encoding="utf-8") as fout:
    for line in fin:
        url = to_fandom_url(line)
        if url:
            fout.write(url + "\n")

print(f"Done! URLs written to {output_file}")