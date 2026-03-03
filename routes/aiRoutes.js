const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware'); // ¡Importar el middleware!

// Ruta para obtener una recomendación de la IA
// POST /api/ai/recommend
router.post('/recommend', protect, aiController.getAIRecommendation);

module.exports = router;