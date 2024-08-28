const router = require('express').Router();


// Imports Routes
const signup = require('./signup');
const login = require('./login');
const logout = require('./logout');
const resetPassword = require('./resetPassword');
const refreshToken = require('./refreshToken');
const deleteUser = require('./deleteUser');
const admin = require('./admin');


// Middleware
router.use('/signup', signup);
router.use('/login', login);
router.use('/logout', logout);
router.use('/reset-password', resetPassword);
router.use('/refresh-token', refreshToken);
router.use('/delete', deleteUser);
router.use('/create-admin', admin);

module.exports = router;