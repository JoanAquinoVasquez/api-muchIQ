const Place = require('../models/Place');
const Dish = require('../models/Dish');

// --- Controlador para OBTENER Lugares Populares ---
exports.getPopularPlaces = async (req, res) => {
  try {
    // --- ¡NUEVO! ---
    const minReviews = 100; // Por ejemplo, debe tener más de 5 reseñas

    const topPlaces = await Place.find({
      numReviews: { $gt: minReviews } // <-- ¡FILTRO AÑADIDO!
    })
      .sort({ rating: -1, numReviews: -1 }) // Ordena por rating (desc) y luego por nro. de reseñas (desc)
      .limit(10) // Trae solo los 10 primeros
      .select('name category rating numReviews photos');

    res.status(200).json(topPlaces);
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