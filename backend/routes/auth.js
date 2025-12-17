const express = require('express');
const router = express.Router();
const { googleAuth, googleRedirect, googleCallback } = require('../controllers/authController');

router.get('/google', googleRedirect);
router.get('/google/callback', googleCallback);
router.post('/google', googleAuth);

module.exports = router;
