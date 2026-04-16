const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Place = require('./models/Place');
const Dish = require('./models/Dish');

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

const assignDishes = async () => {
  try {
    console.log('Buscando restaurantes y platos...');
    const restaurants = await Place.find({ category: { $regex: /restaurante/i } });
    const dishes = await Dish.find();

    if (restaurants.length === 0) {
      console.log('No se encontraron restaurantes en la base de datos.');
      process.exit();
    }
    if (dishes.length === 0) {
      console.log('No se encontraron platos en la base de datos.');
      process.exit();
    }

    console.log(`Encontrados ${restaurants.length} restaurantes y ${dishes.length} platos.`);

    // Función auxiliar para obtener 3 a 4 índices aleatorios sin repetir
    const getRandomDishes = (dishList) => {
      const count = Math.floor(Math.random() * 2) + 3; // 3 o 4
      const shuffled = [...dishList].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };

    let totalAssignments = 0;

    for (let restaurant of restaurants) {
      const selectedDishes = getRandomDishes(dishes);
      
      for (let dish of selectedDishes) {
        // Asegurarse de que dish.recommendedPlaces es un array
        if (!dish.recommendedPlaces) {
            dish.recommendedPlaces = [];
        }

        // Si el restaurante aún no está en la lista de lugares recomendados del plato
        if (!dish.recommendedPlaces.includes(restaurant._id)) {
          dish.recommendedPlaces.push(restaurant._id);
          await dish.save(); // Guarda el plato actualizado
          totalAssignments++;
        }
      }
      console.log(`- Restaurante "${restaurant.name}" asignado a ${selectedDishes.length} platos.`);
    }

    console.log(`\n¡Proceso finalizado! Se realizaron ${totalAssignments} nuevas asignaciones plato-restaurante.`);
    process.exit();
  } catch (error) {
    console.error('Error al asignar platos:', error);
    process.exit(1);
  }
};

assignDishes();
