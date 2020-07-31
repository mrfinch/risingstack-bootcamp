const knex = require('../models/db');

knex.migrate.latest()
	.then(() => {
		console.log('migration successful');
		process.exit(0);
	})
	.catch((err) => {
		console.log('migration failed', err);
		process.exit(1);
	})
