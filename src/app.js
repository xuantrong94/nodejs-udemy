const compression = require('compression')
const express = require('express')
const { default: helmet } = require('helmet')
const morgan = require('morgan')
require('dotenv').config()
const app = express()

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

module.exports = app
