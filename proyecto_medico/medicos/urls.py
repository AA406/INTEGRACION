from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MedicoViewSet, EspecialidadViewSet, PermisoViewSet,
    AdministradorViewSet, ObservacionesMedicoViewSet,
    login_view
)

router = DefaultRouter()
router.register(r'medicos', MedicoViewSet)
router.register(r'especialidades', EspecialidadViewSet)
router.register(r'permisos', PermisoViewSet)
router.register(r'administradores', AdministradorViewSet)
router.register(r'observaciones', ObservacionesMedicoViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', login_view),  # POST /api/login/
]
