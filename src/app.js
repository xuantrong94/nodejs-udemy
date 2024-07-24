const compression = require('compression')
const express = require('express')
const { default: helmet } = require('helmet')
const morgan = require('morgan')
require('dotenv').config()
const app = express()
const userRoutes = require('./routes/userRoutes')
const tourRoutes = require('./routes/tourRoutes')
const globalErrorHandler = require('./controllers/errorControllers')
const {
	jwt: { key },
} = require('./configs/env.config')
// middleware
app.use(helmet())
app.use(morgan('dev'))
app.use(compression())
// xử lý req sau đó gắn vào req.body
app.use(express.json()) // yêu cầu dạng Content-type: application/json
app.use(
	express.urlencoded({
		extended: true,
	})
) // yêu cầu dạng url-encoded `username=john_doe&password=12345` <- searchParams ?

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
