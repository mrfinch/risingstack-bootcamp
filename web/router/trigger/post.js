const joi = require('joi');
const redis = require('../../../models/redis');
const compose = require('koa-compose');
const middleware = require('../../middlewares');

const schema = joi.object({
	query: joi.string().required()
}).required();

async function post(ctx) {
	const { query } = ctx.request.body;

	await redis.publishObject(
		redis.CHANNELS.collect.trigger.v1,
		{
			query: query,
			date: new Date().toISOString()
		}
	);

	ctx.status = 201;
}

module.exports = compose([
	middleware.validator({ body: schema }),
	post
]);
