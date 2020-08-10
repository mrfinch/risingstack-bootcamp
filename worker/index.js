const worker = require('./worker');
const logger = require('winston');

worker.init()
	.then(() => {
		logger.info('worked init success');
	})
	.catch((err) => {
		logger.error('worker failed to init');
		process.exit(1);
	})
