import urllib.request, json

# Get rows from HuggingFace datasets API to find image URLs for different classes
# We want: River(8), Highway(3), Industrial(4), AnnualCrop(0), Forest(1)
# Need to search different offsets to find these classes

target_classes = {8: "river", 3: "highway", 4: "industrial", 0: "crop", 1: "forest"}
found = {}

# EuroSAT is sorted by class, so we need to sample from different offsets
# Each class has ~2000-3000 images
# Approximate offsets: AnnualCrop=0, Forest=3000, HerbVeg=6000, Highway=9000, Industrial=11500, Pasture=14000, PermanentCrop=16500, Residential=19000, River=21500, SeaLake=24000
offsets = {0: 100, 1: 3100, 3: 9100, 4: 11600, 8: 21600}

for label_idx, offset in offsets.items():
    url = f'https://datasets-server.huggingface.co/rows?dataset=blanchon/EuroSAT_RGB&config=default&split=train&offset={offset}&length=1'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        resp = urllib.request.urlopen(req, timeout=15)
        data = json.loads(resp.read())
        for row in data.get('rows', []):
            r = row['row']
            actual_label = r['label']
            img_url = r['image']['src']
            fn = r.get('filename', '?')
            print(f"Offset {offset}: Label={actual_label} ({target_classes.get(actual_label, '?')}), File={fn}")
            print(f"  URL: {img_url}")
            if actual_label in target_classes and actual_label not in found:
                found[actual_label] = img_url
    except Exception as e:
        print(f"Offset {offset}: FAIL - {e}")

print(f"\nFound {len(found)} / {len(target_classes)} target classes")
for k, v in found.items():
    print(f"  {target_classes[k]}: {v[:100]}...")
