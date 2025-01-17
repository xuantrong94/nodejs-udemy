const catchAsync = require('../utils/catchAsync')
const Review = require('../models/reviewModel')
const AppError = require('../utils/appError')
const factory = require('./handleFactory')

exports.getTourUserIds = (req, res, next) => {
	if (!req.body?.tour) {
		req.body.tour = req.params.tourId
	}
	if (!req.body.user) {
		req.body.user = req.user.id
	}
	next()
}

exports.getAllReviews = factory.getAll(Review)
exports.createReview = factory.createOne(Review)
exports.getReview = factory.getOne(Review)
exports.updateReview = factory.updateOne(Review)
exports.deleteReview = factory.deleteOne(Review)
