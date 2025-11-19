import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

// The component is recursive: it renders itself for replies
const CommentItem = ({ comment, postAuthorId, onDeleteSuccess, onEditSuccess, replies, postId, refreshComments }) => {
  const { userInfo } = useSelector((state) => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [showReplyForm, setShowReplyForm] = useState(false); 
  const [replyText, setReplyText] = useState(''); 
  
  // Authorization checks (for visibility and logic)
  const isCommenter = userInfo?._id === comment.user._id; 
  const isPostAuthor = userInfo?._id === postAuthorId; 

  // --- HANDLERS (Delete and Edit) ---
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`/api/posts/comments/${comment._id}`, config);
      onDeleteSuccess(comment._id); // Update parent state (removes from UI)
    } catch (error) {
      console.error('Comment deletion failed:', error);
      alert('Failed to delete comment. Check permissions.');
    }
  };
  
  const handleSaveEdit = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}`, 'Content-Type': 'application/json' } };
      await axios.put(`/api/posts/comments/${comment._id}`, { text: editText }, config);
      onEditSuccess(comment._id, editText); 
      setIsEditing(false);
    } catch (error) {
      console.error('Comment edit failed:', error);
      alert('Failed to save changes. Only the commenter can edit.');
    }
  };
  
  // --- REPLY SUBMISSION HANDLER ---
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !userInfo) return;

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}`, 'Content-Type': 'application/json' } };

      await axios.post(
        `/api/posts/${postId}/comments`,
        { text: replyText, parentComment: comment._id }, // Pass the parent ID
        config
      );

      setReplyText('');
      setShowReplyForm(false);
      
      // Refresh the entire comment tree in PostDetailPage
      refreshComments(); 

    } catch (error) {
      console.error('Reply submission failed:', error);
      alert('Failed to post reply.');
    }
  };

  return (
    <div className={`space-y-4 ${comment.parentComment ? 'mt-4 border-l-2 border-gray-600 pl-4' : ''}`}>
      <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 space-y-3">
        {/* Header/Metadata and Controls */}
        <div className="flex justify-between items-start">
          <p className="text-sm font-semibold text-gray-300">
            {comment.user.name} <span className="text-xs text-gray-400 font-normal">on {new Date(comment.createdAt).toLocaleDateString()}</span>
          </p>
          
          {/* Controls: Edit/Delete/Reply */}
          {(isCommenter || isPostAuthor || userInfo) && (
            <div className="flex space-x-2">
              {userInfo && (
                <button onClick={() => setShowReplyForm(!showReplyForm)} className="text-blue-400 hover:text-blue-300 text-xs font-medium cursor-pointer">
                  {showReplyForm ? 'Cancel Reply' : 'Reply'}
                </button>
              )}
              
              {isCommenter && (
                <button onClick={() => setIsEditing(!isEditing)} className="text-yellow-400 hover:text-yellow-300 text-xs cursor-pointer">
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              )}

              {(isCommenter || isPostAuthor) && (
                <button onClick={handleDelete} className="text-red-300 hover:text-red-400 text-xs cursor-pointer">
                  Delete
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content/Editor */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full p-2 bg-gray-800 text-white rounded-md border border-gray-600" rows="3"/>
            <button onClick={handleSaveEdit} className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">Save</button>
          </div>
        ) : (
          <p className="text-gray-300 text-sm">{comment.text}</p>
        )}
      </div>

      {/* Reply Form */}
      {showReplyForm && userInfo && (
        <form onSubmit={handleReplySubmit} className="mt-2 pl-4">
          <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder={`Replying to ${comment.user.name}...`} className="w-full p-2 bg-gray-600 text-white rounded-md border border-gray-500 focus:outline-none" rows="2"/>
          <button type="submit" className="mt-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm cursor-pointer">Post Reply</button>
        </form>
      )}

      {/* --- RECURSIVE CALL: Renders Nested Replies --- */}
      {replies && replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {replies.map((reply) => (
            <CommentItem 
              key={reply._id}
              comment={reply}
              replies={reply.replies} // Pass the next level of replies
              postId={postId}
              postAuthorId={postAuthorId}
              onDeleteSuccess={onDeleteSuccess}
              onEditSuccess={onEditSuccess}
              refreshComments={refreshComments}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;