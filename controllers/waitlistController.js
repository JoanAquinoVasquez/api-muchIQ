const Waitlist = require('../models/Waitlist');
const { sendWaitlistConfirmation } = require('../services/emailService');

exports.joinWaitlist = async (req, res) => {
    try {
        const { email, name } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'El correo electrónico es requerido' });
        }

        if (!name) {
            return res.status(400).json({ message: 'El nombre es obligatorio para unirse a la lista' });
        }

        // Verificar si ya existe
        const existing = await Waitlist.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'Este correo ya está registrado en la lista de espera.' });
        }

        const newEntry = new Waitlist({
            email,
            name
        });

        await newEntry.save();

        // Enviar correo de confirmación (asíncrono)
        sendWaitlistConfirmation(email, name);

        res.status(201).json({
            message: '¡Genial! Te has unido con éxito a la lista de espera.',
            entry: newEntry
        });

    } catch (error) {
        console.error('Error in joinWaitlist:', error);
        res.status(500).json({ message: 'Error interno al unirse a la lista de espera' });
    }
};
