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
	const user = await User.findOne({ email }).select('+password')

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
	// 1. Getting token and check if it's there
	// 2. Verification token
	// 3. Check if user still exists
	// 4. Check if user changed password after the token was issued
	next()
})
