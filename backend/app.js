// semantic-search-backend/app.js
const express = require('express');
const cors = require('cors');
const formRoutes = require('./routes/formRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/forms', formRoutes);

app.get('/', (req, res) => {
  res.send('Semantic Search Backend is running!');
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
