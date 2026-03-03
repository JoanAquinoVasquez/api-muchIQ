const mongoose = require('mongoose');

const DishSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: false,
  },
  tags: {
    type: [String],
    default: [],
  },
  recommendedPlaces: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Place', 
  }],
  likes: { 
    type: Number,
    default: 0,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Dish', DishSchema);