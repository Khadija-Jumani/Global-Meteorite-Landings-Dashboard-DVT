import urllib.request
import json
import csv
import io

print("Downloading World GeoJSON...")
url_geojson = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
urllib.request.urlretrieve(url_geojson, "data/world.geojson")
print("World GeoJSON downloaded.")

print("Downloading Meteorite Landings data...")
url_meteorite = "https://data.nasa.gov/api/views/gh4g-9sfh/rows.csv?accessType=DOWNLOAD"
response = urllib.request.urlopen(url_meteorite)
csv_data = response.read().decode('utf-8')

reader = csv.DictReader(io.StringIO(csv_data))

cleaned_data = []
for row in reader:
    try:
        # We only want valid years, mass, and lat/lng
        year = row['year']
        mass = row['mass (g)']
        lat = row['reclat']
        lng = row['reclong']
        recclass = row['recclass']
        
        if year and mass and lat and lng:
            year_int = int(year.split(' ')[0].split('/')[2] if '/' in year else year[6:10] if len(year) > 9 else year[:4])
            # some years are weirdly formatted or in the future
            if 1800 <= year_int <= 2024:
                cleaned_data.append({
                    'name': row['name'],
                    'id': row['id'],
                    'nametype': row['nametype'],
                    'recclass': recclass,
                    'mass': float(mass),
                    'year': year_int,
                    'lat': float(lat),
                    'lng': float(lng)
                })
    except Exception as e:
        continue

# Sort by mass descending and take top 5000 to keep visualization snappy and meaningful
cleaned_data.sort(key=lambda x: x['mass'], reverse=True)
cleaned_data = cleaned_data[:5000]

print(f"Cleaned data has {len(cleaned_data)} records.")

with open('data/cleaned_meteorites.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['name', 'id', 'nametype', 'recclass', 'mass', 'year', 'lat', 'lng'])
    writer.writeheader()
    writer.writerows(cleaned_data)

print("Meteorite data processed and saved.")
