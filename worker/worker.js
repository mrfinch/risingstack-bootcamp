const { subscriber, publisher, CHANNELS } = require('../models/redis');
const logger = require('winston');
const handlers = require('./handlers');

async function init() {
	await Promise.all([
		subscriber.connect(),
		publisher.connect()
	]);
	await subscriber.subscribe(
		CHANNELS.collect.trigger.v1,
		CHANNELS.collect.repository.v1,
		CHANNELS.collect.contributions.v1
	);
	await subscriber.on('message', (channel, message) => {
		let messageObject;
		try {
			messageObject = JSON.parse(message);
		} catch(err) {
			console.log('msg parse failed', err);
			return;
		}
		// console.log('inside msg', messageObject, channel);
		switch(channel) {
			case CHANNELS.collect.trigger.v1:
				// console.log('inside trigger');
				handlers.trigger(messageObject).catch(logError);
				break;
			case CHANNELS.collect.repository.v1:
				// console.log('inside repo')
				handlers.repository(messageObject).catch(logError);
				break;
			case CHANNELS.collect.contributions.v1:
				handlers.contributions(messageObject).catch(logError);
				break;
			default:
				console.log('no channel subscription', channel);
				break;
		}
		logger.info('message received', { channel, message });
	})
	function logError(err) {
		console.log('handler trigger failed', err);
	}
}

async function halt() {
	await Promise.all([
		subscriber.disconnect(),
		publisher.disconnect()
	])
}

module.exports = {
	init,
	halt
};
