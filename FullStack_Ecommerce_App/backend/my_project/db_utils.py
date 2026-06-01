import os
from pathlib import Path

from django.core.management import call_command

DB_PATH = Path('/tmp/db.sqlite3')

SAMPLE_PRODUCTS = [
    {
        'id': 2,
        'name': 'MacBook Pro',
        'description': 'Eighth-generation quad-core Intel Core i5 processor with Retina display.',
        'price': '124999.99',
        'stock': True,
        'image': 'images/laptop_W0rdEyw.jpg',
    },
    {
        'id': 3,
        'name': 'Playstation 5',
        'description': 'Experience lightning fast loading with an ultra-high speed SSD.',
        'price': '30000.00',
        'stock': True,
        'image': 'images/Playstation_5_dCJyLre.jpg',
    },
    {
        'id': 4,
        'name': 'Bolt Headphones',
        'description': 'Wireless Bluetooth over-ear headphones with deep bass.',
        'price': '1200.99',
        'stock': True,
        'image': 'images/bolt_headphones_rKKjIIT.jpg',
    },
    {
        'id': 5,
        'name': 'Computer Chairs',
        'description': 'Office chair with lumbar support for work from home.',
        'price': '5999.99',
        'stock': True,
        'image': 'images/computer_chair_WX9xOos.jpg',
    },
    {
        'id': 6,
        'name': 'Gaming Mouse',
        'description': 'Logitech gaming mouse with customizable RGB lighting.',
        'price': '799.99',
        'stock': False,
        'image': 'images/gaming_mouse.jpg',
    },
    {
        'id': 21,
        'name': 'Colour Pencils',
        'description': 'Colour paper pencils for kids with seed pencil gift box.',
        'price': '100.00',
        'stock': True,
        'image': 'images/pencils.jpg',
    },
    {
        'id': 22,
        'name': 'Apple Ipad',
        'description': 'Apple iPad with A12 Bionic chip, Wi-Fi + Cellular, 32GB.',
        'price': '38999.99',
        'stock': True,
        'image': 'images/apple_ipad_0UhZVkV.jpg',
    },
    {
        'id': 23,
        'name': 'Wireless Keyboard',
        'description': 'Rechargeable wireless keyboard and mouse combo.',
        'price': '2617.29',
        'stock': True,
        'image': 'images/keyboard_6I3SnA1.jpg',
    },
]


def ensure_database():
    """Prepare SQLite DB and seed catalog on Vercel serverless instances."""
    if not os.environ.get('VERCEL'):
        return

    from product.models import Product

    if not DB_PATH.exists():
        call_command('migrate', verbosity=0, interactive=False)

    if Product.objects.count() == 0:
        _seed_products()


def _seed_products():
    from product.models import Product

    for item in SAMPLE_PRODUCTS:
        Product.objects.update_or_create(
            id=item['id'],
            defaults={
                'name': item['name'],
                'description': item['description'],
                'price': item['price'],
                'stock': item['stock'],
                'image': item['image'],
            },
        )
