// server.js
const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
// const path = require('path'); // No longer needed for local uploads
const cors = require('cors');

dotenv.config();

const app = express();

connectDB();

app.use(express.json({ extended: false }));
app.use(cors());

// REMOVE THIS LINE: app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/gallery', require('./routes/gallery'));

app.get('/', (req, res) => res.send('Gallery API is running'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));