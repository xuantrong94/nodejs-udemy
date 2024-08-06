const express = require('express')
const path = require('path')

const morgan = require('morgan')
const { default: helmet } = require('helmet')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const mongoSanitizer = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const cookieParser = require('cookie-parser')

require('dotenv').config()
const tourRoutes = require('./routes/tourRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
const userRoutes = require('./routes/userRoutes')

const globalErrorHandler = require('./controllers/errorControllers')
const AppError = require('./utils/appError')

const app = express()
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

//* middleware
app.use(morgan('dev'))

//* Global middleware
// Set security HTTP headers
app.use(helmet())
app.use(compression())
const limiter = rateLimit({
	max: 100,
	windowMs: 60 * 60 * 1000,
	message:
		'Too many requests from this IP, please try again in an hour',
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
app.use(cookieParser())

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

//* init db
require('./dbs/init.mongodb')

//* routes
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/tours', tourRoutes)
app.use('/api/v1/reviews', reviewRoutes)

app.get('/', (req, res) => {
	res.render('base', {
		tour: 'The Forest Hiker',
		user: 'Jonas',
	})
})

app.all('*', (req, res, next) => {
	next(
		new AppError(`Can't find ${req.originalUrl} on this server`, 404)
	)
})

// Error handling middleware
// app.use(errorHandler)
app.use(globalErrorHandler)

module.exports = app
