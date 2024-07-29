const nodemailer = require('nodemailer')
const {
	email: { host, port, username, pass },
} = require('../configs/env.config')
const sendEmail = async (options) => {
	// 1) Create a transporter
	const transporter = nodemailer.createTransport({
		host: host,
		port: port,
		secure: false,
		auth: {
			user: username,
			pass: pass,
		},
	})

	// 2) Define the email options
	const mailOptions = {
		from: 'Nodemailer <hi@demomailtrap.com>',
		// to: options.email,
		to: 'xuantrong.12cmt@gmail.com',
		subject: options.subject,
		text: options.message,
		// html:
	}

	// 3) Actually send the email
	await transporter.sendMail(mailOptions)
}

module.exports = sendEmail
