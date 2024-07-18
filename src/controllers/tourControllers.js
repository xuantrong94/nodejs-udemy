const Tour = require('../models/tourModel')
const catchAsync = require('../utils/catchAsync')

exports.checkBody = (req, res, next) => {
	if (!req.body.name || !req.body.price) {
		return res.status(400).json({
			status: 'fail',
			message: 'Missing name or price',
		})
	}
	next()
}

exports.getTour = (req, res) => {
	res.send('Get Tour')
}

exports.updateTour = (req, res) => {
	res.send('Update Tour')
}

exports.deleteTour = (req, res) => {
	res.send('Delete Tour')
}

exports.getAllTours = async (req, res) => {
	try {
		const tours = await Tour.find()
		if (tours.length === 0) {
			res.status(404).json({
				status: 'no available',
				message: 'No tours found',
			})
		}
		res.status(200).json({
			status: 'success',
			results: tours.length,
			data: {
				tours,
			},
		})
	} catch (error) {
		res.status(400).json({
			status: 'fail',
			message: error.message,
		})
	}
}

exports.createTour = async (req, res) => {
	try {
		const newTour = await Tour.create({
			name: req.body.name,
			rating: req.body.rating,
			price: req.body.price,
		})

		res.status(201).json({
			status: 'Created Tour Successfully',
			data: {
				tour: newTour,
			},
		})
	} catch (err) {
		res.status(400).json({
			status: 'fail',
			message: err.message,
		})
	}
}

exports.createTourProVer = catchAsync(async (req, res, next) => {
	const { name, rating, price } = req.body

	// Call the service function to create a tour
	const newTour = await createTour({ name, rating, price })

	res.status(201).json({
		status: 'Created Tour Successfully',
		data: {
			tour: newTour,
		},
	})
})

exports.getAllToursProVer = catchAsync(async (req, res, next) => {
	const tours = await Tour.find()

	if (!tours.length) {
		return res.status(404).json({
			status: 'fail',
			message: 'No tours found',
		})
	}

	res.status(200).json({
		status: 'success',
		results: tours.length,
		data: {
			tours,
		},
	})
})
