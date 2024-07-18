const mongoose = require('mongoose')

const DOCUMENT_NAME = 'Tour'
const COLLECTION_NAME = 'Tours'

const tourSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'A tour must have a name'],
			unique: true,
		},
		rating: {
			type: Number,
			default: 4.5,
		},
		price: {
			type: Number,
			require: [true, 'A tour must have a price'],
		},
	},
	{
		timestamps: true,
		collection: COLLECTION_NAME,
	}
)

const Tour = mongoose.model(DOCUMENT_NAME, tourSchema)

module.exports = Tour
