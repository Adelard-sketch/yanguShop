const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { JWT_SECRET, JWT_EXP, TWILIO_ACCOUNT_SID } = require('../config/env');
const { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } = require('./mail.service');
const whatsappService = require('./whatsapp.service');
const twilioService = require('./twilio.service');

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.register = async (data) => {
  if (!data.email || !data.password) throw new Error('Email and password required');
  if (!EMAIL_RE.test(data.email)) throw new Error('Invalid email format');
  const exists = await User.findOne({ email: data.email });
  if (exists) throw new Error('User already exists');
  const hash = await bcrypt.hash(data.password, 10);
  const code = generateCode();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  const user = await User.create({ ...data, password: hash, isVerified: false, verificationCode: code, verificationExpires: expires });
  // send verification email (do not block on failure)
  try { await sendVerificationEmail(user.email, code); } catch (err) { /* log but continue */ }
  // send a welcome email (do not block on failure)
  try { await sendWelcomeEmail(user.email, user.name); } catch (err) { /* log but continue */ }

  // Return a message directing user to login (frontend should redirect to login page)
  return { message: 'Account created. Please login.', email: user.email, redirect: '/login', isVerified: !!user.isVerified };
};

exports.verifyEmail = async ({ email, code }) => {
  if (!email || !code) throw new Error('Email and code required');
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');
  if (user.isVerified) return { message: 'Already verified' };
  if (!user.verificationCode || user.verificationCode !== code) throw new Error('Invalid code');
  if (user.verificationExpires && user.verificationExpires < new Date()) throw new Error('Code expired');
  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationExpires = undefined;
  await user.save();
  const payload = { id: user._id.toString(), role: user.role, email: user.email, name: user.name };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXP || '7d' });
  return { token, user: { id: user._id, email: user.email, name: user.name, role: user.role } };
};

exports.resendVerification = async ({ email }) => {
  if (!email) throw new Error('Email required');
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');
  if (user.isVerified) return { message: 'Already verified' };
  const code = generateCode();
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  user.verificationCode = code;
  user.verificationExpires = expires;
  await user.save();
  try { await sendVerificationEmail(user.email, code); } catch (err) { /* log but continue */ }
  return { message: 'Verification code resent' };
};

exports.login = async (data) => {
  if (!data.email || !data.password) throw new Error('Email and password required');
  const user = await User.findOne({ email: data.email });
  if (!user) throw new Error('Invalid credentials');
  const match = await bcrypt.compare(data.password, user.password);
  if (!match) throw new Error('Invalid credentials');
  // Allow login attempts even if email is not verified so we can send a login code
  // Frontend should show a notice prompting the user to verify their email if `isVerified` is false.
  // Prevent agents who haven't been approved from logging in
  if (user.role === 'agent' && user.isAgentApproved === false) throw new Error('Agent account pending approval');
  // Generate a temporary login code and send to user's email
  const code = generateCode();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  user.loginCode = code;
  user.loginExpires = expires;
  await user.save();
  let sentEmail = false;
  let sentWhatsapp = false;
  try {
    await sendVerificationEmail(user.email, code);
    sentEmail = true;
  } catch (err) { /* log but continue */ }

  if (user.phone) {
    try {
      // Prefer Twilio for WhatsApp if configured, otherwise use WhatsApp Cloud API
      let res;
      if (TWILIO_ACCOUNT_SID) {
        res = await twilioService.send(user.phone, `Your YanguShop login code is: ${code}. It expires in 10 minutes.`);
      } else {
        res = await whatsappService.send(user.phone, `Your YanguShop login code is: ${code}. It expires in 10 minutes.`);
      }
      if (res && res.status && res.status !== 'skipped') sentWhatsapp = true;
    } catch (err) { /* log but continue */ }
  }

  return { message: 'Login code sent', email: user.email, needCode: true, via: { email: sentEmail, whatsapp: sentWhatsapp }, isVerified: !!user.isVerified };
};

exports.verifyLogin = async ({ email, code }) => {
  if (!email || !code) throw new Error('Email and code required');
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');
  if (!user.loginCode || user.loginCode !== code) throw new Error('Invalid code');
  if (user.loginExpires && user.loginExpires < new Date()) throw new Error('Code expired');
  // clear temporary code
  user.loginCode = undefined;
  user.loginExpires = undefined;
  await user.save();
  const payload = { id: user._id.toString(), role: user.role, email: user.email, name: user.name };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXP || '7d' });
  return { token, user: { id: user._id, email: user.email, name: user.name, role: user.role } };
};

exports.requestPasswordReset = async ({ email }) => {
  if (!email) throw new Error('Email required');
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');
  const token = crypto.randomBytes(20).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  user.passwordResetToken = tokenHash;
  // Optionally store plain token for local integration testing (enable via env)
  if (process.env.ALLOW_PLAIN_RESET_TOKEN === 'true') {
    user.passwordResetPlain = token;
  }
  user.passwordResetExpires = expires;
  await user.save();
  try { await sendPasswordResetEmail(user.email, token); } catch (err) { /* log but continue */ }
  return { message: 'Password reset instructions sent to email' };
};

exports.resetPassword = async ({ email, token, password }) => {
  if (!email || !token || !password) throw new Error('Email, token and new password required');
  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid token or email');
  if (!user.passwordResetToken) throw new Error('Invalid token or email');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  if (user.passwordResetToken !== tokenHash) throw new Error('Invalid token or email');
  if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) throw new Error('Token expired');
  const hash = await bcrypt.hash(password, 10);
  user.password = hash;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  const payload = { id: user._id.toString(), role: user.role, email: user.email, name: user.name };
  const jwtToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXP || '7d' });
  return { message: 'Password reset successful', token: jwtToken, user: { id: user._id, email: user.email, name: user.name, role: user.role } };
};
