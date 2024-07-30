const mongoose = require('mongoose')
const slugify = require('slugify')
const User = require('../models/userModel')
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
		name: {
			type: String,
			required: [true, 'A tour must have a name'],
			unique: true,
			trim: true,
			maxlength: [40, 'A tour name must have less or equal than 40 characters'],
			minlength: [10, 'A tour name must have more or equal than 10 characters'],
		},
		slug: String,
		duration: {
			type: Number,
			required: [true, 'A tour must have a duration'],
			min: [1, 'Duration must be a positive integer'],
		},
		maxGroupSize: {
			type: Number,
			required: [true, 'A tour must have a size'],
			min: [1, 'Max group size must be a positive integer'],
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
			min: 0,
		},
		price: {
			type: Number,
			required: [true, 'A tour must have a price'],
			min: [0, 'Price must be a non-negative number'],
		},
		priceDiscount: {
			type: Number,
			validate: {
				validator: function (val) {
					return val < this.price
				},
				message: 'Discount price ({VALUE}) should be below the regular price',
			},
			// min: [0, 'Price discount must be a non-negative number'],
		},
		summary: {
			type: String,
			trim: true,
			required: [true, 'A tour must have a summary'],
		},
		description: {
			type: String,
			trim: true,
		},
		imageCover: {
			type: String,
			required: [true, 'A tour must have a cover image'],
		},
		images: [String],
		startDates: [Date],
		secretTour: {
			type: Boolean,
			default: false,
		},
		startLocation: {
			type: {
				type: String,
				default: 'Point',
				enum: ['Point'],
			},
			coordinates: [Number],
			address: String,
			description: String,
		},
		locations: [
			{
				type: {
					type: String,
					default: 'Point',
					enum: ['Point'],
				},
				coordinates: [Number],
				address: String,
				description: String,
				day: Number,
			},
		],
		guides: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'User',
			},
		],
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
		timestamps: true,
		collection: COLLECTION_NAME,
	}
)

tourSchema.virtual('durationWeek').get(function () {
	return this.duration / 7
})

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function (next) {
	this.slug = slugify(this.name, { lower: true })
	next()
})

//* Embedding guides:
// tourSchema.pre('save', async function (next) {
// 	const guidesPromises = this.guides.map(async (id) => await User.findById(id))
// 	this.guides = await Promise.all(guidesPromises)
// })

tourSchema.pre('save', function (next) {
	if (this.startDates) {
		const invalidDates = this.startDates.filter((date) => isNaN(Date.parse(date)))
		if (invalidDates.length > 0) {
			next(new Error('Invalid date format in start dates'))
		}
	}
	next()
})

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
	this.populate({
		path: 'guides',
		select: '-__v -createdAt -updatedAt',
	})
	next()
})

tourSchema.pre(/^find/, function (next) {
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
