const express = require('express');
const router = express.Router();
const waitlistController = require('../controllers/waitlistController');

// @route   POST api/waitlist/join
// @desc    Register a new email in the waitlist
// @access  Public
router.post('/join', waitlistController.joinWaitlist);

module.exports = router;
