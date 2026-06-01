import os

from django.utils.deprecation import MiddlewareMixin

from my_project.db_utils import ensure_database


class EnsureDatabaseMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if os.environ.get('VERCEL'):
            ensure_database()
