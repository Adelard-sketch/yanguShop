const aiService = require('../services/ai.service');
const twilioService = require('../services/twilio.service');
const User = require('../models/User');
const Chat = require('../models/Chat');

function normalizeNumber(n) {
  if (!n) return n;
  return n.toString().replace(/[^0-9]/g, '');
}

// POST /api/twilio/send -> { to, message }
exports.send = async (req, res) => {
  try {
    const { to, message } = req.body;
    if (!to || !message) return res.status(400).json({ error: 'Missing to or message' });

    const result = await twilioService.send(to, message);
    return res.status(201).json({ sid: result.sid, status: result.status });
  } catch (err) {
    console.error('Twilio send API error', err?.response?.data || err.message || err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
};

// POST /webhook/twilio -> incoming message from Twilio (x-www-form-urlencoded)
exports.receive = async (req, res) => {
  try {
    // Twilio sends fields like From, Body, MessageSid
    const fromRaw = req.body.From || req.body.From || '';
    const bodyText = req.body.Body || '';

    const from = normalizeNumber(fromRaw);
    const text = bodyText || '';

    // Quick ack to Twilio
    res.sendStatus(200);

    if (!from || !text) return;

    // Find or create user by phone
    let user = await User.findOne({ phone: from });
    if (!user) {
      user = await User.create({ name: `Twilio_${from}`, email: `${from}@twilio.local`, password: Math.random().toString(36).slice(2, 10), phone: from });
    }

    // Create or append to chat
    let chat = await Chat.findOne({ user: user._id, subject: `Twilio:${from}` });
    if (!chat) {
      chat = await Chat.create({ user: user._id, subject: `Twilio:${from}`, messages: [] });
    }

    chat.messages.push({ sender: 'customer', content: text });
    chat.lastMessage = new Date();
    await chat.save();

    // Generate AI reply
    let aiReply = `Echo: ${text}`;
    try {
      const aiRes = await aiService.ask(`Customer: ${text}\nReply as a helpful support agent:`, { max_tokens: 200 });
      aiReply = aiRes.text || aiReply;
    } catch (e) {
      console.error('AI reply failed', e?.message || e);
    }

    // Save agent reply
    chat.messages.push({ sender: 'agent', content: aiReply });
    chat.lastMessage = new Date();
    await chat.save();

    // Send reply back over Twilio (WhatsApp)
    try {
      await twilioService.send(from, aiReply);
    } catch (err) {
      console.error('Failed to send Twilio reply', err?.message || err);
    }
  } catch (err) {
    console.error('Error processing Twilio webhook', err?.message || err);
    try { res.sendStatus(200); } catch (e) {}
  }
};

// GET /api/twilio/logs?limit=50&page=1&from=&to=&direction=
exports.logs = async (req, res) => {
  try {
    const TwilioMessage = require('../models/TwilioMessage');
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.from) filter.from = req.query.from;
    if (req.query.to) filter.to = req.query.to;
    if (req.query.direction) filter.direction = req.query.direction;

    const [items, total] = await Promise.all([
      TwilioMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      TwilioMessage.countDocuments(filter),
    ]);

    return res.json({ page, limit, total, items });
  } catch (err) {
    console.error('Failed to fetch Twilio logs', err?.message || err);
    return res.status(500).json({ error: 'Failed to fetch logs' });
  }
};

module.exports = exports;
