import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'my_project.settings')

import django

django.setup()

from my_project.db_utils import ensure_database

ensure_database()

from my_project.wsgi import application

app = application
