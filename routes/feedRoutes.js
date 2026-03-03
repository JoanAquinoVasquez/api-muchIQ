const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');

// Ruta para ver los lugares más populares
// GET /api/feed/popular-places
router.get('/popular-places', feedController.getPopularPlaces);

// Ruta para ver los platos más populares
// GET /api/feed/popular-dishes
router.get('/popular-dishes', feedController.getPopularDishes);

module.exports = router;