from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Simulación de comentarios
comentarios = [
    {"paciente": "Marcela Silva", "comentario": "Gracias por resolver mis dudas con claridad y amabilidad.", "fecha": "2025-05-06"},
    {"paciente": "Ricardo Soto", "comentario": "Muy buena atención. Me sentí escuchado.", "fecha": "2025-05-05"},
    {"paciente": "Lucía Fernández", "comentario": "Gracias por tu dedicación, excelente profesional.", "fecha": "2025-05-03"},
    {"paciente": "Carlos Núñez", "comentario": "Explicó todo con paciencia, lo recomiendo mucho.", "fecha": "2025-05-02"}
]

# Simulación de solicitudes de permiso
solicitudes = []

@app.route("/api/comentarios")
def obtener_comentarios():
    return jsonify(comentarios)

@app.route("/api/solicitar_permiso", methods=["POST"])
def solicitar_permiso():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Datos no recibidos"}), 400

    # Simula guardar la solicitud
    solicitudes.append({
        "nombre": data.get("nombre"),
        "fecha_inicio": data.get("fecha_inicio"),
        "fecha_fin": data.get("fecha_fin"),
        "motivo": data.get("motivo")
    })

    print("Solicitud de permiso recibida:", data)
    return jsonify({"mensaje": "Solicitud recibida correctamente"}), 200

@app.route("/api/solicitudes", methods=["GET"])
def listar_solicitudes():
    return jsonify(solicitudes)

if __name__ == "__main__":
    app.run(debug=True)
