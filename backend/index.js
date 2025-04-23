const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Semantic Search Backend API is running' });
});

// Proxy search requests to AI service
app.post('/api/search', async (req, res) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/search`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying search request:', error.message);
    res.status(500).json({ 
      error: 'Failed to process search request',
      details: error.response?.data || error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 