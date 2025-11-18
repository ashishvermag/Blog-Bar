import React, { useState, useRef } from 'react'; // <-- 1. Import useRef
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const CreatePostPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  
  // Create a ref to access the Quill editor instance directly
  const quillRef = useRef(null); // <-- 2. Initialize ref

  // --- IMAGE UPLOAD HANDLER LOGIC ---
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('image', file); // 'image' matches the name in uploadRoutes.js

      try {
        const config = {
          headers: {
            'Content-Type': 'multipart/form-data', // Important for file uploads
            Authorization: `Bearer ${userInfo.token}`, // Token for protected upload route
          },
        };

        // Post the file to our dedicated upload endpoint
        const { data } = await axios.post('/api/upload', formData, config);
        const imageUrl = data; // The server sends back the path: /uploads/filename.jpg

        // Get the current cursor position in the editor
        const editor = quillRef.current.getEditor();
        const range = editor.getSelection(true);
        const index = range ? range.index : 0;
        
        // Insert the image tag with the server-returned URL
        editor.insertEmbed(index, 'image', imageUrl);

      } catch (error) {
        console.error('Image upload failed:', error);
        alert('Image upload failed. Please try again.');
      }
    };
  };

  // --- QUILL MODULES (Toolbar Configuration) ---
  const modules = {
    // 3. Define the toolbar buttons to show
    toolbar: {
      container: [
        [{ header: [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
        ['link', 'image'], // Image button is here
        ['clean'],
      ],
      // 4. Link the built-in 'image' button to our custom logic
      handlers: {
        image: imageHandler,
      },
    },
    clipboard: {
      matchVisual: false,
    },
  };

  // --- SUBMIT HANDLER (Existing Logic) ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Send post creation request
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      // Call the CREATE POST endpoint
      await axios.post(
        '/api/posts',
        { title, content },
        config
      );
      navigate('/');

    } catch (error) {
      console.error('Error creating post:', error.response?.data || error.message);
      alert('Failed to create post');
    }
  };


  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="p-8 bg-gray-800 shadow-md rounded-lg">
        <h1 className="text-3xl font-bold text-center text-white mb-6">
          Create a New Post
        </h1>
        
        <form onSubmit={handleSubmit}>
          {/* Title Field (Unchanged) */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
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

          {/* Content Field (Quill Component Updated) */}
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
              Content
            </label>
            <ReactQuill
              ref={quillRef} // <-- 5. Attach the ref here
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules} // <-- 6. Pass the custom modules
              className="bg-white text-gray-900 rounded-md"
            />
          </div>

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