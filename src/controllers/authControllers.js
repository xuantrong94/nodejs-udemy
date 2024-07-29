const crypto = require('crypto') // built-in module
const { promisify } = require('util') // built-in module
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const {
	jwt: { key, expire },
} = require('../configs/env.config')
const AppError = require('../utils/appError')
const sendEmail = require('../utils/email')
const signToken = (id) => {
	return jwt.sign({ id }, key, {
		expiresIn: expire,
	})
}

exports.signup = catchAsync(async (req, res, next) => {
	const newUser = await User.create({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword,
		passwordChangeAt: req.body.passwordChangeAt,
	})

	const token = signToken(newUser._id)

	res.status(201).json({
		status: 'success',
		token,
		data: {
			user: newUser,
		},
	})
})

exports.login = catchAsync(async (req, res, next) => {
	const { email, password } = req.body

	// 1. Check if the user exists
	if (!email || !password) {
		return next(new AppError('Please provide email and password!', 400))
	}
	// 2. Check if the password is correct
	const user = await User.findOne({ email }).select('+password +passwordChangeAt')

	if (!user || !(await user.correctPassword(password, user.password))) {
		return next(new AppError('Incorrect email or password', 401))
	}

	// 3. If everything is ok, send token to client
	const token = signToken(user._id)

	res.status(200).json({
		status: 'success',
		token,
		data: {
			user: user,
		},
	})
})

exports.protect = catchAsync(async (req, res, next) => {
	let token
	// 1. Getting token and check if it's there
	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		token = req.headers.authorization.split(' ')[1]
	}
	if (!token) {
		return next(new AppError('You are not logged in! Please log in to get access.', 401))
	}

	// 2. Verification token
	const decoded = await promisify(jwt.verify)(token, key)

	// 3. Check if user still exists
	const currentUser = await User.findById(decoded.id)
	if (!currentUser) {
		return next(new AppError('User no longer exists.', 401))
	}

	// 4. Check if user changed password after the token was issued
	if (currentUser.changedPasswordAfter(decoded.iat)) {
		return next(new AppError('User recently changed password! Please log in again.', 401))
	}

	// Grant access to the protected route
	req.user = currentUser
	next()
})

exports.restrictTo = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(new Error('You do not have permission to perform this action', 403))
		}
		next()
	}
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
	// 1. Get user based on POSTed email
	const user = await User.findOne({ email: req.body.email })
	if (!user) {
		return next(new AppError('There is no user with email address.', 404))
	}
	// 2. Generate the random reset token
	const resetToken = user.createPasswordResetToken()
	await user.save({ validateBeforeSave: false })

	// 3. Send it to user's email
	const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`

	const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`
	console.log(user.email)
	try {
		await sendEmail({
			email: user.email,
			subject: 'Your password reset token (valid for 10 min)',
			message,
		})

		res.status(200).json({
			status: 'success',
			message: 'Token sent to email!',
		})
	} catch (err) {
		user.passwordResetToken = undefined
		user.passwordResetExpires = undefined
		await user.save({ validateBeforeSave: false })

		return next(new AppError(err.message), 500)
	}
})

exports.resetPassword = catchAsync(async (req, res, next) => {
	// 1. Get user base on the token
	const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

	const user = await User.findOne({
		passwordResetToken: hashedToken,
		passwordResetExpires: { $gt: Date.now() },
	})

	// 2. If token has not expired, and there is user, set the new password
	if (!user) {
		return next(new AppError('Invalid token or token has expired.', 400))
	}

	user.password = req.body.password
	user.confirmPassword = req.body.confirmPassword
	user.passwordResetToken = undefined
	user.passwordResetExpires = undefined

	await user.save()

	// 3. Update changedPasswordAt property for the user
	user.passwordChangeAt = Date.now()

	await user.save()

	res.status(200).json({
		status: 'success',
		message: 'Password reset successful! You can now log in.',
	})
	// 4. Log the user in, send jwt
	const token = signToken(user._id)

	res.status(200).json({
		status: 'success',
		token,
		data: {
			user,
		},
	})
})
