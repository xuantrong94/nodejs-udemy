const dev = {
	app: {
		port: parseInt(process.env.DEV_APP_PORT) || 4099,
	},
	db: {
		host: process.env.DEV_DB_HOST || 'localhost',
		port: parseInt(process.env.DEV_DB_PORT) || 27017,
		user: process.env.DEV_DB_USER || '',
		pass: process.env.DEV_DB_PASS || '',
		name: process.env.DEV_DB_NAME || 'nodejs',
	},
	jwt: {
		key: process.env.DEV_JWT_SECRET_KEY,
		expire: process.env.DEV_JWT_EXPIRE || '1d',
	},
}

const pro = {
	app: {
		port: parseInt(process.env.PRO_APP_PORT) || 4099,
	},
	db: {
		host: process.env.PRO_DB_HOST || 'localhost',
		port: parseInt(process.env.PRO_DB_PORT) || 27017,
		user: process.env.PRO_DB_USER || '',
		pass: process.env.PRO_DB_PASS || '',
		name: process.env.PRO_DB_NAME || 'nodejs',
	},
	jwt: {
		key: process.env.PRO_JWT_SECRET_KEY,
		expire: process.env.DEV_JWT_EXPIRE || '1d',
	},
}

const config = { dev, pro }
const env = process.env.NODE_ENV || 'dev'

module.exports = config[env]
