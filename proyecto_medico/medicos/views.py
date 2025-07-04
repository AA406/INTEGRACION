from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from .models import Medico, Especialidad, Permiso, Administrador, ObservacionesMedico
from .serializers import (
    MedicoSerializer, EspecialidadSerializer,
    PermisoSerializer, AdministradorSerializer,
    ObservacionesMedicoSerializer
)

# CRUD automático con ViewSets

class MedicoViewSet(viewsets.ModelViewSet):
    queryset = Medico.objects.all()
    serializer_class = MedicoSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['nombre', 'apellido', 'rut', 'email', 'est_med', 'especialidad__nombre']

class EspecialidadViewSet(viewsets.ModelViewSet):
    queryset = Especialidad.objects.all()
    serializer_class = EspecialidadSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['nombre', 'descripcion']

class PermisoViewSet(viewsets.ModelViewSet):
    queryset = Permiso.objects.all()
    serializer_class = PermisoSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['tipo', 'estado', 'medico__id_med', 'fecha_inicio', 'fecha_fin']

class AdministradorViewSet(viewsets.ModelViewSet):
    queryset = Administrador.objects.all()
    serializer_class = AdministradorSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['nombre', 'rut', 'email']

class ObservacionesMedicoViewSet(viewsets.ModelViewSet):
    queryset = ObservacionesMedico.objects.all()
    serializer_class = ObservacionesMedicoSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['medico', 'medico_fk__id_med']

    def get_queryset(self):
        id_medico = self.request.query_params.get('id_med')
        if id_medico:
            return ObservacionesMedico.objects.filter(medico_fk=id_medico)
        return ObservacionesMedico.objects.all()

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    print("📥 Datos recibidos en login:", request.data)
    return Response({
        'id': 1,
        'nombre': 'Usuario Test',
        'email': request.data.get('email', 'test@example.com'),
        'tipo': 'medico'
    }, status=status.HTTP_200_OK)

# Perfil de médico por ID
@api_view(['GET'])
@permission_classes([AllowAny])
def perfil_medico(request):
    id_medico = request.GET.get('id')
    if not id_medico:
        return Response({'error': 'ID no proporcionado'}, status=400)

    try:
        medico = Medico.objects.select_related('especialidad').get(id_med=id_medico)
        data = {
            'nombre': medico.nombre,
            'apellido': medico.apellido,
            'email': medico.email,
            'est_med': medico.est_med,
            'especialidad': medico.especialidad.nombre if medico.especialidad else 'No especificada'
        }
        return Response(data)
    except Medico.DoesNotExist:
        return Response({'error': 'Médico no encontrado'}, status=404)

# Vista HTML (ej: historial médico)
def historial_medico_view(request):
    return render(request, 'historial_medico.html')
