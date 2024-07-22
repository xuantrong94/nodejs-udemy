const AppError = require('../utils/AppError')

// CastError refers to an invalid ID in the URL
const handleCastErrorDB = (err) => {
	const message = `Invalid ${err.path}: ${err.value}`
	return new AppError(message, 400)
}

// ValidationError is returned when a required field is missing or the data is invalid

const handleValidationErrorDB = (err) => {
	const errors = Object.values(err.errors).map((el) => el.message)
	const message = `Invalid input data. ${errors.join('. ')}`
	return new AppError(message, 400)
}

const handleDuplicateFieldsDB = (err) => {
	const message = `Duplicate field value: ${err.value} for field: ${Object.keys(err.keyValue)[0]}`
	return new AppError(message, 400)
}

const sendErrorDev = (err, res) => {
	res.status(err.statusCode).json({
		status: err.status,
		message: err.message,
		error: err.error,
		stack: err.stack,
	})
}

const sendErrorProd = (err, res) => {
	if (err.isOperational) {
		return res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
		})
	} else {
		res.status(500).json({
			status: 'error',
			message: 'Something went wrong, please try again later.',
		})
	}
	// Send generic error message
}

module.exports = (err, req, res, next) => {
	console.error('ERROR 💥', err.stack)

	err.statusCode = err.statusCode || 500
	err.status = err.status || 'error'

	if (process.env.NODE_ENV !== 'production') {
		sendErrorDev(err, res)
	} else {
		let error = { ...err }
		if (error.name === 'CastError') {
			error = handleCastErrorDB(error)
		}
		if (error.name === 'ValidationError') {
			error = handleValidationErrorDB(error)
		}
		if (error.code === 11000) {
			error = handleDuplicateFieldsDB(error)
		}
		sendErrorProd(error, res)
	}
}
