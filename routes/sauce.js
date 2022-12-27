const express = require('express');
const router = express.Router();
const sauceControl = require('../controllers/sauce');

router.post('/sauce', sauceControl.);

module.exports = router;