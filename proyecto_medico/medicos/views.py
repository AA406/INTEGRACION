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

# CRUD automático con ViewSets

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

    def get_queryset(self):
        id_medico = self.request.query_params.get('id_med')
        if id_medico:
            return ObservacionesMedico.objects.filter(medico_fk=id_medico)
        return ObservacionesMedico.objects.all()

# Login (valida email y RUT como contraseña)

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

# Perfil de médico por ID

@api_view(['GET'])
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
