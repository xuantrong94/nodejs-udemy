const mongoose = require('mongoose')

const DOCUMENT_NAME = 'Tour'
const COLLECTION_NAME = 'Tours'

const tourSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'A tour must have a name'],
			unique: true,
			trim: true,
		},
		duration: {
			type: Number,
			required: [true, 'A tour must have a duration'],
		},
		maxGroupSize: {
			type: Number,
			required: [true, 'A tour must have a size'],
		},
		difficulty: {
			type: String,
			required: [true, 'A tour must have a difficulty'],
		},
		ratingsAverage: {
			type: Number,
			default: 4.5,
		},
		ratingsQuantity: {
			type: Number,
			default: 0,
		},
		price: {
			type: Number,
			require: [true, 'A tour must have a price'],
		},
		priceDiscount: Number,
		summary: {
			type: String,
			trim: true,
			require: [true, 'A tour must have a summary'],
		},
		description: {
			type: String,
			trim: true,
		},
		imageCover: {
			type: String,
			require: [true, 'A tour must have a cover image'],
		},
		images: [String],
		startDates: [Date],
	},
	{
		timestamps: true,
		collection: COLLECTION_NAME,
	}
)

const Tour = mongoose.model(DOCUMENT_NAME, tourSchema)

module.exports = Tour
