const User = require('../models/userModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')

exports.getUser = (req, res) => {
	res.send('Get user')
}

exports.updateUser = catchAsync(async (req, res) => {
	const filterObj = (obj, ...allowedFields) => {
		const newObj = {}
		// Object.keys(obj) returns an array of all the keys in obj.
		Object.keys(obj).forEach((el) => {
			//During each iteration, it checks if the element (el) is included in the allowedFields array.
			// If it is, it adds that property to newObj.
			if (allowedFields.includes(el)) newObj[el] = obj[el]
		})
		return newObj
	}
	// 1. Create error if user POSTs password data
	if (req.body.password || req.body.confirmPassword) {
		return next(
			new AppError('This route is not for password updates. Please use /update-password', 400)
		)
	}

	// 2. Filtered out unwanted fields names that are not allowed to be updated
	const filteredBody = filterObj(req.body, 'name', 'email')

	// 3. Update user document
	const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
		new: true,
		runValidators: true,
	})

	res.status(200).json({
		status: 'success',
		data: {
			user: updatedUser,
		},
	})
})

exports.deleteUser = catchAsync(async (req, res, next) => {
	await User.findByIdAndUpdate(req.user.id, { active: false })

	res.status(204).json({
		status: 'success',
		data: null,
	})
})

exports.getAllUsers = catchAsync(async (req, res, next) => {
	const users = await User.find({})
	res.status(200).json({
		status: 'success',
		results: users.length,
		data: {
			users,
		},
	})
})

exports.createUser = (req, res) => {
	res.send('Create user')
}

exports.UpdateMember = catchAsync(async (req, res, next) => {})
