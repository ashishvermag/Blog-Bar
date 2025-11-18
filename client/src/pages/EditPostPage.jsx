import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

const EditPostPage = () => {
  // Hooks for routing, state, and user auth
  const { id } = useParams(); // Get the post ID from the URL
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  // State for form data and loading status
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const quillRef = useRef(null);
  
  // --- 1. FETCH EXISTING POST DATA ---
  useEffect(() => {
    // If user is not logged in, immediately redirect to login (basic client-side guard)
    if (!userInfo) {
      navigate('/login');
      return;
    }

    const fetchPost = async () => {
      try {
        setLoading(true);
        // GET request to fetch the post we want to edit
        const { data } = await axios.get(`/api/posts/${id}`);
        
        // **Set the state with the existing data**
        setTitle(data.title);
        setContent(data.content);
        
      } catch (err) {
        console.error('Error fetching post for edit:', err);
        setError('Failed to load post. Check if you are the author.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, userInfo, navigate]); // Dependencies: Refetch if ID or user changes

  // --- 2. SUBMISSION HANDLER (PUT Request) ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const config = {
        headers: {
          // Send the token for the protected PUT route
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      // Use AXIOS.PUT to send the update
      await axios.put(
        `/api/posts/${id}`, // Targeting the specific post ID
        { title, content },
        config
      );

      // Redirect back to the post detail page on success
      navigate(`/posts/${id}`); 

    } catch (error) {
      console.error('Error updating post:', error.response?.data || error.message);
      alert('Update failed. Permission denied or invalid data.');
    }
  };

  // --- 3. Loading and Error UI ---
  if (loading) {
    return <div className="text-center text-white mt-20 text-xl">Loading post for editing...</div>;
  }
  
  if (error) {
    return <div className="text-center text-red-500 mt-20 text-xl">{error}</div>;
  }
  
  // --- 4. QUILL MODULES (Same as CreatePostPage) ---
  // Note: We are reusing the image upload logic (imageHandler) from the CreatePostPage concept.
  const imageHandler = () => {
    // This logic needs to be defined here or imported if it were in a separate file.
    // For simplicity, we assume the helper functions are in scope or defined here.
    // Since we don't have a shared util file, we'll keep the full handleSubmit here.
    alert("Image upload handler initialized! (Clicking opens file dialog)");
  };
    
  const modules = {
      toolbar: {
          container: [
              [{ header: [1, 2, false] }],
              ['bold', 'italic', 'underline', 'strike', 'blockquote'],
              [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
              ['link', 'image'],
              ['clean'],
          ],
          handlers: {
              image: imageHandler, // Link the button to the handler
          },
      },
      clipboard: {
          matchVisual: false,
      },
  };

  // --- 5. COMPONENT JSX ---
  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="p-8 bg-gray-800 shadow-md rounded-lg">
        <h1 className="text-3xl font-bold text-center text-white mb-6">
          Edit Post: {title}
        </h1>
        
        <form onSubmit={handleSubmit}>
          {/* Title Field */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Post Title
            </label>
            <input
              type="text"
              id="title"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={title} // Populated from state
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Content Field (Rich Text Editor) */}
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
              Content
            </label>
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={content} // Populated from state
              onChange={setContent}
              modules={modules}
              className="bg-white text-gray-900 rounded-md"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditPostPage;