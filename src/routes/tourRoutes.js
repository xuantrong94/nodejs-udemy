const express = require('express')
const tourController = require('../controllers/tourControllers')
const { validateTour } = require('../middlewares/validationMiddleware')
const router = express.Router()

router.param('id', (req, res, next, val) => {
	console.log(`Tour id is: ${val}`)
	next()
})

// alias routes
router.route('/top-5-cheap').get(tourController.top5CheapAlias, tourController.getAllTours)

// stats-aggregation routes
router.route('/tour-stats').get(tourController.getTourStats)
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan)

// crud routes
router.route('/').get(tourController.getAllTours).post(tourController.createTour)

router
	.route('/:id')
	.get(tourController.getTour)
	.patch(tourController.updateTour)
	.delete(tourController.deleteTour)

module.exports = router
