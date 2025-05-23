const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const oracledb = require('oracledb');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Servir archivos estáticos desde la carpeta "html"
app.use(express.static(path.join(__dirname, '../dist')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use(express.static(path.join(__dirname, '../html')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../html/inicio/auth-login-basic.html'));
});

// Conexión a Oracle Wallet
async function conectarOracle() {
  try {
        const oracledb = require('oracledb');

        oracledb.initOracleClient({
        libDir: "D:\\instantclient-basic-windows.x64-23.8.0.25.04\\instantclient_23_8",
        configDir: "D:\\Wallet_INTPLAT"
    });


    const connection = await oracledb.getConnection({
      user: "application",
      password: "Integracion.1234567890",
      connectString: "intplat_high"
    });



    console.log("Conectado a Oracle Database.");
    global.oracleConnection = connection;
  } catch (err) {
    console.error("Error al conectar con Oracle:", err.message);
  }
}

conectarOracle();

async function insertarDatosDePrueba() {
  try {
    // Insertar Médico de prueba
    await global.oracleConnection.execute(
      `INSERT INTO MEDICO (id_med, rut, nombre, apellido, email, est_med, ESPECIALIDAD_id_especialidad)
       VALUES (:id, :rut, :nombre, :apellido, :email, :estado, :especialidad)`,
      {
        id: 1,
        rut: 'med123', // será la contraseña
        nombre: 'Juan',
        apellido: 'Prueba',
        email: 'medico@test.com',
        estado: 'activo',
        especialidad: 1 // asegúrate que existe
      },
      { autoCommit: true }
    );

    // Insertar Administrador de prueba
    await global.oracleConnection.execute(
      `INSERT INTO ADMINISTRADOR (id_administrador, rut, email, nombre)
       VALUES (:id, :rut, :email, :nombre)`,
      {
        id: 1,
        rut: 'admin123', // será la contraseña
        email: 'admin@test.com',
        nombre: 'Admin'
      },
      { autoCommit: true }
    );

    console.log('Médico y Administrador insertados correctamente.');
  } catch (error) {
    console.error('Error al insertar datos de prueba:', error.message);
  }
}

// Esperar a que la conexión se establezca antes de insertar
setTimeout(insertarDatosDePrueba, 2000); // Ajusta si la conexión demora más

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Primero intenta encontrar al usuario en MEDICO
    let result = await global.oracleConnection.execute(
      `SELECT id_med AS id, nombre, email, 'medico' AS rol
       FROM MEDICO
       WHERE email = :email AND rut = :password`,
      [email, password],
      { outFormat: oracledb.OBJECT }
    );

    if (result.rows.length > 0) {
      return res.json(result.rows[0]);
    }

    // Si no lo encuentra, intenta con ADMINISTRADOR
    result = await global.oracleConnection.execute(
      `SELECT id_administrador AS id, nombre, email, 'admin' AS rol
       FROM ADMINISTRADOR
       WHERE email = :email AND rut = :password`,
      [email, password],
      { outFormat: oracledb.OBJECT }
    );

    if (result.rows.length > 0) {
      return res.json(result.rows[0]);
    }

    // Si no se encontró en ninguna tabla
    res.status(401).json({ message: 'Credenciales inválidas' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// ------------------------------------
// RUTAS PARA TABLA MEDICO
// ------------------------------------

// Obtener todos los médicos
app.get('/medicos', async (req, res) => {
  try {
    const result = await global.oracleConnection.execute(
      `SELECT id_med, rut, nombre, apellido, email, est_med, ESPECIALIDAD_id_especialidad FROM MEDICO`,
      [],
      { outFormat: oracledb.OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener un médico por ID
app.get('/medicos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await global.oracleConnection.execute(
      `SELECT * FROM MEDICO WHERE id_med = :id`,
      [id],
      { outFormat: oracledb.OBJECT }
    );
    res.json(result.rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear nuevo médico
app.post('/medicos', async (req, res) => {
  const { id_med, rut, nombre, apellido, email, est_med, ESPECIALIDAD_id_especialidad } = req.body;
  try {
    await global.oracleConnection.execute(
      `INSERT INTO MEDICO (id_med, rut, nombre, apellido, email, est_med, ESPECIALIDAD_id_especialidad)
       VALUES (:id_med, :rut, :nombre, :apellido, :email, :est_med, :especialidad)`,
      { id_med, rut, nombre, apellido, email, est_med, especialidad: ESPECIALIDAD_id_especialidad },
      { autoCommit: true }
    );
    res.json({ message: 'Médico insertado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar médico existente
app.put('/medicos/:id', async (req, res) => {
  const { id } = req.params;
  const { rut, nombre, apellido, email, est_med, ESPECIALIDAD_id_especialidad } = req.body;
  try {
    await global.oracleConnection.execute(
      `UPDATE MEDICO SET 
        rut = :rut,
        nombre = :nombre,
        apellido = :apellido,
        email = :email,
        est_med = :est_med,
        ESPECIALIDAD_id_especialidad = :especialidad
       WHERE id_med = :id`,
      { rut, nombre, apellido, email, est_med, especialidad: ESPECIALIDAD_id_especialidad, id },
      { autoCommit: true }
    );
    res.json({ message: 'Médico actualizado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar médico
app.delete('/medicos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await global.oracleConnection.execute(
      `DELETE FROM MEDICO WHERE id_med = :id`,
      [id],
      { autoCommit: true }
    );
    res.json({ message: 'Médico eliminado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

// -----------------------------
// RUTAS PARA TABLA PERMISOS
// -----------------------------

// Obtener todos los permisos
app.get('/permisos', async (req, res) => {
  try {
    const result = await global.oracleConnection.execute(
      `SELECT id_permiso, tipo, TO_CHAR(fecha_inicio, 'YYYY-MM-DD') AS fecha_inicio,
              TO_CHAR(fecha_fin, 'YYYY-MM-DD') AS fecha_fin, estado, MEDICO_id_med
       FROM PERMISOS`,
      [],
      { outFormat: oracledb.OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener permiso por ID
app.get('/permisos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await global.oracleConnection.execute(
      `SELECT * FROM PERMISOS WHERE id_permiso = :id`,
      [id],
      { outFormat: oracledb.OBJECT }
    );
    res.json(result.rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear nuevo permiso
app.post('/permisos', async (req, res) => {
  const { id_permiso, tipo, fecha_inicio, fecha_fin, estado, MEDICO_id_med } = req.body;
  try {
    await global.oracleConnection.execute(
      `INSERT INTO PERMISOS (id_permiso, tipo, fecha_inicio, fecha_fin, estado, MEDICO_id_med)
       VALUES (:id_permiso, :tipo, TO_DATE(:fecha_inicio, 'YYYY-MM-DD'), TO_DATE(:fecha_fin, 'YYYY-MM-DD'), :estado, :medico)`,
      { id_permiso, tipo, fecha_inicio, fecha_fin, estado, medico: MEDICO_id_med },
      { autoCommit: true }
    );
    res.json({ message: 'Permiso creado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar permiso existente
app.put('/permisos/:id', async (req, res) => {
  const { id } = req.params;
  const { tipo, fecha_inicio, fecha_fin, estado, MEDICO_id_med } = req.body;
  try {
    await global.oracleConnection.execute(
      `UPDATE PERMISOS SET
         tipo = :tipo,
         fecha_inicio = TO_DATE(:fecha_inicio, 'YYYY-MM-DD'),
         fecha_fin = TO_DATE(:fecha_fin, 'YYYY-MM-DD'),
         estado = :estado,
         MEDICO_id_med = :medico
       WHERE id_permiso = :id`,
      { tipo, fecha_inicio, fecha_fin, estado, medico: MEDICO_id_med, id },
      { autoCommit: true }
    );
    res.json({ message: 'Permiso actualizado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar permiso
app.delete('/permisos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await global.oracleConnection.execute(
      `DELETE FROM PERMISOS WHERE id_permiso = :id`,
      [id],
      { autoCommit: true }
    );
    res.json({ message: 'Permiso eliminado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------
// RUTAS PARA TABLA ESPECIALIDAD
// -------------------------------

// Obtener todas las especialidades
app.get('/especialidades', async (req, res) => {
  try {
    const result = await global.oracleConnection.execute(
      `SELECT * FROM ESPECIALIDAD`,
      [],
      { outFormat: oracledb.OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener especialidad por ID
app.get('/especialidades/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await global.oracleConnection.execute(
      `SELECT * FROM ESPECIALIDAD WHERE id_especialidad = :id`,
      [id],
      { outFormat: oracledb.OBJECT }
    );
    res.json(result.rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear nueva especialidad
app.post('/especialidades', async (req, res) => {
  const { id_especialidad, nombre, descripcion } = req.body;
  try {
    await global.oracleConnection.execute(
      `INSERT INTO ESPECIALIDAD (id_especialidad, nombre, descripcion)
       VALUES (:id_especialidad, :nombre, :descripcion)`,
      { id_especialidad, nombre, descripcion },
      { autoCommit: true }
    );
    res.json({ message: 'Especialidad creada correctamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar especialidad
app.put('/especialidades/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;
  try {
    await global.oracleConnection.execute(
      `UPDATE ESPECIALIDAD SET
         nombre = :nombre,
         descripcion = :descripcion
       WHERE id_especialidad = :id`,
      { nombre, descripcion, id },
      { autoCommit: true }
    );
    res.json({ message: 'Especialidad actualizada correctamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar especialidad
app.delete('/especialidades/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await global.oracleConnection.execute(
      `DELETE FROM ESPECIALIDAD WHERE id_especialidad = :id`,
      [id],
      { autoCommit: true }
    );
    res.json({ message: 'Especialidad eliminada correctamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------
// RUTAS PARA TABLA ADMINISTRADOR
// --------------------------------

// Obtener todos los administradores
app.get('/administradores', async (req, res) => {
  try {
    const result = await global.oracleConnection.execute(
      `SELECT * FROM ADMINISTRADOR`,
      [],
      { outFormat: oracledb.OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener administrador por ID
app.get('/administradores/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await global.oracleConnection.execute(
      `SELECT * FROM ADMINISTRADOR WHERE id_administrador = :id`,
      [id],
      { outFormat: oracledb.OBJECT }
    );
    res.json(result.rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear nuevo administrador
app.post('/administradores', async (req, res) => {
  const { id_administrador, rut, email, nombre } = req.body;
  try {
    await global.oracleConnection.execute(
      `INSERT INTO ADMINISTRADOR (id_administrador, rut, email, nombre)
       VALUES (:id_administrador, :rut, :email, :nombre)`,
      { id_administrador, rut, email, nombre },
      { autoCommit: true }
    );
    res.json({ message: 'Administrador creado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar administrador
app.put('/administradores/:id', async (req, res) => {
  const { id } = req.params;
  const { rut, email, nombre } = req.body;
  try {
    await global.oracleConnection.execute(
      `UPDATE ADMINISTRADOR SET
         rut = :rut,
         email = :email,
         nombre = :nombre
       WHERE id_administrador = :id`,
      { rut, email, nombre, id },
      { autoCommit: true }
    );
    res.json({ message: 'Administrador actualizado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar administrador
app.delete('/administradores/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await global.oracleConnection.execute(
      `DELETE FROM ADMINISTRADOR WHERE id_administrador = :id`,
      [id],
      { autoCommit: true }
    );
    res.json({ message: 'Administrador eliminado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------
// RUTAS PARA TABLA OBSERVACIONES_MEDICO
// -------------------------------------------

// Obtener todas las observaciones
app.get('/observaciones', async (req, res) => {
  try {
    const result = await global.oracleConnection.execute(
      `SELECT * FROM OBSERVACIONES_MEDICO`,
      [],
      { outFormat: oracledb.OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener observación por ID
app.get('/observaciones/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await global.oracleConnection.execute(
      `SELECT * FROM OBSERVACIONES_MEDICO WHERE id_observ = :id`,
      [id],
      { outFormat: oracledb.OBJECT }
    );
    res.json(result.rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear nueva observación
app.post('/observaciones', async (req, res) => {
  const { id_observ, medico, observaciones, MEDICO_id_med } = req.body;
  try {
    await global.oracleConnection.execute(
      `INSERT INTO OBSERVACIONES_MEDICO (id_observ, medico, observaciones, MEDICO_id_med)
       VALUES (:id_observ, :medico, :observaciones, :medico_id)`,
      { id_observ, medico, observaciones, medico_id: MEDICO_id_med },
      { autoCommit: true }
    );
    res.json({ message: '✅ Observación registrada correctamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar observación
app.put('/observaciones/:id', async (req, res) => {
  const { id } = req.params;
  const { medico, observaciones, MEDICO_id_med } = req.body;
  try {
    await global.oracleConnection.execute(
      `UPDATE OBSERVACIONES_MEDICO SET
         medico = :medico,
         observaciones = :observaciones,
         MEDICO_id_med = :medico_id
       WHERE id_observ = :id`,
      { medico, observaciones, medico_id: MEDICO_id_med, id },
      { autoCommit: true }
    );
    res.json({ message: '✅ Observación actualizada correctamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar observación
app.delete('/observaciones/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await global.oracleConnection.execute(
      `DELETE FROM OBSERVACIONES_MEDICO WHERE id_observ = :id`,
      [id],
      { autoCommit: true }
    );
    res.json({ message: '🗑️ Observación eliminada correctamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
