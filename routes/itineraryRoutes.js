const express = require("express");
const router = express.Router();
const itineraryController = require("../controllers/itineraryController");
const { protect } = require("../middleware/authMiddleware");

// Todas las rutas de itinerarios requieren autenticación
router.post("/", protect, itineraryController.saveItinerary);
router.get("/", protect, itineraryController.getMyItineraries);
router.delete("/:id", protect, itineraryController.deleteItinerary);

module.exports = router;
