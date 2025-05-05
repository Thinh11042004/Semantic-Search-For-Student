
const express = require('express');
const cors = require('cors');
const formRoutes = require('./routes/formRoutes');
const userRoutes = require('./routes/userRoutes');
const userController = require('./controllers/userController');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api', formRoutes);
app.use('/api/users', userRoutes);

// Kiểm tra server
app.get('/', (req, res) => {
    res.send('Server is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
