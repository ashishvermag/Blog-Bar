import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import Header from './components/Header';
import CreatePostPage from './pages/CreatePostPage';
import PostDetailPage from './pages/PostDetailPage';
import EditPostPage from './pages/EditPostPage';



function App() {
  return (
    <div className="min-h-screen bg-gray-900"> 
    <Header />
    <main className="container mx-auto mt-4 p-4">
      <Routes>  
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path='/create-post' element={<CreatePostPage />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />
       <Route path="/edit-post/:id" element={<EditPostPage />} />
      </Routes>
    </main>
    </div>
  );
}

export default App;