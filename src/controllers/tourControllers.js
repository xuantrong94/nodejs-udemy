const Tour = require('../models/tourModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const factory = require('./handleFactory')
const multer = require('multer')

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
})

exports.uploadTourImages = upload.fields([
	{
		name: 'imageCover',
		maxCount: 1,
	},
	{
		name: 'images',
		maxCount: 3,
	},
])

exports.top5CheapAlias = (req, res, next) => {
	req.query.limit = 5
	req.query.sort = '-ratingsAverage.price'
	req.query.fields = 'name,price,ratingsAverage,summary'
	next()
}

exports.getAllTours = factory.getAll(Tour)
exports.getTour = factory.getOne(Tour, {
	path: 'reviews',
	select: 'review rating user',
})
exports.createTour = factory.createOne(Tour)
exports.updateTour = factory.updateOne(Tour)
exports.deleteTour = factory.deleteOne(Tour)

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

exports.getToursWithin = catchAsync(async (req, res, next) => {
	const { distance, latlng, unit } = req.params
	const [lat, lng] = latlng.split(',')

	const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1

	if (!lat || !lng) {
		next(
			new AppError(
				'Please provide latitude and longitude in the format lat,lng.',
				400
			)
		)
	}
	const tours = await Tour.find({
		startLocation: {
			$geoWithin: { $centerSphere: [[lng, lat], radius] },
		},
	})
	return res.status(200).json({
		status: 'success',
		results: tours.length,
		data: {
			data: tours,
		},
	})
})

exports.getDistances = catchAsync(async (req, res, next) => {
	const { latlng, unit } = req.params
	const [lat, lng] = latlng.split(',')

	if (!lat || !lng) {
		next(
			new AppError(
				'Please provide latitude and longitude in the format lat,lng.',
				400
			)
		)
	}
	const distances = await Tour.aggregate([
		{
			$geoNear: {
				near: {
					type: 'Point',
					coordinates: [parseFloat(lng), parseFloat(lat)],
				},
				distanceField: 'distance',
				distanceMultiplier: unit === 'mi' ? 0.000621371 : 0.001,
				spherical: true,
				maxDistance: 1000000,
				unit: unit === 'mi' ? 'miles' : 'kilometers',
			},
		},
		{
			$project: {
				name: 1,
				distance: 1,
			},
		},
	])

	return res.status(200).json({
		status: 'success',
		data: {
			data: distances,
		},
	})
})
