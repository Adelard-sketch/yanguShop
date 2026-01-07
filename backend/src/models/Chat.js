const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [
    {
      sender: {
        type: String,
        enum: ['customer', 'agent'],
        required: true
      },
      content: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],
  subject: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['order', 'product', 'shipping', 'return', 'payment', 'general', 'complaint'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'closed', 'resolved'],
    default: 'open'
  },
  assignedAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  lastMessage: {
    type: Date,
    default: Date.now
  },
  charts: [
    {
      title: { type: String },
      type: { type: String, enum: ['line', 'bar', 'pie', 'area'], default: 'line' },
      data: { type: Array, default: [] },
      responses: [
        {
          sender: { type: String, enum: ['agent', 'customer'], required: true },
          content: { type: String },
          createdAt: { type: Date, default: Date.now }
        }
      ],
      createdAt: { type: Date, default: Date.now }
    }
  ],
  hasChartResponse: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
