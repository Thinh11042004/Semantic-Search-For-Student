const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { UpdateInformation}=require('../controllers/userController')
const db = require('../db');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);


router.get('/:id', userController.getUserById);


router.put('/users/:id', UpdateInformation);

module.exports = router;
