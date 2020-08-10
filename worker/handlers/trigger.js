const logger = require('winston');
const joi = require('joi');
const redis = require('../../models/redis');
const { CHANNELS } = redis;

const schema = joi.object({
	date: joi.date().raw().required(),
	query: joi.string().required()
}).required();

async function onTrigger(message) {
	console.log('onTrigger start', message);

	let data;
	try {
		data = joi.attempt(message, schema);
	} catch(err) {
		logger.error('trigged schema validation failed', { err: err });
		return;
	}
	const { date, query } = data;

	await Promise.all([...Array(10).keys()].map((page) => {
		redis.publishObject(CHANNELS.collect.repository.v1, {
			date,
			query,
			page
		})
	}));
}

module.exports = onTrigger;
