const TourModel = require('../models/tourModel')

exports.createTour = async ({ name, rating, price }) => {
	const newTour = await TourModel.create({ name, rating, price })
	return newTour
}
