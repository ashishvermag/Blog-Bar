import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const Header = () => {
  // 1. Get the userInfo from the Redux store's 'auth' slice
  const { userInfo } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 2. Create a handler for logging out
  const logoutHandler = () => {
    dispatch(logout()); // Send the 'logout' action to the reducer
    navigate('/login'); // Redirect to the login page
  };

  return (
    <header className="bg-gray-800 text-white p-4 fixed top-0 w-full z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold ml-4">
          <span className='text-amber-500'>Blog-</span><span className='text-zinc-400'>Bar</span>
        </Link>

        {/* 3. Check if userInfo exists */}
        <nav className="space-x-4">
          <Link to="/" className="hover:text-gray-300">
            Home
          </Link>
          {userInfo ? (
            // --- If Logged In ---
            <>
            <Link to="/create-post" className="hover:text-gray-300">
              Create Post
            </Link>
              <span className="font-medium">Welcome, {userInfo.name}!</span>
              <button
                onClick={logoutHandler}
                className="hover:text-gray-300 cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            // --- If Logged Out ---
            <>
              <Link to="/login" className="hover:text-gray-300">
                Login
              </Link>
              <Link to="/register" className="hover:text-gray-300">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;