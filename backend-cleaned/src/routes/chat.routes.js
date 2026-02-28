const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// Customer routes
router.post('/', authMiddleware, chatController.createChat);
router.get('/', authMiddleware, chatController.getUserChats);
router.get('/:id', authMiddleware, chatController.getChatById);
router.post('/:id/message', authMiddleware, chatController.addMessage);
// Admin/Agent: respond to an embedded chart (by index)
router.post('/:id/charts/:index/respond', authMiddleware, roleMiddleware(['admin', 'agent']), chatController.respondToChart);

// Admin routes
router.get('/admin/all', authMiddleware, roleMiddleware(['admin', 'agent']), chatController.getAllChats);
router.put('/:id/status', authMiddleware, roleMiddleware(['admin', 'agent']), chatController.updateChatStatus);
router.get('/admin/stats', authMiddleware, roleMiddleware(['admin']), chatController.getChatStats);

module.exports = router;
