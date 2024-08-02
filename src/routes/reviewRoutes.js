const express = require('express')
const router = express.Router({ mergeParams: true })
const reviewControllers = require('../controllers/reviewControllers')
const authController = require('../controllers/authControllers')
router
	.route('/')
	.get(reviewControllers.getAllReviews)
	.post(
		authController.protect,
		authController.restrictTo('user'),
		reviewControllers.getTourUserIds,
		reviewControllers.createReview
	)

router
	.route('/:id')
	.patch(authController.protect, reviewControllers.updateReview)
	.delete(authController.protect, reviewControllers.deleteReview)

module.exports = router
