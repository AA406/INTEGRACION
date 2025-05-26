from django.db import models

# Tabla ESPECIALIDAD
class Especialidad(models.Model):
    id_especialidad = models.IntegerField(primary_key=True)
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'ESPECIALIDAD'

# Tabla MEDICO
class Medico(models.Model):
    id_med = models.IntegerField(primary_key=True)
    rut = models.CharField(max_length=50)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    email = models.EmailField()
    est_med = models.CharField(max_length=350)
    especialidad = models.ForeignKey(
        Especialidad,
        on_delete=models.SET_NULL,
        db_column='ESPECIALIDAD_id_especialidad',
        null=True
    )

    class Meta:
        db_table = 'MEDICO'

# Tabla PERMISOS
class Permiso(models.Model):
    id_permiso = models.IntegerField(primary_key=True)
    tipo = models.CharField(max_length=100)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    estado = models.CharField(max_length=350)  # ← CAMBIO AQUÍ
    medico = models.ForeignKey(
        Medico,
        on_delete=models.CASCADE,
        db_column='MEDICO_id_med'
    )

    class Meta:
        db_table = 'PERMISOS'



# Tabla ADMINISTRADOR
class Administrador(models.Model):
    id_administrador = models.IntegerField(primary_key=True)
    rut = models.CharField(max_length=50)
    email = models.EmailField()
    nombre = models.CharField(max_length=100)

    class Meta:
        db_table = 'ADMINISTRADOR'

# Tabla OBSERVACIONES_MEDICO
class ObservacionesMedico(models.Model):
    id_observ = models.IntegerField(primary_key=True)
    medico = models.CharField(max_length=100)
    observaciones = models.TextField()
    medico_fk = models.ForeignKey(
        Medico,
        on_delete=models.CASCADE,
        db_column='MEDICO_id_med'
    )

    class Meta:
        db_table = 'OBSERVACIONES_MEDICO'
