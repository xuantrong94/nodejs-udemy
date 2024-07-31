const Tour = require('../models/tourModel')
const APIFeatures = require('../utils/apiFeatures')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')

exports.top5CheapAlias = (req, res, next) => {
	req.query.limit = 5
	req.query.sort = '-ratingsAverage.price'
	req.query.fields = 'name,price,ratingsAverage,summary'
	next()
}

exports.getAllTours = catchAsync(async (req, res, next) => {
	const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate()
	const tours = await features.query

	// SEND RESPONSE
	res.status(200).json({
		status: 'success',
		results: tours.length,
		data: {
			tours,
		},
	})
})

exports.createTour = catchAsync(async (req, res, next) => {
	const newTour = await Tour.create(req.body)

	res.status(201).json({
		status: 'success',
		data: {
			tour: newTour,
		},
	})
})

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

exports.getTour = catchAsync(async (req, res, next) => {
	const tour = await Tour.findById(req.params.id).populate('reviews')
	if (!tour) {
		return next(new AppError('No tour found', 404))
	}
	return res.status(200).json({
		status: 'success',
		data: {
			tour,
		},
	})
})

exports.updateTour = catchAsync(async (req, res, next) => {
	const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	})
	if (!tour) {
		return next(new AppError('No tour found', 404))
	}
	return res.status(200).json({
		status: 'success',
		data: {
			tour,
		},
	})
})

exports.deleteTour = catchAsync(async (req, res, next) => {
	const tour = await Tour.findByIdAndDelete(req.params.id)
	if (!tour) {
		return next(new AppError('No tour found', 404))
	}
	res.status(204).json({
		status: 'success',
		data: null,
	})
})

exports.getTourStats = catchAsync(async (req, res, next) => {
	const stats = await Tour.aggregate([
		{
			$match: { ratingsAverage: { $gte: 4.5 } },
		},
		{
			$group: {
				_id: { $toUpper: '$difficulty' },
				numTours: { $sum: 1 },
				numRatings: { $sum: '$ratingsQuantity' },
				avgRating: { $avg: '$ratingsAverage' },
				avgPrice: { $avg: '$price' },
				minPrice: { $min: '$price' },
				maxPrice: { $max: '$price' },
			},
		},
		{
			$sort: { avgPrice: 1 },
		},
		// { $match: { _id: { $ne: 'EASY' } } },
	])
	res.status(200).json({
		status: 'success',
		data: { stats },
	})
})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
	const year = req.params.year * 1
	const plan = await Tour.aggregate([
		{
			$unwind: '$startDates',
		},
		{
			$match: {
				startDates: {
					$gte: new Date(`${year}-01-01`),
					$lte: new Date(`${year}-12-31`),
				},
			},
		},
		{
			$group: {
				_id: { $month: '$startDates' },
				numTourStarts: { $sum: 1 },
				tours: { $push: '$name' },
			},
		},
		{
			$addFields: { month: '$_id' },
		},
		{
			$project: {
				_id: 0,
			},
		},
		{
			$sort: { numTourStarts: -1 },
		},
		{
			$limit: 6,
		},
	])
	res.status(200).json({
		status: 'success',
		results: plan.length,
		data: { plan },
	})
})

exports.myGetAllTours = async (req, res, next) => {
	try {
		// declare query
		let query = Tour.find()

		// filtering
		const queryObj = { ...req.query }

		const excludedFields = ['page', 'fields', 'limit', 'sort']
		excludedFields.forEach((el) => delete queryObj[el])

		// transfer
	} catch (error) {
		return res.status(400).json({
			status: 'fail',
			message: error.message,
		})
	}
}
