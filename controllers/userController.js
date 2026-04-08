const User = require("../models/User"); // Importa el modelo
const jwt = require("jsonwebtoken"); // Importa jsonwebtoken
const Place = require("../models/Place"); // <-- ¡AÑADE ESTA LÍNEA!

// Función para generar un Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d", // El token expira en 30 días
    });
};

// --- Controlador de Registro ---
exports.registerUser = async (req, res) => {
    try {
        // 1. Obtener datos del body
        const {
            username,
            email,
            password,
            isTourist,
            reasonForVisit,
            tastes,
            stayEndDate,
        } = req.body;

        // 2. Verificar si el usuario (email) ya existe
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res
                .status(400)
                .json({ message: "El correo electrónico ya está registrado" });
        }

        // 3. Crear el nuevo usuario
        const user = new User({
            username,
            email,
            password, // La contraseña se encriptará automáticamente gracias al .pre('save')
            isTourist,
            reasonForVisit,
            tastes,
            stayEndDate: isTourist && stayEndDate ? new Date(stayEndDate) : null,
        });

        // 4. Guardar el usuario en la DB
        const savedUser = await user.save();

        // 5. Crear y devolver un token (para que inicie sesión automáticamente)
        if (savedUser) {
            res.status(201).json({
                message: "Usuario registrado con éxito",
                _id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
                token: generateToken(savedUser._id),
            });
        } else {
            res.status(400).json({ message: "Datos de usuario inválidos" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};

// --- Controlador de Login ---
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        let formattedStayEndDate = null;

        if (user.stayEndDate) {
            formattedStayEndDate = new Date(user.stayEndDate)
                .toISOString()
                .split("T")[0];
        }

        if (user && (await user.matchPassword(password))) {

            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                points: user.points,
                token: generateToken(user._id),
                isTourist: user.isTourist,
                stayEndDate: formattedStayEndDate,
            });
        } else {
            res.status(401).json({ message: "Correo o contraseña inválidos" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = req.user;

        const visitedPlaces = await Place.find({ "reviews.user": user._id }).select(
            "name category photos"
        );

        let formattedStayEndDate = null;

        if (user.stayEndDate) {
            formattedStayEndDate = new Date(user.stayEndDate)
                .toISOString()
                .split("T")[0];
        }
        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            points: user.points,
            tastes: user.tastes,
            isTourist: user.isTourist,
            stayEndDate: formattedStayEndDate,
            visitedPlaces: visitedPlaces,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};

// --- Controlador Obtener Perfil (GET) - Alternativo ---
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor al obtener perfil' });
    }
};

// --- Controlador Actualizar Perfil (PUT) ---
exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.username = req.body.username || user.username;
            // No permitimos cambiar email por ahora por seguridad
            if (req.body.isTourist !== undefined) {
                user.isTourist = req.body.isTourist;
            }
            if (req.body.tastes) {
                user.tastes = req.body.tastes;
            }

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                isTourist: updatedUser.isTourist,
                tastes: updatedUser.tastes,
                points: updatedUser.points,
                token: generateToken(updatedUser._id), // Devuelve token nuevo por si acaso
            });
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor al actualizar perfil' });
    }
};
