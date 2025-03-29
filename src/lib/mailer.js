'use strict';

const nodemailer = require("nodemailer");

module.exports = {
	transport_type : 'smtp',
	transport : {},
	use: function( transport_type ) {
		if ( 'smtp' === transport_type ) {
			this.transport_type = transport_type;
			this.transport = nodemailer.createTransport({
				host: process.env.SMTP_HOST,
				port: process.env.SMTP_PORT,
				// set the environment variable to 0 for false, any other value translates to true.
				// true for port 465, false for other ports
				secure: false,
				auth: {
					user: process.env.SMTP_USER,
					pass: process.env.SMTP_PASS,
				},
			});
		}
	},

	/**
	 * Send email.
	 *
	 * @param {String} from E.g: 'someone@example.com'
	 * @param {String} to E.g: 'john@example.com' Or, 'john@example.com,daisy@example.com'
	 * @param {String} subject 
	 * @param {string} body html for message content.
	 * @param {Object} headers E.g: { 'From': 'someone@example.com', 'My-Custom-Header': 'header value' }
	 */
    send: async function( from, to, subject, body, headers ) {
		let message = {
			from: from,
			to: to,
			subject: subject,
			html: body,
			headers: headers,
		};

		const info = await this.transport.sendMail(message);
		return true;
    },
};
