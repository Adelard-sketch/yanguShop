const Notification = require('../models/Notification');
const mail = require('./mail.service');

exports.create = async (data) => Notification.create(data);

// sendEmail accepts either (to, subject, html) or an options object { to, subject, text, html }
exports.sendEmail = async (toOrOptions, subject, html) => {
	if (typeof toOrOptions === 'string') {
		const to = toOrOptions;
		return mail.sendMail({ to, subject, html });
	}
	return mail.sendMail(toOrOptions);
};
