require('dotenv').config();
const express = require('express');
const cors = require('cors');
const petitionsRouter = require('./routes/petitions');
const profilesRouter = require('./routes/profiles');
const eligibilityRouter = require('./routes/eligibility');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/petitions', petitionsRouter);
app.use('/api/profiles', profilesRouter);
app.use('/api/eligibility', eligibilityRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Visa Eligibility API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

