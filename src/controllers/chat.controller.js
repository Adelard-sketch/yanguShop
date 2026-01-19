const Chat = require('../models/Chat');
const User = require('../models/User');

// Customer: Create new chat inquiry
exports.createChat = async (req, res, next) => {
  try {
    const { subject, category, message } = req.body;
    console.log('createChat headers authorization:', req.headers && req.headers.authorization);
    console.log('createChat middleware user:', req.user);
    const userId = req.user && req.user.id;

    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    const newChat = new Chat({
      user: userId,
      subject,
      category: category || 'general',
      messages: [
        {
          sender: 'customer',
          content: message,
          timestamp: new Date()
        }
      ]
    });

    await newChat.save();
    await newChat.populate('user', 'name email');

    res.status(201).json({
      message: 'Chat created successfully',
      chat: newChat
    });
  } catch (err) {
    next(err);
  }
};

// Get user's chats
exports.getUserChats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, category, limit = 20, page = 1 } = req.query;

    let query = { user: userId };
    if (status) query.status = status;
    if (category) query.category = category;

    const chats = await Chat.find(query)
      .sort({ lastMessage: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Chat.countDocuments(query);

    res.json({
      chats,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    next(err);
  }
};

// Get chat by ID
exports.getChatById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findById(id)
      .populate('user', 'name email phone')
      .populate('assignedAgent', 'name email');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is the chat owner or admin
    if (chat.user._id.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(chat);
  } catch (err) {
    next(err);
  }
};

// Add message to chat
exports.addMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check authorization
    if (chat.user._id.toString() !== userId.toString() && req.user.role !== 'admin' && req.user.role !== 'agent') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Add user message
    const senderRole = req.user.role === 'admin' || req.user.role === 'agent' ? 'agent' : 'customer';
    chat.messages.push({
      sender: senderRole,
      content: message,
      timestamp: new Date()
    });

    chat.lastMessage = new Date();

    // If user asked for a chart, auto-generate a simple orders chart and an automated response
    const text = (message || '').toLowerCase();
    if (text.includes('chart') || text.startsWith('/chart') || text.includes('show me') && text.includes('chart')) {
      // generate simple orders-by-day for last 7 days
      const Order = require('../models/Order');
      const days = 7;
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1));

      const agg = await Order.aggregate([
        { $match: { createdAt: { $gte: start } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            totalSales: { $sum: '$total' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Build a date-indexed map for the last `days`
      const dataMap = {};
      for (let i = 0; i < days; i++) {
        const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        const key = d.toISOString().slice(0, 10);
        dataMap[key] = { date: key, sales: 0, orders: 0 };
      }

      agg.forEach((r) => {
        if (dataMap[r._id]) {
          dataMap[r._id].sales = r.totalSales || 0;
          dataMap[r._id].orders = r.orders || 0;
        }
      });

      const chartData = Object.values(dataMap);

      // attach chart to chat
      chat.charts = chat.charts || [];
      chat.charts.push({
        title: 'Sales (last 7 days)',
        type: 'line',
        data: chartData,
        createdAt: new Date()
      });

      // add automated agent response
      chat.messages.push({
        sender: 'agent',
        content: 'Auto-generated sales chart for the last 7 days has been attached below. Admins can view and respond to this chart.',
        timestamp: new Date()
      });
    }

    await chat.save();

    res.json({
      message: 'Message added',
      chat
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Get all chats
exports.getAllChats = async (req, res, next) => {
  try {
    const { status, category, limit = 50, page = 1 } = req.query;

    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const chats = await Chat.find(query)
      .populate('user', 'name email phone')
      .populate('assignedAgent', 'name email')
      .sort({ lastMessage: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Chat.countDocuments(query);

    res.json({
      chats,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Update chat status
exports.updateChatStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedAgent } = req.body;

    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (status) chat.status = status;
    if (priority) chat.priority = priority;
    if (assignedAgent) chat.assignedAgent = assignedAgent;

    await chat.save();

    res.json({
      message: 'Chat updated',
      chat
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Get chat statistics
exports.getChatStats = async (req, res, next) => {
  try {
    const totalChats = await Chat.countDocuments();
    const openChats = await Chat.countDocuments({ status: 'open' });
    const inProgressChats = await Chat.countDocuments({ status: 'in-progress' });
    const resolvedChats = await Chat.countDocuments({ status: 'resolved' });
    const closedChats = await Chat.countDocuments({ status: 'closed' });

    const byCategory = await Chat.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const avgResponseTime = await Chat.aggregate([
      {
        $project: {
          responseTime: {
            $subtract: [
              { $arrayElemAt: ['$messages.timestamp', 1] },
              { $arrayElemAt: ['$messages.timestamp', 0] }
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$responseTime' }
        }
      }
    ]);

    res.json({
      totalChats,
      openChats,
      inProgressChats,
      resolvedChats,
      closedChats,
      byCategory,
      avgResponseTime: avgResponseTime[0]?.avgTime || 0
    });
  } catch (err) {
    next(err);
  }
};

// Admin/Agent: respond/annotate a chart embedded in a chat
exports.respondToChart = async (req, res, next) => {
  try {
    const { id, index } = req.params; // chart index in array
    const { content } = req.body;

    if (!content) return res.status(400).json({ message: 'Response content is required' });

    const chat = await Chat.findById(id);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const idx = parseInt(index, 10);
    if (Number.isNaN(idx) || !chat.charts || idx < 0 || idx >= chat.charts.length) {
      return res.status(400).json({ message: 'Invalid chart index' });
    }

    // append response to chart.responses
    chat.charts[idx].responses = chat.charts[idx].responses || [];
    chat.charts[idx].responses.push({ sender: 'agent', content, createdAt: new Date() });

    // update chat-level flag
    chat.hasChartResponse = true;

    // also add a message to the chat thread indicating the annotation
    chat.messages.push({ sender: 'agent', content: `Chart response: ${content}`, timestamp: new Date() });

    chat.lastMessage = new Date();
    await chat.save();

    res.json({ message: 'Chart response added', chat });
  } catch (err) {
    next(err);
  }
};
