import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

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
        { posts.map((post) => (
          <Link key={post._id} to={`/posts/${post._id}`} className="block">
            <div 
              className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700 hover:border-blue-500 transition duration-200 cursor-pointer"
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

              {/* Post Snippet (Short form) */}
              {/* We can limit the content shown on the homepage here */}
              <div 
                className="text-gray-300 prose prose-invert max-w-none line-clamp-3" // line-clamp-3 limits to 3 lines
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </Link>
        ))
        }

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