const Contribution = require('../../../models/contribution');
const compose = require('koa-compose');
const joi = require('joi');
const middleware = require('../../middlewares');

const schema = joi.object({
	id: joi.number().integer().required()
}).required();

async function getById(ctx) {
	const result = await Contribution.read({ repository: ctx.params });
	if (!result.length) {
		ctx.status = 404;
		return;
	}
	ctx.body = result;
}

module.exports = compose([
	middleware.validator({ params: schema }),
	getById
])
