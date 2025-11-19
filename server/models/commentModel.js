import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId, // The post this comment belongs to
      required: true,
      ref: 'Post', // Links the comment to the specific post
    },
    user: {
      type: mongoose.Schema.Types.ObjectId, // The user who made the comment
      required: true,
      ref: 'User', // Links the comment to the user who wrote it
    },    
    parentComment: { // If null, it's a top-level comment. If set, it's a reply.
      type: mongoose.Schema.Types.ObjectId, // Self-reference to another comment
      ref: 'Comment', // References the Comment collection itself!
      default: null, // Default to null for top-level comments
    },
    // We can add a 'likes' array later if needed
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;