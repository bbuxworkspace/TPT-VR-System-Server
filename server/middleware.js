const errorTypes = {
    ValidationError: 422,
    JsonWebTokenError: 401,
    TokenExpiredError: 401
};

const errorMessages = {
    TokenExpiredError: 'Token expired'
};


const notFoundError = (req, res, next) => {
    const error = new Error(`Not Found -> ${req.originalUrl}`);
    res.status(404);

    next(error);
}


const errorHandler = (error, req, res, next) => {
    const statusCode = res.statusCode === 200 ? errorTypes[error.name] || error.statusCode || 500 : res.statusCode;

    res.status(statusCode);

    res.json({
        message: errorMessages[error.name] || error.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
}

module.exports = {notFoundError, errorHandler};