import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import Post from '../models/postModel.js'; 

// @route   GET /api/posts
// @desc    Fetch all posts
// @access  Public
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find({}) //Find all posts
        .populate('author', 'name') //Populate author field with user's name
        .sort({ createdAt: -1 }); //Sort by newest first
        
        res.json(posts); //Send posts as JSON response
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', protect, async (req, res) => {
  // How this works:
  // - The request first hits 'protect'.
  // - If the token is valid, 'protect' adds 'req.user'
  // - Then, it calls 'next()' to run this async function.

  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).send('Please add a title and content');
    }

    const post = new Post({
      title,
      content,
      author: req.user._id, // <-- We get this from the 'protect' middleware!
    });

    const createdPost = await post.save();
    res.status(201).json(createdPost);

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

export default router;