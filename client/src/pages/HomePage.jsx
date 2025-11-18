import React, { useEffect, useState } from 'react';
import axios from 'axios';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await axios.get('/api/posts');
        setPosts(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <div className="text-center text-white mt-10">Loading posts...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold text-center text-white mb-8">
        Latest Blog Posts
      </h1>

      <div className="space-y-6">
        {posts.map((post) => (
          <div 
            key={post._id} 
            className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700"
          >
            {/* Post Title */}
            <h2 className="text-2xl font-bold text-blue-400 mb-2">
              {post.title}
            </h2>

            {/* Author and Date Info */}
            <div className="text-sm text-gray-400 mb-4 flex justify-between items-center">
              <span>By <span className="font-semibold text-gray-200">{post.author?.name || 'Unknown'}</span></span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>

            {/* Post Content (Rich Text) */}
            {/* We use this special attribute to render the HTML content */}
            <div 
              className="text-gray-300 prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        ))}

        {posts.length === 0 && (
          <p className="text-center text-gray-400">
            No posts found. Be the first to write one!
          </p>
        )}
      </div>
    </div>
  );
};

export default HomePage;