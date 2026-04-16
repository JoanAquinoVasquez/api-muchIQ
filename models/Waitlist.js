const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'El correo electrónico es obligatorio'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingrese un correo válido']
    },
    name: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'notified'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Waitlist', waitlistSchema);
