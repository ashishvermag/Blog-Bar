/**
 * Takes a flat array of comments and converts it into a nested, tree-like structure.
 * @param {Array} comments - The flat array of comments fetched from the backend.
 * @returns {Array} Nested array of comments (only top-level comments at root).
 */
export const nestComments = (comments) => {
    // Map the comment ID to the comment object for quick lookup
    const commentMap = {}; // Initialize the map

    // First, create a map of all comments by their IDs
    comments.forEach(comment => (commentMap[comment._id] = { ...comment, replies: [] }));

    const nestedComments = []; // This will hold the top-level comments

    comments.forEach(comment => {
        const commentWithReplies = commentMap[comment._id];
        
        // Check if this comment has a parent
        if (comment.parentComment) {
            const parent = commentMap[comment.parentComment];
            if (parent) {
                // Attach the current comment to its parent's replies array
                parent.replies.push(commentWithReplies);
            } else {
                // If parent isn't found (e.g., deleted), treat as top-level
                nestedComments.push(commentWithReplies);
            }
        } else {
            // It is a top-level comment
            nestedComments.push(commentWithReplies);
        }
    });
    
    // Sort replies within each parent (optional but good for consistency)
    const sortReplies = (comments) => {
        comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Oldest first for replies
        comments.forEach(c => sortReplies(c.replies));
    };

    sortReplies(nestedComments); 
    
    return nestedComments;
};