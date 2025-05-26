from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MedicoViewSet, EspecialidadViewSet, PermisoViewSet,
    AdministradorViewSet, ObservacionesMedicoViewSet,
    login_view, perfil_medico
)

# Router para CRUDs
router = DefaultRouter()
router.register(r'medicos', MedicoViewSet)
router.register(r'especialidades', EspecialidadViewSet)
router.register(r'permisos', PermisoViewSet)
router.register(r'administradores', AdministradorViewSet)
router.register(r'observaciones', ObservacionesMedicoViewSet)

# URL patterns
urlpatterns = [
    path('', include(router.urls)),              # Endpoints REST automáticos
    path('login/', login_view),                  # POST /api/login/
    path('perfil/', perfil_medico),              # GET /api/perfil/?id=...
]
