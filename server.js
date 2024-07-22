const app = require('./src/app')
const {
	app: { port },
} = require('./src/configs/env.config')

// console.log(app.get('env'))
// console.log(process.env)

process.on('uncaughtException', (err) => {
	console.log('UNCAUGHT EXCEPTION! Shutting down...')
	console.log(err.name, err.message)
	process.exit(1)
})

const server = app.listen(port, () => {
	console.log(`Server is running on port ${port}`)
})

//* sigint is a signal that is sent to the process when you press ctrl+c
process.on('SIGINT', () => {
	console.log('Server is shutting down...')
	server.close(() => {
		console.log('Server is closed')
		process.exit(0)
	})
})
process.on('unhandledRejection', (err) => {
	console.log('UNHANDLED REJECTION! Shutting down...')
	console.log(err.name, err.message)
	server.close(() => {
		console.log('Server is closed')
		process.exit(1)
	})
})
