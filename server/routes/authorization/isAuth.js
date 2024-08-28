const createError = require('http-errors');
const {verifyAccessToken} = require('../../utils/jwtUtils');

const isAuth = async (req, res, next) => {
    try {
        const {authorization} = req.headers;

        if(!authorization) throw createError(401, 'Authorization code required');

        const token = authorization.split(' ');

        // Cut the bearer token and find the token portion
        if(token[0] !== 'Bearer') throw createError(401, 'Bearer Token is required');

        // Verify and find the user id
        const {userId, role, exp} = await verifyAccessToken(token[1]);

            // check if the token is expired
        if(exp * 1000 < Date.now()) throw createError(401, 'Token is expried');
        
        req.user = { userId, role };

        return next();
    }
    catch(error) {
        next(error);
    }
}


module.exports = isAuth;