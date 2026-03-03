const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');
const { protect } = require('../middleware/authMiddleware'); // ¡Importar el middleware!

router.post('/', rewardController.createReward);
router.get('/', rewardController.getRewards); // Obtiene todas o filtra por ?partnerId=...

// ¡¡Ruta PROTEGIDA para canjear!!
router.post('/:id/redeem', protect, rewardController.redeemReward);

module.exports = router;