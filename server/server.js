import express from 'express';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import postRouteres from './routes/postRoutes.js';

const app = express();
const PORT = 3000;

app.use(express.json()); //Body parser

connectDB(); //Database connection

app.use('/api/users', userRoutes); //User routes
app.use('/api/posts', postRouteres); //Post routes

app.get('/', (req, res) => {
  res.send('API is running...');
});



//Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});