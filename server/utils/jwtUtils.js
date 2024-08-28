const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');


const refreshPublicKey = fs.readFileSync(path.resolve('secretKeys/refresh_token_ec_pub.pem'), 'utf8');
const refreshPrivateKey = fs.readFileSync(path.resolve('secretKeys/refresh_token_ec_priv.pem'), 'utf8');

const accessPublicKey = fs.readFileSync(path.resolve('secretKeys/access_token_ec_pub.pem'), 'utf8');
const accessPrivateKey = fs.readFileSync(path.resolve('secretKeys/access_token_ec_priv.pem'), 'utf8');


// Make a token
const signToken = (payload, expireTime = '7d', privateKey) => {
    // Return Promise
    return new Promise((resolve, reject)=> {
        // Sign the payload with json web token
        jwt.sign(payload, privateKey, { algorithm: 'ES256', expiresIn: expireTime }, (err, token) => {
            if(err) {
                reject(err);
            }
            else {
                resolve(token);
            }
        });
    });
}

// Verify Token
const verifyToken = (token, publicKey) => {
    // Return Promise
    return new Promise((resolve, reject) => {
        // Verify json web token
        jwt.verify(token, publicKey, (err, payload) => {
            if(err) {
                reject(err);
            }
            else {
                resolve(payload);
            }
        });
    });
}



const signRefreshToken = async (payload, expireTime) => {
    return await signToken(payload, expireTime, refreshPrivateKey);
}

const verifyRefreshToken = async (token) => {
    return await verifyToken(token, refreshPublicKey);
}

const signAccessToken = async (payload, expireTime) => {
    return await signToken(payload, expireTime, accessPrivateKey);
}

const verifyAccessToken = async (token) => {
    return await verifyToken(token, accessPublicKey);
}


module.exports = {
    signRefreshToken, 
    verifyRefreshToken, 
    signAccessToken, 
    verifyAccessToken
};