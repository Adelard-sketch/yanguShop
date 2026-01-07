exports.send = async (to, message) => {
  // integrate WhatsApp provider here
  return { to, message, status: 'sent' };
};
