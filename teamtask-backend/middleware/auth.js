// backend/middleware/auth.js

const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérifiez que l'utilisateur existe toujours en base
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    console.error('Erreur auth middleware:', err);
    res.status(401).send({ message: 'Token invalide' });
  }
};
console.log('Received token:', token);
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('Decoded token:', decoded);
  // ...
} catch (err) {
  console.error('Token verification error:', err);
  // ...
}