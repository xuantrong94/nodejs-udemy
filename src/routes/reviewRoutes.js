const express = require('express')
const router = express.Router()
const reviewControllers = require('../controllers/reviewControllers')
const authController = require('../controllers/authControllers')
router
	.route('/')
	.get(reviewControllers.getAllReviews)
	.post(authController.protect, authController.restrictTo('user'), reviewControllers.createReview)

module.exports = router
