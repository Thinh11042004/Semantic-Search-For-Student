const express = require('express');
const router = express.Router();
const { addActivity, getActivitiesByUser } = require('../controllers/activityController');

router.post('/activity', addActivity); 
router.get('/users/:user_id/activity', getActivitiesByUser); 

module.exports = router;
