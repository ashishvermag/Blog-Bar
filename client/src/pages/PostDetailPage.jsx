import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import CommentItem from '../components/CommentItem';
import { nestComments } from '../utils/commentUtils';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const PostDetailPage = () => {
  // Get the 'id' parameter from the URL path (/posts/:id)
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { userInfo } = useSelector((state) => state.auth);
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [comments, setComments] = useState([]); // List of comments
  const [newCommentText, setNewCommentText] = useState(''); // New comment input
  const [nestedComments, setNestedComments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // Submission state
  const [likeCount, setLikeCount] = useState(0); 
  const [isLiked, setIsLiked] = useState(false);

 const isAuthor = userInfo && post && post.author ? userInfo._id === post.author._id : false;

  // Delete Post Handler
  const deleteHandler = async () => {
    if (window.confirm('Are you sure you want to delete this entire blog post? This cannot be undone.')) {
      try {
        const config = {
          headers: {
            // Send the token for the protected DELETE route
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        // Send the DELETE request to the backend post route
        await axios.delete(`/api/posts/${post._id}`, config);
        
        alert('Post deleted successfully!');
        navigate('/'); // Redirect to homepage after deletion

      } catch (err) {
        console.error('Post deletion failed:', err);
        alert('Post deletion failed. You might not have permission.');
      }
    }
  };

  // --- COMMENT FETCHING LOGIC (With Callback Hook) ---
  const fetchComments = useCallback(async () => {
      try {
          // Fetch all comments for the post
          const { data } = await axios.get(`/api/posts/${id}/comments`);
          setComments(data); 
          // Transform the flat list into the nested structure for rendering
          setNestedComments(nestComments(data)); 
      } catch (error) {
          console.error('Error fetching comments:', error);
      }
  }, [id]); // Only re-create if ID changes

const submitCommentHandler = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    try {
        setIsSubmitting(true);
        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`,
                'Content-Type': 'application/json',
            },
        };

        // POST request to create the comment
        await axios.post(`/api/posts/${id}/comments`, { text: newCommentText }, config);

        // Refresh the list and clear the input
        setNewCommentText('');
        fetchComments(); 

    } catch (error) {
        console.error('Failed to submit comment:', error);
        alert('Failed to submit comment. Are you logged in?');
    } finally {
        setIsSubmitting(false);
    }
};

// Handlers to update state after deletion or edit from CommentItem
  // Simply refetching all comments is the most reliable way to update the complex nested structure
  const handleCommentDelete = () => fetchComments(); 
  const handleCommentEdit = () => fetchComments();

  // --- LIKE TOGGLE HANDLER ---
  const toggleLike = async () => {
    if (!userInfo) {
      // **REDIRECT LOGIC**
      // 1. Pass the current path in the state object
      // 2. Redirect to the login page
      navigate('/login', { state: { from: location.pathname } }); 
      return;
    }
    
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      
      // Use the new PUT route
      const { data } = await axios.put(`/api/posts/like/${post._id}`, {}, config);
      
      // Update local state based on the backend's response
      setIsLiked(prev => !prev);
      setLikeCount(data.likes); 

    } catch (error) {
      console.error('Like toggle failed:', error);
      alert('Could not update like status.');
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

        setLikeCount(data.likes.length); // Initialize the count
        // Check if the logged-in user's ID is in the likes array
        if (userInfo && data.likes.includes(userInfo._id)) {
            setIsLiked(true);
        } else {
            setIsLiked(false);
        }
        
      } catch (err) {
        setError('Failed to fetch post or post does not exist.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
   
    fetchPost();
    if(id) // Ensure ID is available
    {
        fetchComments();
    }
  }, [id, userInfo, fetchComments]); // Dependency array: fetches when ID or userInfo changes


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
   <div className="max-w-4xl mx-auto mt-20">
      <div className="p-8 bg-gray-800 shadow-xl rounded-lg border border-gray-700">
        
        {/* Post Detail Content (Title, Metadata, Controls, Full Content) */}
        <h1 className="text-4xl font-extrabold text-blue-400 mb-4 border-b pb-2 border-gray-700">{post.title}</h1>

        <div className="text-sm text-gray-400 mb-6 flex justify-between items-center">
            <p>By <span className="font-semibold text-gray-200">{post.author?.name}</span> on {new Date(post.createdAt).toLocaleDateString()}</p>
            {/* Conditional Edit/Delete buttons (isAuthor logic) */}
            {isAuthor && (
                <div className="space-x-3">
                    <Link to={`/edit-post/${post._id}`} className="text-yellow-400 hover:text-yellow-300 font-medium transition duration-150">Edit Blog</Link>
                    <button onClick={deleteHandler} className="text-red-500 hover:text-red-400 font-medium transition duration-150">Delete</button>
                </div>
            )}
        </div>

        {/* --- LIKE SECTION --- */}
        <div className="mt-4 pt-3 flex items-center border-t border-gray-700">
            <button
                onClick={toggleLike}
                className={`flex items-center text-lg transition duration-200 
                            ${isLiked ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-white'}`}
                // disabled={!userInfo}
                title={!userInfo ? "Log in to like" : "Toggle Like"}
            >
                {isLiked ? <FaHeart className="mr-1" /> : <FaRegHeart className="mr-1" />}
                <span className="text-white font-medium">{likeCount}</span>
            </button>
            <span className="text-gray-400 ml-2 text-sm">Likes</span>
        </div>
        

        <div className="text-gray-300 prose prose-invert max-w-none mt-2 mb-10" dangerouslySetInnerHTML={{ __html: post.content }}/>

        {/* --- COMMENT SECTION --- */}
        <div className="mt-10 pt-6 border-t border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">
            Comments ({comments.length})
          </h2>
          
          {/* Submission Form */}
          {userInfo ? (
            <form onSubmit={submitCommentHandler} className="mb-8 space-y-3">
              <textarea value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} placeholder="Add a comment..." className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-blue-500" rows="3" disabled={isSubmitting}/>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50" disabled={isSubmitting || !newCommentText.trim()}>
                {isSubmitting ? 'Posting...' : 'Submit Comment'}
              </button>
            </form>
          ) : (
            <p className="text-gray-400 mb-8">Please log in to leave a comment.</p>
          )}

          {/* List of Nested Comments */}
          <div className="space-y-4">
            {/* Map over the top-level comments */}
            {nestedComments.map((comment) => (
              <CommentItem 
                key={comment._id}
                comment={comment}
                replies={comment.replies} // Pass the children
                postId={post._id}
                postAuthorId={post.author._id} 
                onDeleteSuccess={handleCommentDelete}
                onEditSuccess={handleCommentEdit}
                refreshComments={fetchComments} // Function to trigger a full refresh
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;