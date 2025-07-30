const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors'); // Import cors

dotenv.config(); // Load environment variables

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false })); // Allows us to get data in req.body
app.use(cors()); // Enable CORS for all routes

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/gallery', require('./routes/gallery'));

// Basic route for testing
app.get('/', (req, res) => res.send('Gallery API is running'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));