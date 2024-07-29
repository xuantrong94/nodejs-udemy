const compression = require('compression')
const express = require('express')
const { default: helmet } = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const mongoSanitizer = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')

require('dotenv').config()
const app = express()
const userRoutes = require('./routes/userRoutes')
const tourRoutes = require('./routes/tourRoutes')
const globalErrorHandler = require('./controllers/errorControllers')
const AppError = require('./utils/appError')

//* middleware
app.use(helmet())
app.use(morgan('dev'))
app.use(compression())
const limiter = rateLimit({
	max: 100,
	windowMs: 60 * 60 * 1000,
	message: 'Too many requests from this IP, please try again in an hour',
})
app.use('/api', limiter)

//* Body parser for reading data from req.body
// xử lý req sau đó gắn vào req.body
app.use(express.json({ limit: '10kb' })) // yêu cầu dạng Content-type: application/json
app.use(
	express.urlencoded({
		extended: true,
	})
) // yêu cầu dạng url-encoded `username=john_doe&password=12345` <- searchParams ?

//* Data sanitization against NoSQL query injection
app.use(mongoSanitizer())

//* Data sanitization against XSS
app.use(xss())

//* Serving static files
app.use(express.static(`${__dirname}/public`))

//* Prevent parameter pollution
app.use(
	hpp({
		whitelist: [
			'duration',
			'ratingsQuantity',
			'ratingsAverage',
			'maxGroupSize',
			'difficulty',
			'price',
		],
	})
)

//* Test middleware
app.use((req, res, next) => {
	req.requestTime = new Date().toISOString()
	next()
})

// init db
require('./dbs/init.mongodb')

// routes
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/tours', tourRoutes)

app.all('*', (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
})

// Error handling middleware
// app.use(errorHandler)
app.use(globalErrorHandler)

module.exports = app
