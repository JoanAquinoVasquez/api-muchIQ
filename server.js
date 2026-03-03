const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); // Importa la conexión a la DB

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

// Inicializar Express
const app = express();

// Middlewares (funciones que se ejecutan en cada petición)
app.use(cors()); // Permite peticiones de otros dominios (tu app móvil)
app.use(express.json()); // Permite a express entender JSON

// --- RUTAS ---
// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡API de Hackaton lista!');
});

const userRoutes = require('./routes/userRoutes'); // Importa las rutas de usuario
app.use('/api/users', userRoutes); // Usa las rutas en /api/users

const authRoutes = require('./routes/authRoutes'); // Importa las rutas de auth
app.use('/api/auth', authRoutes); // Usa las rutas en /api/auth

const placeRoutes = require('./routes/placeRoutes'); // Importa las rutas de lugares
app.use('/api/places', placeRoutes); // Usa las rutas en /api/places

const partnerRoutes = require('./routes/partnerRoutes');
app.use('/api/partners', partnerRoutes);

const rewardRoutes = require('./routes/rewardRoutes');
app.use('/api/rewards', rewardRoutes);

const dishRoutes = require('./routes/dishRoutes');
app.use('/api/dishes', dishRoutes);

const feedRoutes = require('./routes/feedRoutes');
app.use('/api/feed', feedRoutes);

const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', aiRoutes);

// --- Iniciar Servidor ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});