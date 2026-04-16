const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

// Inicializar Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// --- RUTAS ---
app.get('/', (req, res) => {
  res.json({ message: '¡MuchIQ API está operativa! 🚀' });
});

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const placeRoutes = require('./routes/placeRoutes');
app.use('/api/places', placeRoutes);

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

const waitlistRoutes = require('./routes/waitlistRoutes');
app.use('/api/waitlist', waitlistRoutes);

// --- MANEJO DE ERRORES (JSON Always) ---

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        message: `La ruta ${req.originalUrl} no existe en este servidor.`,
        error: "Not Found"
    });
});

// Error global handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// --- Iniciar Servidor ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});