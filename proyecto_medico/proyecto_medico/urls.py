from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import RedirectView
from django.conf import settings
from django.conf.urls.static import static
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('medicos.urls')),

    # Redirigir raíz a login
    re_path(r'^$', RedirectView.as_view(url='/inicio/auth-login-basic.html', permanent=False)),
]

# Servir archivos estáticos (HTML + assets) en desarrollo
if settings.DEBUG:
    urlpatterns += static('/', document_root=os.path.join(settings.BASE_DIR, "html"))
    urlpatterns += static('/assets/', document_root=os.path.join(settings.BASE_DIR, "assets"))
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
