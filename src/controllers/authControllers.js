const { promisify } = require('util') // built-in module
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const {
	jwt: { key, expire },
} = require('../configs/env.config')
const AppError = require('../utils/appError')

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
