require('dotenv').config({ override: true });
const express    = require('express');
const bodyParser = require('body-parser');
const cors       = require('cors');
const path       = require('path');
const fs         = require('fs');
const oracledb   = require('oracledb');

// Debug `.env` and wallet
console.log('⛓️ TNS_ADMIN =', process.env.TNS_ADMIN);
console.log('📂 tnsnames.ora existe?', process.env.TNS_ADMIN && fs.existsSync(path.join(process.env.TNS_ADMIN, 'tnsnames.ora')));

const app  = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Static directories
const htmlDir   = path.join(__dirname, '../proyecto_medico/html');
const staticDir = path.join(__dirname, '../proyecto_medico/static');
app.use('/static', express.static(staticDir));
app.use(express.static(htmlDir));

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(htmlDir, 'inicio/auth-login-basic.html'));
});

// Connect to Oracle
async function conectarOracle() {
  try {
    if (process.env.ORACLE_LIB_DIR) {
      oracledb.initOracleClient({
        libDir:    process.env.ORACLE_LIB_DIR,
        configDir: process.env.TNS_ADMIN
      });
    }
    const conn = await oracledb.getConnection({
      user:          process.env.ORACLE_USER,
      password:      process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING
    });
    console.log('✅ Conectado a Oracle');
    global.oracleConnection = conn;
  } catch (err) {
    console.error('❌ Error al conectar con Oracle:', err.message);
    process.exit(1);
  }
}
conectarOracle();

// Insert test data (optional)
async function insertarDatosDePrueba() {
  if (!global.oracleConnection) return;
  try {
    await global.oracleConnection.execute(
      `INSERT /*+ IGNORE_ROW_ON_DUPKEY_INDEX(MEDICO, MEDICO_PK) */ INTO MEDICO
         (id_med, rut, nombre, apellido, email, est_med, ESPECIALIDAD_id_especialidad)
       VALUES (:id, :rut, :nombre, :apellido, :email, :est, :esp)`,
      { id: 999, rut: 'med123', nombre: 'Juan', apellido: 'Prueba', email: 'medico@test.com', est: 1, esp: 1 },
      { autoCommit: true }
    );
    console.log('✅ Médico de prueba insertado');
  } catch (err) {
    console.warn('⚠️ Médico de prueba ya existía');
  }
  try {
    await global.oracleConnection.execute(
      `INSERT /*+ IGNORE_ROW_ON_DUPKEY_INDEX(ADMINISTRADOR, ADMINISTRADOR_PK) */ INTO ADMINISTRADOR
         (id_administrador, rut, email, nombre)
       VALUES (:id, :rut, :email, :nom)`,
      { id: 999, rut: 'admin123', email: 'admin@test.com', nom: 'Admin' },
      { autoCommit: true }
    );
    console.log('✅ Administrador de prueba insertado');
  } catch (err) {
    console.warn('⚠️ Administrador de prueba ya existía');
  }
}
setTimeout(insertarDatosDePrueba, 2000);

// API Routes
// GET /perfil
app.get('/perfil', async (req, res) => {
  try {
    const id = parseInt(req.query.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    const result = await global.oracleConnection.execute(
      `SELECT M.nombre, M.apellido, M.email, M.est_med, E.nombre AS especialidad
       FROM MEDICO M
       LEFT JOIN ESPECIALIDAD E ON M.ESPECIALIDAD_id_especialidad = E.id_especialidad
       WHERE M.id_med = :id`,
      [id], { outFormat: oracledb.OBJECT }
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Médico no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ /perfil error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let result = await global.oracleConnection.execute(
      `SELECT id_med AS id, nombre, email FROM MEDICO WHERE email = :email AND rut = :password`,
      [email, password], { outFormat: oracledb.OBJECT }
    );
    if (result.rows.length) return res.json({ ...result.rows[0], tipo: 'medico' });
    result = await global.oracleConnection.execute(
      `SELECT id_administrador AS id, nombre, email FROM ADMINISTRADOR WHERE email = :email AND rut = :password`,
      [email, password], { outFormat: oracledb.OBJECT }
    );
    if (result.rows.length) return res.json({ ...result.rows[0], tipo: 'admin' });
    res.status(401).json({ message: 'Credenciales inválidas' });
  } catch (err) {
    console.error('❌ /login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /permisos
app.get('/permisos', async (req, res) => {
  try {
    const result = await global.oracleConnection.execute(
      `SELECT id_permiso, tipo,
              TO_CHAR(fecha_inicio,'YYYY-MM-DD') AS fecha_inicio,
              TO_CHAR(fecha_fin,'YYYY-MM-DD')    AS fecha_fin,
              estado, MEDICO_id_med
       FROM PERMISOS`,
      [], { outFormat: oracledb.OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ GET /permisos error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /permisos
app.post('/permisos', async (req, res) => {
  try {
    // Debug: log request body
    console.log('POST /permisos body:', req.body);

    // Extract fields from request
    const { tipo, fecha_inicio, fecha_fin, estado, medico } = req.body;
    if (!medico) {
      return res.status(400).json({ message: 'El campo "medico" es obligatorio' });
    }

    // Generate next ID using MAX+1 (not ideal for concurrency, consider a DB sequence)
    const seqResult = await global.oracleConnection.execute(
      'SELECT NVL(MAX(id_permiso), 0) + 1 AS NEXT_ID FROM PERMISOS',
      [],
      { outFormat: oracledb.OBJECT }
    );
    const nextId = seqResult.rows[0].NEXT_ID;

    // Insert new permiso
    await global.oracleConnection.execute(
      `INSERT INTO PERMISOS (
         id_permiso, tipo, fecha_inicio, fecha_fin, estado, MEDICO_id_med
       ) VALUES (
         :id, :tipo,
         TO_DATE(:fecha_inicio, 'YYYY-MM-DD'),
         TO_DATE(:fecha_fin,    'YYYY-MM-DD'),
         :estado,
         :medico
       )`,
      { id: nextId, tipo, fecha_inicio, fecha_fin, estado, medico },
      { autoCommit: true }
    );

    res.json({ message: 'Permiso creado correctamente', id: nextId });
  } catch (err) {
    console.error('❌ POST /permisos error:', err);
    res.status(500).json({ error: err.message });
  }
});

// TODO: CRUD especialidades, administradores y observaciones y observaciones

// Start server
app.listen(port, () => console.log(`🖥️ Servidor corriendo en http://localhost:${port}`));
