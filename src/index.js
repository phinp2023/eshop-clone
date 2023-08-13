const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const connectDatabase = require('./db');
const route = require('./routes');
const ErrorHandler = require('./app/middlewares/error');

const app = express();

// Add static url image
app.use('/', express.static(path.join(__dirname, 'uploads')));

// Using cors
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// Add cookie
app.use(cookieParser());

// Parse requests of content-type - application/json
app.use(express.json());

// Parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Config path
require('dotenv').config({ path: './src/config/.env' });

// Connect to database
connectDatabase();

app.get('/', (req, res) => {
    res.send(`Server is running at ${process.env.PORT}`);
});

// Routes
route(app);

// It's for ErrorHandling
app.use(ErrorHandler);

module.exports = app;
