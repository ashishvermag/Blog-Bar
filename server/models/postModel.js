import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    // This links the post to a specific user
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // This tells Mongoose to look at the 'User' collection
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String, // This will store the rich text (HTML or JSON)
      required: true,
    },
    // We can add more fields later, like featuredImage, tags, etc.
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

const Post = mongoose.model('Post', postSchema);

export default Post;