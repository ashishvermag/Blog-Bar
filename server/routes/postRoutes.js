import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import Post from '../models/postModel.js'; 
import mongoose from 'mongoose';

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

// @route   GET /api/posts/:id
// @desc    Fetch a single post by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    // Get the ID from the URL parameters
    const postId = req.params.id;
    
    // Find the post by ID, and populate the author details
    const post = await Post.findById(postId)
      .populate('author', 'name'); // Populate the author's name

    if (post) {
      res.json(post);
    } else {
      res.status(404).send('Post not found');
    }
  } catch (error) {
    console.error(error);
    // Handle possible errors (e.g., invalid MongoDB ID format)
    res.status(500).send('Server error or invalid ID format');
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

// @route   PUT /api/posts/:id
// @desc    Update a post by ID (Author only)
// @access  Private
router.put('/:id', protect, async (req, res) => {
  const { title, content } = req.body;
  const postId = req.params.id;

  // Validate post ID format
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).send('Invalid Post ID format');
  }

  try {
    const post = await Post.findById(postId);

    if (post) {
      // **AUTHORIZATION CHECK**
      // post.author is an ObjectId, req.user._id is an ObjectId.
      // We must convert them to strings for reliable comparison.
      if (post.author.toString() !== req.user._id.toString()) {
        return res.status(401).send('Not authorized to update this post');
      }

      // Update fields
      post.title = title || post.title;
      post.content = content || post.content;

      const updatedPost = await post.save();
      res.json(updatedPost);
    } else {
      res.status(404).send('Post not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post by ID (Author only)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  const postId = req.params.id;
  
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).send('Invalid Post ID format');
  }

  try {
    const post = await Post.findById(postId);

    if (post) {
      // **AUTHORIZATION CHECK**
      if (post.author.toString() !== req.user._id.toString()) {
        return res.status(401).send('Not authorized to delete this post');
      }

      // Delete the post
      await Post.deleteOne({ _id: postId });
      res.json({ message: 'Post removed' });
    } else {
      res.status(404).send('Post not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

export default router;