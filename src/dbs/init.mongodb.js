const { default: mongoose } = require('mongoose')
const {
	db: { host, port, user, pass, name },
} = require('../configs/env.config')

const connectString = `${host}://${user}:${pass}@mycluster.j59yckg.mongodb.net/${name}?retryWrites=true&w=majority&appName=MyCluster`

class Database {
	constructor(db) {
		this.connect()
	}
	connect(type = 'mongodb') {
		if (true) {
			mongoose.set('debug', true)
			mongoose.set('debug', { color: true })
		}
		mongoose
			.connect(connectString, {
				maxPoolSize: 50,
			})
			.then((_) => {
				console.log(`Connected to MongoDB ${name} successfully`)
				// countConnect()
			})
			.catch((error) => console.log('Connect to MongoDB failed', error))
	}
	static getInstance() {
		if (!Database.instance) {
			Database.instance = new Database(mongoose)
		}
		return Database.instance
	}
}

const instanceMongodb = Database.getInstance()

module.exports = instanceMongodb
