const mongoose = require('mongoose');
require('dotenv').config(); // Carga las variables de .env

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Conectado... 🚀');
  } catch (err) {
    console.error(err.message);
    // Salir del proceso con error
    process.exit(1);
  }
};

module.exports = connectDB;