import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';

const PostDetailPage = () => {
  // Get the 'id' parameter from the URL path (/posts/:id)
  const { id } = useParams();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 const isAuthor = userInfo && post && post.author ? userInfo._id === post.author._id : false;

  // Delete Post Handler
  const deleteHandler = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        // Send the DELETE request
        await axios.delete(`/api/posts/${post._id}`, config);
        
        alert('Post deleted successfully!');
        navigate('/'); // Redirect to homepage after deletion

      } catch (err) {
        console.error(err);
        alert('Deletion failed. You might not have permission.');
      }
    }
  };


 // --- FETCH POST DATA ---
  useEffect(() => {
    const fetchPost = async () => {
      // If user is logged in, attach token for robustness (though GET is public)
      const config = userInfo ? { headers: { Authorization: `Bearer ${userInfo.token}` } } : {};
      
      try {
        setLoading(true);
        // Fetch the single post data from our backend
        const { data } = await axios.get(`/api/posts/${id}`, config);
        setPost(data);
      } catch (err) {
        setError('Failed to fetch post or post does not exist.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, userInfo]); // Dependency array: fetches when ID or userInfo changes

  if (loading) {
    return <div className="text-center text-white mt-20 text-xl">Loading...</div>;
  }
  
  if (error) {
    return <div className="text-center text-red-500 mt-20 text-xl">{error}</div>;
  }
  
  if (!post) {
    return <div className="text-center text-gray-400 mt-20 text-xl">Post not found.</div>;
  }

  return (
   <div className="max-w-4xl mx-auto mt-10">
      <div className="p-8 bg-gray-800 shadow-xl rounded-lg border border-gray-700">
        
        {/* Title */}
        <h1 className="text-4xl font-extrabold text-blue-400 mb-4 border-b pb-2 border-gray-700">
          {post.title}
        </h1>

        {/* Metadata and Control Buttons */}
        <div className="text-sm text-gray-400 mb-6 flex justify-between items-center">
            <p>
              By <span className="font-semibold text-gray-200">{post.author?.name}</span> on {new Date(post.createdAt).toLocaleDateString()}
            </p>
            
            {/* Conditional Buttons: Visible ONLY to the author */}
            {isAuthor && (
                <div className="space-x-3">
                    <Link
                        to={`/edit-post/${post._id}`}
                        className="text-yellow-400 hover:text-yellow-300 font-medium transition duration-150"
                    >
                        Edit Blog
                    </Link>
                    <button
                        onClick={deleteHandler}
                        className="text-red-500 hover:text-red-400 font-medium transition duration-150"
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>

        {/* Full Content */}
        <div 
          className="text-gray-300 prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

      </div>
    </div>
  );
};

export default PostDetailPage;