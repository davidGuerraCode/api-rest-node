const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Por convención el token se pasa a través del header
    const decoded = jwt.verify(token, process.env.JWT_KEY); // Verificamos la validez del token y se devuelve valor decodificado
    req.userData = decoded; // Añadimos un nuevo campo a nuestra solicitud (req).
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Falló la autenticación!'
    });
  }
};
