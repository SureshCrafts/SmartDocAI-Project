// backend/server.js
const express = require('express');
const dotenv = require('dotenv').config();
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');
const cors = require('cors'); // Make sure cors is imported

// Connect to MongoDB
connectDB();

const app = express();
// Ensure process.env.PORT is read from .env first, falling back to 5001
const port = process.env.PORT || 5001;

// Middleware to parse JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// USE CORS MIDDLEWARE HERE
app.use(cors({
    origin: 'http://localhost:3000'
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes); // UNCOMMENT THIS

// Serve frontend (for production deployment, will be uncommented later)
// if (process.env.NODE_ENV === 'production') {
//     app.use(express.static(path.join(__dirname, '../frontend/build')));

//     app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html')));
// } else {
//     app.get('/', (req, res) => res.send('Please set to production'));
// }

// Fallback for non-existent routes (always keep after routes)
// app.use('*', (req, res, next) => {
//     res.status(404).json({ message: `Cannot find ${req.originalUrl} on this server!` });
// });

// Error handling middleware (always last)
app.use(errorHandler);

app.listen(port, () => console.log(`Server running on port ${port}`));