const Place = require('../models/Place');
const Dish = require('../models/Dish');

// --- Controlador para OBTENER Lugares Populares o Cercanos ---
exports.getPopularPlaces = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const maxDistance = 50000; // 50 km de rango máximo para descubrimiento

      const topPlaces = await Place.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [longitude, latitude] },
            distanceField: 'distance',
            spherical: true,
            maxDistance: maxDistance,
            distanceMultiplier: 0.001 // Se mostrará en kilómetros si distance >= 1 en el frontend
          }
        },
        { $limit: 10 },
        { $project: { name: 1, category: 1, rating: 1, numReviews: 1, photos: 1, distance: 1 } }
      ]);

      return res.status(200).json(topPlaces);
    } else {
      // Fallback si no hay ubicación: lugares de todo Lambayeque más puntuados
      const minReviews = 100;
      const topPlaces = await Place.find({
        numReviews: { $gt: minReviews }
      })
        .sort({ rating: -1, numReviews: -1 })
        .limit(10)
        .select('name category rating numReviews photos');

      return res.status(200).json(topPlaces);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// --- Controlador para OBTENER Platos Populares ---
exports.getPopularDishes = async (req, res) => {
  try {
    // Buscamos los 10 platos con más likes
    const topDishes = await Dish.find({})
                                .sort({ likes: -1 }) 
                                .limit(10)
                                .select('name imageUrl likes');

    res.status(200).json(topDishes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};