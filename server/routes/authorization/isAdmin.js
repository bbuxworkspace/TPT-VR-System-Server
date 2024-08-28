const createError = require('http-errors');
const {verifyAccessToken} = require('../../utils/jwtUtils');

const isAdmin = (req, res, next) => {
    try {
        const {role} = req.user;

        if(role !== 'admin') throw createError(403, 'You are not authorized');

        return next();
    }
    catch(error) {
        next(error);
    }
}


module.exports = isAdmin;