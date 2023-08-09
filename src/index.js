const express = require('express');
const app = express();

require('dotenv').config({
    path: './src/config/.env',
})

app.get('/', (req, res) => {
    res.send(`Server is running at ${process.env.PORT}`);
})

module.exports = app;