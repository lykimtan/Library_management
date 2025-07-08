const express = require('express');
const cors = require('cors');
//import va su dung route
const assignRotuer = require('./app/routes/route');
const ApiError = require('./app/api-error');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/librarymanagement', assignRotuer);


app.get('/', (req, res) => {
    res.json({ Message: 'Welcome to Library Management' });
});



app.use((req, res, next) => {
    return next(new ApiError(404, 'Resource not found'));
});

app.use((err, req, res, next) => {
    return res.status(err.statusCode || 500).json({
        message: err.message || 'Internal Server Error',
    });
});

module.exports = app;
