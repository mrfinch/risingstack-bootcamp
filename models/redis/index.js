const Redis = require('ioredis');
const config = require('./config');

const CHANNELS = {
	collect: {
		trigger: {
			v1: 'bootcamp.collect.trigger.v1'
		},
		repository: {
			v1: 'bootcamp.collect.repository.v1'
		},
		contributions: {
			v1: 'bootcamp.collect.contributions.v1'
		}
	}
}

const subscriber = new Redis(config.redisUrl, { lazyConnect: true, dropBufferSupport: true });
const publisher = new Redis(config.redisUrl, { lazyConnect: true, dropBufferSupport: true });

function publishObject(channel, message) {
	console.log('publish', channel);
	return publisher.publish(channel, JSON.stringify(message));
}

async function destroy() {
	subscriber.disconnect();
	publisher.disconnect();
}

module.exports = {
	subscriber,
	publisher,
	publishObject,
	destroy,
	CHANNELS
};
