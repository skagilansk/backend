const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { errorResponse } = require('./utils/standardResponse');

const app = express();

app.use(cors());
app.use(express.json());

// Main Routes
app.use('/', routes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json(errorResponse(err.message || 'Internal Server Error'));
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json(errorResponse('Route not found'));
});

module.exports = app;
