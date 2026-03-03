const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Importamos el modelo de Usuario

// Middleware para proteger rutas
const protect = async (req, res, next) => {
  let token;

  // 1. Verificar si el token existe en los headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Obtener el token (quitando "Bearer ")
      token = req.headers.authorization.split(' ')[1];

      // 3. Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Buscar al usuario en la DB y adjuntarlo al request (req.user)
      //    Lo adjuntamos SIN la contraseña
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Continuar a la siguiente función (el controlador)
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'No autorizado, token fallido' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'No autorizado, no hay token' });
  }
};

module.exports = { protect };