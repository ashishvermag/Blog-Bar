import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom'; // <-- 1. Import useLocation
import { useSelector } from 'react-redux';

const PrivateRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const location = useLocation(); // <-- 2. Get the current URL information

// --- DEBUGGING LOGS ---
  console.log('--- PRIVATE ROUTE DEBUG START ---');
  console.log('A. UserInfo Value:', userInfo);
  console.log('B. User Logged In:', !!userInfo); // Force a boolean print
  console.log('C. Target Path:', location.pathname);
  console.log('---------------------------------');

  // If the user is logged in, show the protected route
  if (userInfo) {
    return <Outlet />;
  }

  // If we reach here, userInfo is null. We attempt to navigate.
  console.log('ACTION: User is logged OUT. Redirecting to /login...');
  
  // If not logged in, redirect to /login and pass the current path
  // so the login page knows where to send them back.
  return (
    <Navigate 
      to='/login' 
      state={{ from: location.pathname }} // <-- 3. Pass the destination path
      replace 
    />
  );
};

export default PrivateRoute;