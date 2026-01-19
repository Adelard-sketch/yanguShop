(async () => {
  try {
    // Load environment (uses src/config/env.js which reads .env at project root)
    require('../src/config/env');
    const mailService = require('../src/services/mail.service');

    const to = process.env.TEST_EMAIL || 'adelardborauzima7@gmail.com';
    console.log(`Sending test email to ${to}...`);

    const info = await mailService.sendMail({
      to,
      subject: 'YanguShop — Test email',
      text: 'This is a test email sent from the YanguShop backend.',
      html: '<p>This is a <strong>test</strong> email sent from the YanguShop backend.</p>'
    });

    console.log('sendMail result:', info);
    process.exit(0);
  } catch (err) {
    console.error('Error sending test email:', err);
    process.exit(1);
  }
})();
