import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { setCredentials } from '../store/slices/authSlice';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Determine the path to redirect to:
  //    - If state has a 'from' property, use that (e.g., /posts/123)
  //    - Otherwise, default to the homepage '/'
  const from = location.state?.from || '/';

  // This will handle the form submission
  const submitHandler = async (e) => {
    e.preventDefault(); // Prevents the page from reloading
    try {

        // Send a POST request to the login endpoint
        const {data} = await axios.post('/api/users/login', {email, password});

        // Log the response data
        console.log('Login successful:', data);

        dispatch(setCredentials(data)); // Update Redux store with user info

       // **REDIRECT LOGIC**
      // 2. Navigate the user to the saved path ('from')
      navigate(from, { replace: true }); 
      // { replace: true } prevents the user from hitting the 'back' button
      // and landing back on the login page.


    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-30">
      <div className="p-8 bg-gray-800 shadow-md rounded-lg">
        <h1 className="text-3xl font-bold text-center text-white mb-6">Login</h1>
        <form onSubmit={submitHandler}>
          {/* Email Field */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;