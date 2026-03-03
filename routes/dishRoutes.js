const express = require('express');
const router = express.Router();
const dishController = require('../controllers/dishController');
const { protect } = require('../middleware/authMiddleware'); // Importar el middleware

// Rutas públicas
router.get('/', dishController.getDishes);
router.get('/:id', dishController.getDishById);

// Rutas de "Admin" (idealmente protegidas por un rol de admin)
router.post('/', dishController.createDish);
router.post('/bulk', dishController.createManyDishes);
// Ruta de usuario (protegida)
router.post('/:id/like', protect, dishController.likeDish);

module.exports = router;