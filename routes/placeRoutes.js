const express = require('express');
const router = express.Router();
const placeController = require('../controllers/placeController');
const { protect } = require('../middleware/authMiddleware');

// Ruta para obtener todos los lugares (con filtros)
// GET /api/places
router.get('/', placeController.getPlaces);

// GET /api/places/:id (Obtener detalles de UN lugar)
router.get('/:id', placeController.getPlaceById);

// GET /api/places/:id/dishes (Obtener platos que ofrecen este lugar)
router.get('/:id/dishes', placeController.getPlaceDishes);

// Rutas Protegidas
// Ruta para crear un nuevo lugar
// POST /api/places
router.post('/', protect, placeController.createPlace);

// POST /api/places/:id/reviews (Crear reseña y ganar puntos)
router.post('/:id/reviews', protect, placeController.createPlaceReview);

// PUT /api/places/:id (Actualizar datos de un lugar)
router.put('/:id', protect, placeController.updatePlace);

module.exports = router;