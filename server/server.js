const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Aumenta el límite a 10 MB
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true })); // Aumenta el límite para datos codificados en URL

// Servir archivos estáticos desde la carpeta "html"
app.use(express.static(path.join(__dirname, '../html')));

// Base de datos SQLite
const db = new sqlite3.Database('./perfil_medico.db', (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
    }
});

// Crear tabla si no existe
db.run(`
    CREATE TABLE IF NOT EXISTS perfil_medico (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        telefono TEXT,
        edad INTEGER,
        residencia TEXT,
        foto TEXT
    )
`);

// Ruta para la raíz que redirige a "perfil_medico.html"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../html/perfil_medico.html'));
});

// Ruta para obtener el perfil médico
app.get('/perfil', (req, res) => {
    db.get('SELECT * FROM perfil_medico WHERE id = 1', (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(row || {});
        }
    });
});

// Ruta para actualizar el perfil médico
app.post('/perfil', (req, res) => {
    const { nombre, telefono, edad, residencia, foto } = req.body;

    db.run(`
        INSERT INTO perfil_medico (id, nombre, telefono, edad, residencia, foto)
        VALUES (1, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
        nombre = excluded.nombre,
        telefono = excluded.telefono,
        edad = excluded.edad,
        residencia = excluded.residencia,
        foto = excluded.foto
    `, [nombre, telefono, edad, residencia, foto], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: 'Perfil actualizado correctamente.' });
        }
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
