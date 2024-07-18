const { body, validationResult } = require('express-validator')

exports.validateTour = [
	body('name').notEmpty().withMessage('Name is required'),
	body('rating')
		.isFloat({ min: 0, max: 5 })
		.withMessage('Rating must be between 0 and 5')
		.optional(),
	body('price').isNumeric().withMessage('Price must be a number'),
	(req, res, next) => {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ status: 'fail', errors: errors.array() })
		}
		next()
	},
]
