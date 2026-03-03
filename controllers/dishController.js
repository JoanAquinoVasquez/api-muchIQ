const Dish = require('../models/Dish');
const Place = require('../models/Place'); // Para vincular lugares

// --- Controlador para CREAR un plato (para admin) ---
exports.createDish = async (req, res) => {
  try {
    const { name, description, imageUrl, tags, recommendedPlaces } = req.body;
    
    const dish = new Dish({
      name,
      description,
      imageUrl,
      tags,
      recommendedPlaces
    });

    const savedDish = await dish.save();
    res.status(201).json(savedDish);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// --- Controlador para OBTENER todos los platos ---
exports.getDishes = async (req, res) => {
  try {
    const dishes = await Dish.find({});
    res.status(200).json(dishes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// --- Controlador para OBTENER UN PLATO por ID (con lugares) ---
exports.getDishById = async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id)
                           .populate('recommendedPlaces', 'name address rating');

    if (dish) {
      res.json(dish);
    } else {
      res.status(404).json({ message: 'Plato no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// --- Controlador para DAR LIKE a un plato  ---
exports.likeDish = async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) {
      return res.status(404).json({ message: 'Plato no encontrado' });
    }

    dish.likes += 1;
    await dish.save();

    res.status(200).json({ message: 'Like añadido', likes: dish.likes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};


// Función para crear VARIOS platos (carga masiva)
exports.createManyDishes = async (req, res) => {
  try {
    const dishes = req.body;

    if (!Array.isArray(dishes) || dishes.length === 0) {
      return res.status(400).json({ message: 'El cuerpo de la petición debe ser un arreglo de platos.' });
    }

    const savedDishes = await Dish.insertMany(dishes);
    
    res.status(201).json(savedDishes);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor al crear varios platos', details: error.message });
  }
};