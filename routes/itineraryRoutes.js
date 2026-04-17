const express = require("express");
const router = express.Router();
const itineraryController = require("../controllers/itineraryController");
const auth = require("../middleware/auth"); // Asumiendo que existe un middleware de auth

// Todas las rutas de itinerarios requieren autenticación
router.post("/", auth, itineraryController.saveItinerary);
router.get("/", auth, itineraryController.getMyItineraries);
router.delete("/:id", auth, itineraryController.deleteItinerary);

module.exports = router;
