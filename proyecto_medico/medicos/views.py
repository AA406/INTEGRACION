from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Medico, Especialidad, Permiso, Administrador, ObservacionesMedico
from .serializers import (
    MedicoSerializer, EspecialidadSerializer,
    PermisoSerializer, AdministradorSerializer,
    ObservacionesMedicoSerializer
)

# Vistas tipo ViewSet para CRUD automático

class MedicoViewSet(viewsets.ModelViewSet):
    queryset = Medico.objects.all()
    serializer_class = MedicoSerializer

class EspecialidadViewSet(viewsets.ModelViewSet):
    queryset = Especialidad.objects.all()
    serializer_class = EspecialidadSerializer

class PermisoViewSet(viewsets.ModelViewSet):
    queryset = Permiso.objects.all()
    serializer_class = PermisoSerializer

class AdministradorViewSet(viewsets.ModelViewSet):
    queryset = Administrador.objects.all()
    serializer_class = AdministradorSerializer

class ObservacionesMedicoViewSet(viewsets.ModelViewSet):
    queryset = ObservacionesMedico.objects.all()
    serializer_class = ObservacionesMedicoSerializer

# API login (como en tu Node.js)

@api_view(['POST'])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')

    medico = Medico.objects.filter(email=email, rut=password).first()
    if medico:
        return Response({
            'id': medico.id_med,
            'nombre': medico.nombre,
            'email': medico.email,
            'tipo': 'medico'
        })

    admin = Administrador.objects.filter(email=email, rut=password).first()
    if admin:
        return Response({
            'id': admin.id_administrador,
            'nombre': admin.nombre,
            'email': admin.email,
            'tipo': 'admin'
        })

    return Response({'message': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)
