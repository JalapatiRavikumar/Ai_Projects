"""my_project URL Configuration"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from my_project.views import health_check, react_app


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('product.urls')),
    path('payments/', include('payments.urls')),
    path('account/', include('account.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.HAS_FRONTEND_BUILD:
    urlpatterns += [
        re_path(
            r'^(?!api/|admin/|account/|payments/|images/|static/).*$',
            react_app,
            name='frontend',
        ),
    ]
else:
    urlpatterns.insert(0, path('', health_check, name='health-check'))
