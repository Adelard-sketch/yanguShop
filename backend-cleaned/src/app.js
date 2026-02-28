const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { connect } = require('./config/database');
const { MONGO_URI } = require('./config/env');
const errorHandler = require('./middlewares/error.middleware');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const shopRoutes = require('./routes/shop.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const agentRoutes = require('./routes/agent.routes');
const aiRoutes = require('./routes/ai.routes');
const whatsappRoutes = require('./routes/whatsapp.routes');
const twilioRoutes = require('./routes/twilio.routes');
const adminRoutes = require('./routes/admin.routes');
const visitRoutes = require('./routes/visit.routes');
const chatRoutes = require('./routes/chat.routes');

const app = express();
app.use(cors());
app.use(bodyParser.json());
// Parse form-encoded bodies (Twilio posts x-www-form-urlencoded)
app.use(bodyParser.urlencoded({ extended: false }));

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/ai', aiRoutes);
// WhatsApp webhook (Meta/Graph)
app.use('/webhook/whatsapp', whatsappRoutes);
// Twilio webhook and API for WhatsApp (incoming messages and send endpoint)
app.use('/webhook/twilio', twilioRoutes);
app.use('/api/twilio', twilioRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/chats', chatRoutes);

app.use(errorHandler);

// connect DB when app is required
connect(MONGO_URI).catch(() => {});

module.exports = app;
