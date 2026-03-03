const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Importar el middleware
const userController = require('../controllers/userController'); // Importamos el controlador

// Ruta para el registro
// POST /api/users/register
router.post('/register', userController.registerUser);

// Ruta para el login
// POST /api/users/login
router.post('/login', userController.loginUser);

router.get('/profile', protect, userController.getProfile);

module.exports = router;

// (Aquí pondremos /login, /profile, etc. más adelante)

module.exports = router;