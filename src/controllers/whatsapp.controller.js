const aiService = require('../services/ai.service');
const whatsappService = require('../services/whatsapp.service');
const User = require('../models/User');
const Chat = require('../models/Chat');

function normalizeNumber(n) {
  if (!n) return n;
  return n.toString().replace(/[^0-9]/g, '');
}

// GET /webhook - verification
exports.verify = async (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const expected = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === expected) {
    return res.status(200).send(challenge);
  }

  return res.status(403).send('Forbidden');
};

// POST /webhook - handle incoming messages
exports.receive = async (req, res) => {
  try {
    const body = req.body;
    // Acknowledge receipt quickly
    res.sendStatus(200);

    const entries = body?.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const value = change.value || {};
        const messages = value.messages || [];
        for (const msg of messages) {
          const from = normalizeNumber(msg.from || msg.sender?.id || msg.from_number || msg.from_phone);
          const text = msg.text?.body || msg.body || '';

          if (!from || !text) continue;

          // Find or create user by phone
          let user = await User.findOne({ phone: from });
          if (!user) {
            user = await User.create({ name: `WhatsApp_${from}`, email: `${from}@whatsapp.local`, password: Math.random().toString(36).slice(2, 10), phone: from });
          }

          // Create or append to a chat
          let chat = await Chat.findOne({ user: user._id, subject: `WhatsApp:${from}` });
          if (!chat) {
            chat = await Chat.create({ user: user._id, subject: `WhatsApp:${from}`, messages: [] });
          }

          chat.messages.push({ sender: 'customer', content: text });
          chat.lastMessage = new Date();
          await chat.save();

          // Generate reply using AI service
          let aiReply = `Echo: ${text}`;
          try {
            const aiRes = await aiService.ask(`Customer: ${text}\nReply as a helpful support agent:`, { max_tokens: 200 });
            aiReply = aiRes.text || aiReply;
          } catch (e) {
            console.error('AI reply failed', e?.message || e);
          }

          // Save agent reply to chat
          chat.messages.push({ sender: 'agent', content: aiReply });
          chat.lastMessage = new Date();
          await chat.save();

          // Send reply back over WhatsApp
          try {
            await whatsappService.send(from, aiReply);
          } catch (err) {
            console.error('Failed to send WhatsApp reply', err?.message || err);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error processing WhatsApp webhook', err?.message || err);
    // already responded with 200 above when possible
  }
};

module.exports = exports;
