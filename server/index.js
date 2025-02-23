const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./db');

// middleware
app.use(cors());
app.use(express.json());


// routes

app.listen(8000, () => {
    console.log('Server is running on port 8000');
});
