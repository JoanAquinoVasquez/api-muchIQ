const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: false, // Puede ser false si el usuario se registra con OAuth
  },
  isTourist: {
    type: Boolean,
    default: true,
  },
  reasonForVisit: {
    // Solo si es turista
    type: String,
  },
  tastes: {
    // Gustos: ["historia", "playa", "comida marina"]
    type: [String],
    default: [],
  },
  language: {
    type: String,
    default: "es",
  },
  points: {
    type: Number,
    default: 0,
  },
  stayEndDate: {
    type: Date,
    required: false, // Opcional y solo para turistas
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hook (función) que se ejecuta ANTES de guardar un usuario
UserSchema.pre("save", async function (next) {
  // SI la contraseña no se modificó O NO EXISTE, no hagas nada
  if (!this.isModified("password") || !this.password) {
    return next();
  }

  // Si es nueva o se modificó, encriptarla
  try {
    const salt = await bcrypt.genSalt(10); // Genera "sal"
    this.password = await bcrypt.hash(this.password, salt); // Encripta
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
