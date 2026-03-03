const mongoose = require('mongoose');

const PartnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  category: {
    type: String,
    required: true, // Ej: "restaurante", "tienda", "cafeteria"
  },
  address: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number], // [longitud, latitud]
      required: true,
    },
  },
}, {
  timestamps: true
});

PartnerSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Partner', PartnerSchema);