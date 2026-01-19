const Payment = require('../models/Payment');
const crypto = require('crypto');

const FLW_SECRET = process.env.FLW_SECRET_KEY || process.env.FLUTTERWAVE_KEY;
const FLW_BASE = 'https://api.flutterwave.com/v3';

async function createFlutterwavePayment(payment, user, opts = {}) {
  const tx_ref = `yangu_${payment._id}_${Date.now()}`;
  const payload = {
    tx_ref,
    amount: String(payment.amount),
    currency: payment.currency || 'UGX',
    redirect_url: process.env.FLW_REDIRECT_URL || process.env.FLUTTERWAVE_REDIRECT_URL || (opts.redirectUrl || 'http://localhost:3000/payment/complete'),
    customer: {
      email: user?.email || 'unknown@domain.test',
      phonenumber: user?.phone || '',
      name: user?.name || ''
    },
    payment_options: 'card,mobilemoneyuganda',
    meta: {
      orderId: payment.order ? String(payment.order) : null,
    }
  };

  const res = await fetch(`${FLW_BASE}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${FLW_SECRET}`
    },
    body: JSON.stringify(payload)
  });

  const body = await res.json();
  return { body, tx_ref };
}

exports.initiate = async (data, user) => {
  // data: { amount, currency?, order? }
  const p = await Payment.create({
    order: data.order || null,
    user: user ? user._id : null,
    amount: data.amount,
    currency: data.currency || 'UGX',
    status: 'initiated',
    provider: 'flutterwave'
  });

  // call Flutterwave to create a hosted payment
  const { body, tx_ref } = await createFlutterwavePayment(p, user, { redirectUrl: data.redirectUrl });

  if (body && body.status === 'success' && body.data && body.data.link) {
    p.providerRef = tx_ref;
    p.providerData = body;
    await p.save();

    return { paymentId: p._id, checkoutUrl: body.data.link, status: p.status };
  }

  // store provider response for debugging
  p.providerData = body;
  await p.save();
  throw new Error('Failed to create Flutterwave payment');
};

// Verify webhook signature (verif-hash header)
exports.verifyFlutterwaveSignature = (rawBody, headerHash) => {
  if (!FLW_SECRET || !headerHash) return false;
  try {
    const computed = crypto.createHmac('sha256', FLW_SECRET).update(rawBody).digest('hex');
    return computed === headerHash;
  } catch (e) {
    return false;
  }
};

exports.findAndUpdateByTxRef = async (tx_ref, update) => {
  const payment = await Payment.findOne({ providerRef: tx_ref });
  if (!payment) return null;
  Object.assign(payment, update);
  await payment.save();
  return payment;
};
