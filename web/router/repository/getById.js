const Repository = require('../../../models/repository');
const joi = require('joi');
const compose = require('koa-compose');
const middleware = require('../../middlewares');

const schema = {
	id: joi.number().integer().required()
}

async function getById(ctx) {
	const result = await Repository.read(ctx.params);
	if (!result) {
		ctx.status = 404;
		return;
	}
	ctx.body = result;
}

module.exports = compose([
	middleware.validator({ params: schema }),
	getById
]);
