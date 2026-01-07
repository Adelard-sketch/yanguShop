const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { JWT_SECRET, JWT_EXP } = require('../config/env');
const { sendVerificationEmail } = require('./mail.service');
const { sendPasswordResetEmail } = require('./mail.service');

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
  return { message: 'Verification code sent to email', email: user.email };
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
  if (!user.isVerified) throw new Error('Email not verified');
  // Prevent agents who haven't been approved from logging in
  if (user.role === 'agent' && user.isAgentApproved === false) throw new Error('Agent account pending approval');
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
