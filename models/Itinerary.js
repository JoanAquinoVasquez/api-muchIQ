const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
  time: String,
  placeName: String,
  description: String,
  address: String,
  category: String,
});

const DaySchema = new mongoose.Schema({
  dayNumber: Number,
  title: String,
  activities: [ActivitySchema],
});

const ItinerarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  days: [DaySchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Itinerary", ItinerarySchema);
