import React, { useState } from 'react';
import ReactQuill from 'react-quill-new'; // 1. Import from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'; // 2. Import the CSS from 'react-quill-new'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreatePostPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); 

  const navigate = useNavigate();

  const {userInfo} = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
    // Prepare the config with the authorization header
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    // Send POST request to create a new post
    await axios.post('/api/posts', { title, content }, config);

    // Redirect to home page after successful post creation
    navigate('/');

    
    } catch (error) {
      console.error('Error creating post:', error.response?.data || error.message);
      alert('Failed to create post. Please try again.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="p-8 bg-gray-800 shadow-md rounded-lg">
        <h1 className="text-3xl font-bold text-center text-white mb-6">
          Create a New Post
        </h1>
        
        <form onSubmit={handleSubmit}>
          {/* Title Field */}
          <div className="mb-6">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Post Title
            </label>
            <input
              type="text"
              id="title"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Content Field (Rich Text Editor) */}
          <div className="mb-6">
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Content
            </label>
            {/* 3. This ReactQuill component now comes from the new package */}
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              className="bg-white text-gray-900 rounded-md"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Create Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePostPage;