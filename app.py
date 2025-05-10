from flask import Flask, jsonify
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

@app.route("/api/comentarios")
def obtener_comentarios():
    return jsonify(comentarios)

if __name__ == "__main__":
    app.run(debug=True)
