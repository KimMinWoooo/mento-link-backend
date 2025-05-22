const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../mento-link-front-html')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/cohorts', require('./routes/cohortRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/boards', require('./routes/boardRoutes'));
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../mento-link-front-html/MainPage.html'));
});

app.get('/mentoring', (req, res) => {
  res.sendFile(path.join(__dirname, '../mento-link-front-html/MentoringPage.html'));
});

app.get('/subjects', (req, res) => {
  res.sendFile(path.join(__dirname, '../mento-link-front-html/SubjectListPage.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 