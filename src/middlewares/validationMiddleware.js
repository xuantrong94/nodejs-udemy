const { body, validationResult } = require('express-validator')

exports.validateTour = [
	body('name')
		.isString()
		.withMessage('Name must be a string')
		.notEmpty()
		.withMessage('A tour must have a name')
		.isLength({ min: 10, max: 40 })
		.withMessage('A tour name must be between 10 and 40 characters'),

	body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),

	body('maxGroupSize').isInt({ min: 1 }).withMessage('Max group size must be a positive integer'),

	body('difficulty')
		.isIn(['easy', 'medium', 'difficult'])
		.withMessage('Difficulty must be either: easy, medium, or difficult'),

	body('ratingsAverage')
		.isFloat({ min: 1, max: 5 })
		.withMessage('Rating must be between 1.0 and 5.0'),

	body('ratingsQuantity')
		.isInt({ min: 0 })
		.withMessage('Ratings quantity must be a non-negative integer'),

	body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),

	body('priceDiscount')
		// .isFloat({ min: 0 })
		// .withMessage('Price discount must be a non-negative number')
		.custom((value, { req }) => {
			if (value >= req.body.price) {
				throw new Error('Discount price should be below the regular price')
			}
			return true
		}),

	body('summary')
		.isString()
		.withMessage('Summary must be a string')
		.notEmpty()
		.withMessage('A tour must have a summary'),

	body('description').optional().isString().withMessage('Description must be a string'),

	body('imageCover')
		.isString()
		.withMessage('Image cover must be a string')
		.notEmpty()
		.withMessage('A tour must have a cover image'),

	body('images').optional().isArray().withMessage('Images must be an array of strings'),

	body('startDates')
		.optional()
		.isArray()
		.withMessage('Start dates must be an array')
		.custom((value) => {
			if (!value.every((date) => !isNaN(Date.parse(date)))) {
				throw new Error('Invalid date format in start dates')
			}
			return true
		}),

	body('secretTour').optional().isBoolean().withMessage('Secret tour must be a boolean'),
	(req, res, next) => {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ status: 'fail', errors: errors.array() })
		}
		next()
	},
]
