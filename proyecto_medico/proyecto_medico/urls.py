from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import RedirectView
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('medicos.urls')),

    # Redirigir raíz a login
    re_path(r'^$', RedirectView.as_view(url='/inicio/auth-login-basic.html', permanent=False)),

    # Rutas para carpetas con HTML
    re_path(r'^inicio/(?P<path>.*)$', serve, {
        'document_root': os.path.join(settings.BASE_DIR, 'html/inicio'),
    }),
    re_path(r'^home-medico/(?P<path>.*)$', serve, {
        'document_root': os.path.join(settings.BASE_DIR, 'html/home-medico'),
    }),
    re_path(r'^listado-medicos/(?P<path>.*)$', serve, {
        'document_root': os.path.join(settings.BASE_DIR, 'html/listado-medicos'),
    }),

    # Rutas directas a otros HTML sueltos
    re_path(r'^comentarios\.html$', serve, {
        'document_root': os.path.join(settings.BASE_DIR, 'html'),
        'path': 'comentarios.html',
    }),
    re_path(r'^historial_medico\.html$', serve, {
        'document_root': os.path.join(settings.BASE_DIR, 'html'),
        'path': 'historial_medico.html',
    }),
    re_path(r'^perfil_medico\.html$', serve, {
        'document_root': os.path.join(settings.BASE_DIR, 'html'),
        'path': 'perfil_medico.html',
    }),
    re_path(r'^permiso\.html$', serve, {
        'document_root': os.path.join(settings.BASE_DIR, 'html'),
        'path': 'permiso.html',
    }),
]

# Archivos estáticos y media (solo en desarrollo)
if settings.DEBUG:
    urlpatterns += static('/assets/', document_root=os.path.join(settings.BASE_DIR, "assets"))
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
