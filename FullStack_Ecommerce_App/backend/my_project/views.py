from django.http import HttpResponse, JsonResponse
from django.conf import settings
from pathlib import Path


def health_check(request):
    return JsonResponse({
        "status": "ok",
        "message": "Backend API is running",
        "endpoints": {
            "products": "/api/products/",
            "account": "/account/",
            "payments": "/payments/",
            "admin": "/admin/",
        },
    })


def react_app(request):
    index_path = Path(settings.BASE_DIR) / 'frontend_build' / 'index.html'
    if not index_path.exists():
        return health_check(request)
    return HttpResponse(index_path.read_text(encoding='utf-8'), content_type='text/html')
