const User = require('../models/userModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const factory = require('./handleFactory')
const multer = require('multer')
const sharp = require('sharp')

exports.getCurrent = (req, res, next) => {
	req.params.id = req.user.id
	next()
}

// const multerStorage = multer.diskStorage({
// 	destination: (req, file, cb) => {
// 		cb(null, 'public/img/users')
// 	},
// 	filename: (req, file, cb) => {
// 		const ext = file.mimetype.split('/')[1]
// 		cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
// 	},
// })

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
	if (file.mimetype.startsWith('image')) {
		cb(null, true)
	} else {
		cb(
			new AppError('Not an image! Please upload only images.', 400),
			false
		)
	}
}

const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter,
}) // địa chỉ lưu ảnh

exports.uploadUserPhoto = upload.single('photo')

exports.resizeUserPhoto = catchAsync((req, res, next) => {
	if (!req.file) return next()

	req.file.filename = `user-${req.user.id}-${Date.now()}`

	sharp(req.file.buffer)
		.resize(500, 500)
		.toFormat('jpeg')
		.jpeg({ quality: 90 })
		.toFile(`public/img/users/${req.file.filename}`)

	next()
})

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
			new AppError(
				'This route is not for password updates. Please use /update-password',
				400
			)
		)
	}
	const adminUpdate = req.user.role === 'admin' ? 'role' : null
	// 2. Filtered out unwanted fields names that are not allowed to be updated
	const filteredBody = filterObj(
		req.body,
		'name',
		'email',
		adminUpdate
	)

	// 3. Update user document
	const updatedUser = await User.findByIdAndUpdate(
		req.user.id,
		filteredBody,
		{
			new: true,
			runValidators: true,
		}
	)

	res.status(200).json({
		status: 'success',
		data: {
			user: updatedUser,
		},
	})
})

exports.getAllUsers = factory.getAll(User)
exports.createUser = factory.createOne(User)
exports.getMember = factory.getOne(User)
exports.getUser = factory.getOne(User)
exports.deleteUser = factory.deleteOne(User)
exports.updateMember = catchAsync(async (req, res) => {
	console.log(`file --> `, req.file)
	console.log(`body --> `, req.body)
	const newData = { ...req.body, photo: req.file.filename }
	const updatedUser = await User.findOneAndUpdate(
		{ _id: req.params.userId },
		newData,
		{
			new: true,
			runValidators: false,
		}
	)
	res.status(200).json({
		status: 'success',
		data: updatedUser,
	})
})
