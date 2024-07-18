const express = require('express')
const tourController = require('../controllers/tourControllers')
const router = express.Router()

router.param('id', (req, res, next, val) => {
	console.log(`Tour id is: ${val}`)
	next()
})

// middleware checkBody
// check if body contains the name and price properties
// if not, send back 400

router
	.route('/')
	.get(tourController.getAllTours)
	.post(tourController.checkBody, tourController.createTour)

router
	.route('/:id')
	.get(tourController.getTour)
	.patch(tourController.updateTour)
	.delete(tourController.deleteTour)

module.exports = router
