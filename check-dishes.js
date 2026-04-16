const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Place = require('./models/Place');
const Dish = require('./models/Dish');

dotenv.config();

connectDB().then(async () => {
    try {
        console.log('Consultando la base de datos...');
        const dishes = await Dish.find();
        
        let assignedPlaceIds = new Set();
        for (let d of dishes) {
            for (let p of d.recommendedPlaces) {
                assignedPlaceIds.add(p.toString());
            }
        }

        const allRestaurants = await Place.find({ category: { $regex: /restaurante/i } });
        
        let withoutDishes = [];
        for (let r of allRestaurants) {
            if (!assignedPlaceIds.has(r._id.toString())) {
                withoutDishes.push(r.name);
            }
        }

        console.log(`=================================================`);
        console.log(`Total Restaurantes: ${allRestaurants.length}`);
        console.log(`Total Platos: ${dishes.length}`);
        console.log(`Restaurantes SIN platos asignados: ${withoutDishes.length}`);
        console.log(`=================================================`);
        
        if (withoutDishes.length > 0) {
            console.log("Ejemplos de restaurantes sin platos:", withoutDishes.slice(0, 10));
        }
    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit(0);
    }
});
