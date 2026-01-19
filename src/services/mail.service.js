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
    transporter = nodemailer.createTransport(opts);
    return transporter;
  }

  // No SMTP configured — create a transport that logs emails to console for development.
  transporter = nodemailer.createTransport({ jsonTransport: true });
  return transporter;
}

function buildVerificationHtml(code) {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#222;">
      <h2 style="color:#0a69ff;margin-bottom:8px;">YanguShop — Verification Code</h2>
      <p>Your verification code is:</p>
      <p style="font-size:20px;font-weight:700;letter-spacing:2px;">${code}</p>
      <p style="color:#666;font-size:14px;margin-top:8px;">This code will expire in 1 hour. If you did not request this, please ignore this email.</p>
      <hr style="border:none;border-top:1px solid #eee;margin-top:16px;" />
      <small style="color:#999">YanguShop</small>
    </div>
  `;
}

function buildResetHtml(link) {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#222;">
      <h2 style="color:#0a69ff;margin-bottom:8px;">YanguShop — Password Reset</h2>
      <p>You requested a password reset. Click the button below to reset your password. This link is valid for 1 hour.</p>
      <p><a href="${link}" style="display:inline-block;padding:10px 16px;background:#0a69ff;color:#fff;border-radius:4px;text-decoration:none;">Reset password</a></p>
      <p style="color:#666;font-size:14px;margin-top:8px;">Or open this link in your browser: <a href="${link}">${link}</a></p>
      <hr style="border:none;border-top:1px solid #eee;margin-top:16px;" />
      <small style="color:#999">If you did not request a password reset, ignore this email.</small>
    </div>
  `;
}

exports.sendVerificationEmail = async (to, code) => {
  const t = getTransporter();
  const from = EMAIL_FROM || MAIL_USER || 'no-reply@example.com';
  const subject = 'Your YanguShop verification code';
  const text = `Your verification code is: ${code}. It will expire in 1 hour.`;
  const html = buildVerificationHtml(code);
  const info = await t.sendMail({ from, to, subject, text, html });
  if (!MAIL_HOST) {
    console.info(`Dev email (verification code) for ${to}: ${code}`);
    return info;
  }
  return info;
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
  const html = buildResetHtml(link);
  return t.sendMail({ from, to, subject, text, html });
};

exports.sendWelcomeEmail = async (to, name) => {
  const t = getTransporter();
  const from = EMAIL_FROM || MAIL_USER || 'no-reply@example.com';
  const subject = 'Welcome to YanguShop — We\'re glad you joined';
  const plain = `Hi ${name || ''},\n\nWelcome to YanguShop! We're excited to have you. Your account has been created — you can now log in and start shopping.\n\nWe promise a secure, reliable experience and friendly support. If you need help, reply to this email or visit our support page.\n\nWelcome aboard,\nThe YanguShop team`;
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#222;">
      <h2 style="color:#0a69ff;margin-bottom:8px;">Welcome to YanguShop${name ? ', ' + name : ''}!</h2>
      <p>Thank you for creating an account with YanguShop. Your account has been created successfully — you can now <strong>log in</strong> and start using our services.</p>
      <p>We promise a secure, reliable shopping experience and helpful customer support whenever you need it.</p>
      <p style="margin-top:12px;color:#666">Tips to get started:</p>
      <ul style="color:#666">
        <li>Log in and complete your profile</li>
        <li>Browse our offers and add items to your cart</li>
        <li>Contact support if you need help</li>
      </ul>
      <hr style="border:none;border-top:1px solid #eee;margin-top:16px;" />
      <small style="color:#999">YanguShop — Secure &amp; local shopping</small>
    </div>
  `;
  return t.sendMail({ from, to, subject, text: plain, html });
};
