const mongoose = require('mongoose') // Erase if already required
const Tour = require('./tourModel')
const DOCUMENT_NAME = 'Review'
const COLLECTION_NAME = 'Reviews'

// Declare the Schema of the Mongo model
var reviewSchema = new mongoose.Schema(
	{
		review: {
			type: String,
			required: [true, 'Review can not be empty'],
		},
		rating: {
			type: Number,
			min: 1,
			max: 5,
		},
		tour: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Tour',
			required: [true, 'Review must belong to a tour'],
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'Review must belong to a user'],
		},
	},
	{
		timestamps: true,
		collection: COLLECTION_NAME, // replace with your collection name
	}
)

reviewSchema.pre(/^find/, function (next) {
	// this.populate({
	// 	path: 'tour',
	// 	select: 'name',
	// })
	this.populate({
		path: 'user',
		select: 'name photo',
	})
	next()
})

reviewSchema.statics.calcAverageRatings = async function (tourId) {
	const stats = await this.aggregate([
		{
			$match: { tour: tourId },
		},
		{
			$group: {
				_id: '$tour',
				nRating: { $sum: 1 },
				avgRating: { $avg: '$rating' },
			},
		},
	])
	if (stats.length > 0) {
		await Tour.findByIdAndUpdate(tourId, {
			ratingsQuantity: stats[0].nRating,
			ratingsAverage: stats[0].avgRating,
		})
	} else {
		await Tour.findByIdAndUpdate(tourId, {
			ratingsQuantity: 0,
			ratingsAverage: 4.5,
		}) // reset the average rating to 4.5 if no reviews are found for the tour
	}
}

reviewSchema.pre('save', function () {
	// explain this
	this.constructor.calcAverageRatings(this.tour)
})

reviewSchema.pre(/^findOneAnd/, async function (next) {
	this.r = await this.findOne()
	next()
})

reviewSchema.post(/^findOneAnd/, async function (next) {
	await this.r.constructor.calcAverageRatings(this.r.tour)
})

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, reviewSchema)

// POST /tour/
