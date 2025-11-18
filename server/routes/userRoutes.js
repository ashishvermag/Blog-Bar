import express from 'express';
const router = express.Router();
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';

// @route   POST /api/users
// @desc    Register a new user
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name , email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    // Check for existing user
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    //Password hashing before saving the user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({ 
      name, 
      email, 
      password: hashedPassword
    });

    // Save user to database
    const createdUser = await newUser.save();

    // Return user data (excluding password) if creation was successful
    if(createdUser){

      const token = generateToken(createdUser._id);
      res.status(201).json({
        _id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        token
      });
    }
    else{
      res.status(400).json({ msg: 'Invalid user data' });
    }

  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }

  
});

//Login Route
// @route   POST /api/users/login
// @access  Public
// @desc    Authenticate user and get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    // Check for user
    const user = await User.findOne({ email });

    // Validate password
    if (user && (await bcrypt.compare(password, user.password))) {
      
      // Generate token for authenticated user
      const token = generateToken(user._id);

      // Return user data along with token if authentication is successful
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token,
      });
    } 
    else { // Invalid credentials
      res.status(401).json({ msg: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

export default router;