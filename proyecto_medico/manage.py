#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

# Configurar entorno para Oracle Wallet
os.environ['TNS_ADMIN'] = 'D:/Wallet_INTPLAT'
os.environ['PATH'] += ';D:/instantclient-basic-windows.x64-23.8.0.25.04/instantclient_23_8'

# Activar cliente thick de Oracle (requerido para conexión segura con Wallet)
try:
    import oracledb
    oracledb.init_oracle_client(lib_dir="D:/instantclient-basic-windows.x64-23.8.0.25.04/instantclient_23_8")
except Exception as e:
    print(f"❌ Error inicializando Oracle Client: {e}")
    sys.exit(1)

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'proyecto_medico.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
