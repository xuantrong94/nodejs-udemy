const Tour = require('../models/tourModel')
const catchAsync = require('../utils/catchAsync')

exports.top5CheapAlias = (req, res, next) => {
	req.query.limit = 5
	req.query.sort = '-ratingsAverage.price'
	req.query.fields = 'name,price,ratingsAverage,summary'
	next()
}

class APIFeatures {
	constructor(query, queryString) {
		this.query = query
		this.queryString = queryString
	}
}

exports.checkBody = (req, res, next) => {
	if (!req.body.name || !req.body.price) {
		return res.status(400).json({
			status: 'fail',
			message: 'Missing name or price',
		})
	}
	next()
}

exports.getTour = async (req, res) => {
	try {
		const tour = await Tour.findById(req.params.id)
		return res.status(200).json({
			status: 'success',
			data: {
				tour,
			},
		})
	} catch (error) {
		return res.status(400).json({
			status: 'Internal Server Error',
			message: error.message,
		})
	}
}

exports.updateTour = async (req, res) => {
	try {
		const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		})
		return res.status(200).json({
			status: 'success',
			data: {
				tour,
			},
		})
	} catch (error) {
		return res.status(404).json({
			status: 'Internal Server Error',
			message: error.message,
		})
	}
}

exports.deleteTour = async (req, res) => {
	try {
		await Tour.findByIdAndDelete(req.params.id)
		res.status(204).json({
			status: 'success',
			data: null,
		})
	} catch (error) {
		return res.status(404).json({
			status: 'fail',
			message: error.message,
		})
	}
}

exports.getAllTours = async (req, res, next) => {
	try {
		// BUILD QUERY
		// 1. Filtering
		const queryObj = { ...req.query }
		const excludedFields = ['page', 'sort', 'limit', 'fields']
		excludedFields.forEach((el) => delete queryObj[el])

		// 2. Advanced Filtering
		let queryString = JSON.stringify(queryObj)
		queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
		// ?difficulty=easy&duration[gte]=5
		// {difficulty: 'easy', duration: {$gte: 5}}

		let query = Tour.find(JSON.parse(queryString))

		// 3. Sorting
		if (req.query.sort) {
			const sortBy = req.query.sort.split(',').join(' ')
			query = query.sort(sortBy)
		} else {
			query = query.sort('-createdAt')
		}

		// 4. Fields
		if (req.query.fields) {
			const fields = req.query.sort.split(',').join(' ')
			query = query.select(fields)
		} else {
			query = query.select('-__v')
		}

		// 5. Pagination
		const page = req.query.page * 1 || 1
		const limit = req.query.limit * 1 || 10
		//page=3&limit=10 means skip the first page (1-10) and the second page (11-20) in total 20 result
		const skip = (page - 1) * limit

		query = query.skip(skip).limit(limit)

		if (req.query.page) {
			const numTours = await Tour.countDocuments()
			if (skip >= numTours) throw new Error('This page does not exist')
		}
		// EXECUTE QUERY
		const tours = await query

		return res.status(200).json({
			status: 'success',
			results: tours.length,
			data: {
				tours,
			},
		})
	} catch (error) {
		return res.status(404).json({
			status: 'fail',
			message: error.message,
		})
	}
}
exports.createTour = async (req, res) => {
	try {
		const newTour = await Tour.create(req.body)

		res.status(201).json({
			status: 'success',
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
		status: 'success',
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
