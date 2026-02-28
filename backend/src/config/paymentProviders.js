module.exports = {
  providers: {
    paystack: { key: process.env.PAYSTACK_KEY || '' },
    flutterwave: { key: process.env.FLUTTERWAVE_KEY || '' },
  },
};
