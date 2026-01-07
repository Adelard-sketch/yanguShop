const express = require('express');
const router = express.Router();
const aiCtrl = require('../controllers/ai.controller');

router.post('/query', aiCtrl.query);

module.exports = router;
