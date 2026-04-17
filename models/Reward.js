const mongoose = require('mongoose');

const RewardSchema = new mongoose.Schema({
  name: { // Ej: "Café Americano Gratis"
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  pointsCost: { // Cuántos puntos cuesta
    type: Number,
    required: true,
  },
  partner: { // El ID del aliado que ofrece esta recompensa
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Partner',
  },
  stock: { // Cuántas de estas recompensas quedan (opcional)
    type: Number,
    default: 999, // 999 para "ilimitado" por ahora
  },
  discount: { // Porcentaje de descuento exacto o descripción de oferta
    type: String,
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Reward', RewardSchema);