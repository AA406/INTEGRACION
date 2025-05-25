from rest_framework import serializers
from .models import Medico, Especialidad, Permiso, Administrador, ObservacionesMedico

class EspecialidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Especialidad
        fields = '__all__'

class MedicoSerializer(serializers.ModelSerializer):
    especialidad = EspecialidadSerializer(read_only=True)
    ESPECIALIDAD_id_especialidad = serializers.PrimaryKeyRelatedField(
        queryset=Especialidad.objects.all(), write_only=True, source='especialidad'
    )

    class Meta:
        model = Medico
        fields = [
            'id_med', 'rut', 'nombre', 'apellido', 'email', 'est_med',
            'especialidad', 'ESPECIALIDAD_id_especialidad'
        ]

class PermisoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permiso
        fields = ['id_permiso', 'tipo', 'fecha_inicio', 'fecha_fin', 'estado', 'medico']

class AdministradorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Administrador
        fields = '__all__'

class ObservacionesMedicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObservacionesMedico
        fields = '__all__'
