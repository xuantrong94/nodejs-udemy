const mongoose = require('mongoose') // Erase if already required

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

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, reviewSchema)

// POST /tour/