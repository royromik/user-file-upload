const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');

exports.protect = async (req, res, next) => {
  let token = req.headers.authorization;
  if (!token) return res.status(401).json({ msg: 'Not authorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId);
    if (!req.user) return res.status(401).json({ msg: 'Not authorized' });
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
