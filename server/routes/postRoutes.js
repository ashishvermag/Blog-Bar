import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import Post from '../models/postModel.js'; 
import mongoose from 'mongoose';
import Comment from '../models/commentModel.js';



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

// @route   POST /api/posts/:id/comments
// @desc    Create a new comment on a post
// @access  Private (User must be logged in)
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const postId = req.params.id;
    const { text, parentComment } = req.body;

    if (!text) {
      return res.status(400).send('Comment text is required.');
    }

    const comment = new Comment({
      text,
      post: postId,
      user: req.user._id, // User ID is attached by the 'protect' middleware
      parentComment: parentComment || null, // Set parentComment if provided
    });

    await comment.save();

    // Populate the user field before sending the response
    const populatedComment = await Comment.findById(comment._id).populate('user', 'name');


    res.status(201).json({ 
      message: 'Comment added successfully!',
      comment: populatedComment, // Send the populated object back
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error while adding comment.');
  }
});

// @route   GET /api/posts/:id/comments
// @desc    Get all comments for a specific post
// @access  Public
// ==========================================
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate('user', 'name') // Populate the commenter's name
      .sort({ createdAt: 1 }); // Sort by oldest first (needed for correct tree building)

    res.json(comments); // Send the flat list of comments

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/posts/comments/:id
// @desc    Edit a comment (Commenter ONLY)
// @access  Private
// ==========================================
router.put('/comments/:id', protect, async (req, res) => {
  try {
    const { text } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).send('Comment not found');
    }

    // ** AUTHORIZATION CHECK (Strict) **
    // Only the user who wrote the comment can edit it
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(401).send('User not authorized to edit this comment');
    }

    // Update and save
    comment.text = text || comment.text;
    await comment.save();

    res.json(comment);

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Recursive function to delete all descendant comments
const deleteDescendants = async (parentId) => {
    const children = await Comment.find({ parentComment: parentId });
    
    // If the comment has children, loop through them
    if (children.length > 0) {
        for (const child of children) {
            // Recursively call this function for the child (deleting all its descendants first)
            await deleteDescendants(child._id); 
            
            // Then delete the child comment itself
            await Comment.deleteOne({ _id: child._id }); 
        }
    }
};

// @route   DELETE /api/posts/comments/:id
// @desc    Delete a comment (Commenter OR Post Author)
// @access  Private
// ==========================================
router.delete('/comments/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).send('Comment not found');
    }

    // We also need to find the POST to see who owns the blog post
    const post = await Post.findById(comment.post);

    // ** AUTHORIZATION CHECK (Mixed) **
    // 1. Is it the Commenter?
    // 2. Is it the Post Author?
    const isCommenter = comment.user.toString() === req.user._id.toString();
    const isPostAuthor = post.author.toString() === req.user._id.toString();

    if (!isCommenter && !isPostAuthor) {
      return res.status(401).send('User not authorized to delete this comment');
    }

    // 1. Start the recursive deletion process
    await deleteDescendants(comment._id);

    // 2. Delete the parent comment itself
    await Comment.deleteOne({ _id: req.params.id });

    res.json({ message: 'Comment removed' });

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/posts/like/:id
// @desc    Toggle like status on a post
// @access  Private (User must be logged in)
router.put('/like/:id', protect, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id; // Get the logged-in user ID from middleware

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).send('Post not found');
    }

    // Check if the user ID is already in the 'likes' array
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      // 1. UNLIKE (Pull the user ID out of the array)
      post.likes.pull(userId);
      res.json({ message: 'Post unliked', likes: post.likes.length });
    } else {
      // 2. LIKE (Push the user ID into the array)
      post.likes.push(userId);
      res.json({ message: 'Post liked', likes: post.likes.length });
    }

    await post.save();

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

export default router;