import jwt from 'jsonwebtoken';

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId }, // Payload containing the user ID
    process.env.JWT_SECRET, // This is our secret key
    {
      expiresIn: '30d', // Set the token to expire in 30 days
    }
  );
};

export default generateToken;