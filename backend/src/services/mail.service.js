const nodemailer = require('nodemailer');
const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, EMAIL_FROM } = require('../config/env');

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  const opts = {};
  if (MAIL_HOST && MAIL_PORT && MAIL_USER && MAIL_PASS) {
    opts.host = MAIL_HOST;
    opts.port = parseInt(MAIL_PORT, 10) || 587;
    opts.secure = opts.port === 465;
    opts.auth = { user: MAIL_USER, pass: MAIL_PASS };
  }
  transporter = nodemailer.createTransport(opts);
  return transporter;
}

exports.sendVerificationEmail = async (to, code) => {
  const t = getTransporter();
  const from = EMAIL_FROM || MAIL_USER || 'no-reply@example.com';
  const subject = 'Your YanguShop verification code';
  const text = `Your verification code is: ${code}. It will expire in 1 hour.`;
  const html = `<p>Your verification code is: <strong>${code}</strong></p><p>It will expire in 1 hour.</p>`;
  return t.sendMail({ from, to, subject, text, html });
};

exports.sendMail = async ({ to, subject, text, html, from }) => {
  const t = getTransporter();
  const _from = from || EMAIL_FROM || MAIL_USER || 'no-reply@example.com';
  return t.sendMail({ from: _from, to, subject, text, html });
};

exports.sendPasswordResetEmail = async (to, token) => {
  const t = getTransporter();
  const from = EMAIL_FROM || MAIL_USER || 'no-reply@example.com';
  const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
  const link = `${frontend.replace(/\/$/, '')}/reset-password?token=${token}&email=${encodeURIComponent(to)}`;
  const subject = 'YanguShop password reset instructions';
  const text = `You requested a password reset. Use the following link to reset your password (valid for 1 hour): ${link}`;
  const html = `<p>You requested a password reset. Click the link below to reset your password (valid for 1 hour):</p><p><a href="${link}">${link}</a></p>`;
  return t.sendMail({ from, to, subject, text, html });
};
