const Tour = require('../models/tourModel')
const APIFeatures = require('../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')

exports.top5CheapAlias = (req, res, next) => {
	req.query.limit = 5
	req.query.sort = '-ratingsAverage.price'
	req.query.fields = 'name,price,ratingsAverage,summary'
	next()
}

exports.getAllTours = async (req, res, next) => {
	try {
		// EXECUTE QUERY
		const features = new APIFeatures(Tour.find(), req.query)
			.filter()
			.sort()
			.limitFields()
			.paginate()
		const tours = await features.query

		// SEND RESPONSE
		res.status(200).json({
			status: 'success',
			results: tours.length,
			data: {
				tours,
			},
		})
	} catch (err) {
		res.status(404).json({
			status: 'fail',
			message: err,
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

exports.getTourStats = async (req, res) => {
	try {
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
	} catch (error) {
		return res.status(404).json({
			status: 'fail',
			message: error.message,
		})
	}
}

exports.getMonthlyPlan = async (req, res) => {
	try {
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
				$limit: 6
			}
		])
		res.status(200).json({
			status: 'success',
			results: plan.length,
			data: { plan },
		})
	} catch (error) {
		return res.status(404).json({
			status: 'fail',
			message: error.message,
		})
	}
}
