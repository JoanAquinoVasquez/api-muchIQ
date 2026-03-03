const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    user: { // ID del usuario que hizo la reseña
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    name: { // Nombre del usuario
        type: String,
        required: true,
    },
    rating: { // Calificación (1-5)
        type: Number,
        required: true,
    },
    comment: { // Comentario
        type: String,
        required: false, // El comentario es opcional
    },
}, {
    timestamps: true,
});

const PlaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true, // Ej: "restaurante", "museo", "parque", "hotel"
        trim: true,
    },
    address: {
        type: String,
        required: true,
    },
    // ¡Clave para tu app! Usaremos GeoJSON
    location: {
        type: {
            type: String,
            enum: ['Point'], // Solo aceptamos 'Point'
            required: true,
        },
        coordinates: {
            type: [Number], // Formato [longitud, latitud]
            required: true,
        },
    },
    tags: { // Para las recomendaciones de la IA
        type: [String], // Ej: ["historia", "aire libre", "barato", "comida marina"]
        default: [],
    },
    // Aquí podríamos añadir fotos, horarios, etc.
    photos: {
        type: [String], // Array de URLs de imágenes
        default: [],
    },
    reviews: [reviewSchema], // Un array de reseñas

    rating: { // Un promedio de 0 a 5
        type: Number,
        default: 0,
    },
    numReviews: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true // Añade createdAt y updatedAt automáticamente
});

// ¡Importante! Creamos un "índice 2dsphere"
// Esto le dice a MongoDB que trate 'location' como un punto en un mapa
// para poder hacer búsquedas de "cercanía" súper rápido.
PlaceSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Place', PlaceSchema);