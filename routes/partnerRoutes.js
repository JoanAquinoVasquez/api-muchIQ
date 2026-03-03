const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, partnerController.createPartner);
router.get('/', partnerController.getPartners);

module.exports = router;