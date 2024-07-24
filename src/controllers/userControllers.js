const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')

exports.getUser = (req, res) => {
	res.send('Get user')
}

exports.updateUser = (req, res) => {
	res.send('Update user')
}

exports.deleteUser = (req, res) => {
	res.send('Delete user')
}

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
