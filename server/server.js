import express from 'express';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import postRouteres from './routes/postRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import path from 'path';

const app = express();
const PORT = 3000;

app.use(express.json()); //Body parser

connectDB(); //Database connection

app.use('/api/users', userRoutes); //User routes
app.use('/api/posts', postRouteres); //Post routes
app.use('/api/upload', uploadRoutes); //Upload routes

// Make uploads folder static to serve images
// This allows files in 'uploads' to be accessed publicly via /uploads/...
const __dirname = path.resolve(); // Get the current directory path
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/', (req, res) => {
  res.send('API is running...');
});



//Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});