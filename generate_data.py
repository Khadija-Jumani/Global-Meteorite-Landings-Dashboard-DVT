import csv
import random

# Generate 500 synthetic meteorite landings
# Realistic bounds for landmasses to make it look decent
land_bounds = [
    {"lat": (25, 50), "lng": (-125, -70)}, # USA
    {"lat": (-40, -10), "lng": (-70, -40)}, # South America
    {"lat": (35, 70), "lng": (-10, 40)}, # Europe
    {"lat": (-35, 35), "lng": (10, 40)}, # Africa
    {"lat": (-40, -10), "lng": (110, 150)}, # Australia
    {"lat": (10, 60), "lng": (60, 140)} # Asia
]

classes = ['L6', 'H5', 'L5', 'H6', 'H4', 'LL6', 'LL5', 'L4', 'H4/5', 'CM2']

data = []
for i in range(500):
    region = random.choice(land_bounds)
    lat = random.uniform(*region['lat'])
    lng = random.uniform(*region['lng'])
    year = random.randint(1800, 2024)
    # Mass follows roughly exponential or log-normal distribution
    # We'll just do something simple
    mass = random.uniform(10, 100000) ** (random.random() * 0.8 + 0.2)
    
    data.append({
        'name': f'Meteorite_{i}',
        'id': 10000 + i,
        'nametype': 'Valid',
        'recclass': random.choice(classes),
        'mass': round(mass, 2),
        'year': year,
        'lat': round(lat, 4),
        'lng': round(lng, 4)
    })

data.sort(key=lambda x: x['year'])

with open('data/cleaned_meteorites.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['name', 'id', 'nametype', 'recclass', 'mass', 'year', 'lat', 'lng'])
    writer.writeheader()
    writer.writerows(data)

print("Generated synthetic meteorite landings data.")
