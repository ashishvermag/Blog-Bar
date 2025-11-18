import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// This function will be our middleware
const protect = async (req, res, next) => {
  let token;

  // 1. Check if the request has a 'cookie' header
  //    (We will store our token in a cookie soon, it's more secure)
  //    For now, we'll also check the 'Authorization' header.
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Get the token from the header (e.g., "Bearer 123xyz...")
      token = req.headers.authorization.split(' ')[1];

      // 3. Verify the token using our JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Find the user by the ID that was stored in the token
      //    We select '-password' to exclude the password from the user object
      req.user = await User.findById(decoded.id).select('-password');

      // 5. Move on to the next function (the actual route handler)
      next();

    } catch (error) {
      console.error(error);
      res.status(401).send('Not authorized, token failed');
      return;
    }
  }

  if (!token) {
    res.status(401).send('Not authorized, no token');
  }
};

export { protect };