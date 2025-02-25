require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const app = express();
const PORT = process.env.PORT || 8000;


// Middlewares
app.use(cors({origin: 'http://localhost:5173'}));
app.use(bodyParser.json());

// Routes
app.use('/api/users', userRoutes);

// Error handler
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
