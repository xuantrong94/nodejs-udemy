const app = require('./src/app')
const {
	app: { port },
} = require('./src/configs/env.config')

// console.log(app.get('env'))
// console.log(process.env)

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
