"""
URL configuration for library project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse

# Stub view for service worker to prevent 404
def stub_sw(request):
    return HttpResponse('', content_type='application/javascript', status=204)

# Stub view for webpack HMR hot-update files
def stub_hmr(request, filename):
    return HttpResponse('{}', content_type='application/json', status=204)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('catalog.api_urls')),
    path('sw.js', stub_sw, name='service-worker'),  # Prevent 404 for service worker
    path('<str:filename>.hot-update.json', stub_hmr, name='hmr-stub'),  # Prevent 404 for HMR
    path('', include('catalog.urls')),
]
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)