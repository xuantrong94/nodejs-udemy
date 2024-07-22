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
			maxLength: [40, 'A tour name must have less or equal than 40 characters'],
			minLength: [10, 'A tour name must have more or equal than 10 characters'],
		},
		slug: String,
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
			enum: {
				values: ['easy', 'medium', 'difficult'],
				message: 'Difficulty is either: easy, medium, difficult',
			},
		},
		ratingsAverage: {
			type: Number,
			default: 4.5,
			min: [1, 'Rating must be above 1.0'],
			max: [5, 'Rating must be below 5.0'],
		},
		ratingsQuantity: {
			type: Number,
			default: 0,
		},
		price: {
			type: Number,
			require: [true, 'A tour must have a price'],
		},
		priceDiscount: {
			type: Number,
			validate: {
				// this only points to current doc on NEW document creation
				validator: function (val) {
					return val < this.price
				},
				message: 'Discount price ({VALUE}) should be below the regular price',
			},
		},
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
		secretTour: {
			type: Boolean,
			default: false,
		},
	},
	{
		toJSON: {
			virtuals: true,
		},
		toObject: {
			virtuals: true,
		},
		timestamps: true,
		collection: COLLECTION_NAME,
	}
)

tourSchema.virtual('durationWeek').get(function () {
	return this.duration / 7
})

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function () {
	this.slug = slugify(this.name, { lower: true })
	next()
})

// QUERY MIDDLEWARE
tourSchema.pre('^find', function (next) {
	this.find({ secretTour: { $ne: true } }) //ne = not equal
	next()
})

// AGGREGATE MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
	this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
	next()
})

const Tour = mongoose.model(DOCUMENT_NAME, tourSchema)

module.exports = Tour
