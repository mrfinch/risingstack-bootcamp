const path = require('path');
const envVars = process.env;

const config = {
	client: 'pg',
	version: '12.3',
	connection: {
		url: envVars.url || 'http://localhost',
		port: envVars.port || '5432',
		database: 'risingstack_bootcamp',
		password: envVars.password || '',
	},
	pool: {
		min: 1,
		max: 4
	},
	migrations: {
		directory: path.join(__dirname, './migrations')
	}
};

module.exports = config;

