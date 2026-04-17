const Itinerary = require("../models/Itinerary");

// Guardar un itinerario
exports.saveItinerary = async (req, res) => {
  try {
    const { title, description, days } = req.body;
    const userId = req.user._id;

    if (!title || !days || !Array.isArray(days)) {
      return res.status(400).json({ message: "Datos de itinerario incompletos" });
    }

    const newItinerary = new Itinerary({
      userId,
      title,
      description,
      days,
    });

    await newItinerary.save();

    res.status(201).json({
      message: "Itinerario guardado con éxito",
      itinerary: newItinerary,
    });
  } catch (error) {
    console.error("Error al guardar itinerario:", error);
    res.status(500).json({ message: "Error al guardar el itinerario" });
  }
};

// Obtener mis itinerarios
exports.getMyItineraries = async (req, res) => {
  try {
    const userId = req.user._id;
    const itineraries = await Itinerary.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json(itineraries);
  } catch (error) {
    console.error("Error al obtener itinerarios:", error);
    res.status(500).json({ message: "Error al obtener tus itinerarios" });
  }
};

// Eliminar un itinerario
exports.deleteItinerary = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const itinerary = await Itinerary.findOneAndDelete({ _id: id, userId });

    if (!itinerary) {
      return res.status(404).json({ message: "Itinerario no encontrado o no tienes permiso" });
    }

    res.status(200).json({ message: "Itinerario eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar itinerario:", error);
    res.status(500).json({ message: "Error al eliminar el itinerario" });
  }
};
