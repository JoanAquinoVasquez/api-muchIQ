const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Importamos el controlador
const { protect } = require('../middleware/authMiddleware'); // Importar el middleware

// Ruta para el registro
// POST /api/users/register
router.post('/register', userController.registerUser);

// Ruta para el login
// POST /api/users/login
router.post('/login', userController.loginUser);

// Rutas de perfil (Protegidas)
router.route('/profile')
    .get(protect, userController.getProfile) // Usando la función enriquecida original (getProfile en vez de getUserProfile)
    .put(protect, userController.updateUserProfile);

module.exports = router;