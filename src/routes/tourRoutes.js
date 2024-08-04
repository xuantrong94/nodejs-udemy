const express = require('express')
const tourController = require('../controllers/tourControllers')
const authController = require('../controllers/authControllers')
const reviewControllers = require('../controllers/reviewControllers')
const reviewRouter = require('../routes/reviewRoutes')
const {
	validateTour,
} = require('../middlewares/validationMiddleware')
const router = express.Router()

router.param('id', (req, res, next, val) => {
	console.log(`Tour id is: ${val}`)
	next()
})

// alias routes
router
	.route('/top-5-cheap')
	.get(
		tourController.top5CheapAlias,
		tourController.getAllTours
	)

router.route('/:tourId/reviews', reviewRouter)

// stats-aggregation routes
router.route('/tour-stats').get(tourController.getTourStats)
router
	.route('/monthly-plan/:year')
	.get(tourController.getMonthlyPlan)


router.route('/tour-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin)
router.route('distance/:latlng/unit/:unit').get(tourController.getDistances)

// crud routes
router
	.route('/')
	.get(tourController.getAllTours)
	.post(validateTour, tourController.createTour)

router
	.route('/:id')
	.get(tourController.getTour)
	.patch(validateTour, tourController.updateTour)
	.delete(
		authController.protect,
		authController.restrictTo('admin'),
		tourController.deleteTour
	)

router
	.route('/:tourId/reviews')
	.post(
		authController.protect,
		authController.restrictTo('user'),
		reviewControllers.createReview
	)

module.exports = router
