// Config 
require('dotenv').config();

// Import data
const connection = require('./config/mongodb');
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

// Middlewares
const middleware = require('./middleware');
const routes = require('./routes');

// Create express App
const app = express();

// Setup Cookie parser
app.use(cookieParser(process.env.COOKIE_SECRET));

// Setup cors
// app.use(cors({
//     origin: process.env.CLIENT_URL,
//     credentials: true
// }));
// app.use(cors());

const allowedOrigins = [process.env.CLIENT_URL, process.env.CLIENT_URL_2, process.env.CLIENT_URL_3];

app.use(cors({
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {  // Allow requests with no origin (e.g., from Postman or cURL)
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow all methods
    allowedHeaders: ['Content-Type'],
    credentials: true // Allow cookies and other credentials
}));
// Setup express middlewares'
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Setup Middleware
app.use(morgan('dev'));
app.use(compression());
app.use(helmet());

// Static files
app.use(express.static(path.resolve('data')));

// Main Routes
app.use('/api/v1', routes);


// Not Found and Error handler
app.use(middleware.notFoundError);
app.use(middleware.errorHandler);


// PORT
const PORT = process.env.PORT || 5000;


// Start app after mongodb is connected
connection()
.then(()=> {
    app.listen(PORT, () => {
        console.log('\x1b[32m%s\x1b[0m', `Server is running on port ${PORT}`);
    });
});

module.exports = app;
