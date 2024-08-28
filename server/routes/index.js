const router = require('express').Router();

const isAuth = require('./authorization/isAuth');

// Imports Routes
const auth = require('./auth');
const dashboard = require('./dashboard')
const tile = require('./tile');
const profile = require('./profile');



// Middleware
router.use('/auth', auth);
router.use('/profile', isAuth, profile);
router.use('/dashboard', dashboard);
router.use('/tile', tile);



module.exports = router;