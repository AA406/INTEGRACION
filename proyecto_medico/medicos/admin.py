from django.contrib import admin
from .models import Medico, Especialidad, Permiso, Administrador, ObservacionesMedico

admin.site.register(Medico)
admin.site.register(Especialidad)
admin.site.register(Permiso)
admin.site.register(Administrador)
admin.site.register(ObservacionesMedico)
