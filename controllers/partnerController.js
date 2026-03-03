const Partner = require('../models/Partner');

// --- Controlador para CREAR un aliado (para admin) ---
exports.createPartner = async (req, res) => {
  try {
    const { name, category, address, longitude, latitude } = req.body;
    const location = { type: 'Point', coordinates: [longitude, latitude] };

    const partner = new Partner({ name, category, address, location });
    const savedPartner = await partner.save();
    res.status(201).json(savedPartner);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// --- Controlador para OBTENER todos los aliados (cercanos) ---
exports.getPartners = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    let filter = {};

    if (lat && lng && radius) {
      const radiusInMeters = parseFloat(radius) * 1000;
      filter.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: radiusInMeters
        }
      };
    }

    const partners = await Partner.find(filter);
    res.status(200).json(partners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};