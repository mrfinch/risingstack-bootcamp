const compose = require('koa-compose');
const joi = require('joi');
const middleware = require('../../middlewares');
const Repository = require('../../../models/repository');

const schema = joi.object({
	owner: joi.string().required(),
	name: joi.string().required()
}).required();

async function getByName(ctx) {
	const { owner, name } = ctx.params;
	const fullName = `${owner}/${name}`;
	const result = await Repository.read({ full_name: fullName });
	if (!result) {
		ctx.status = 404;
		return;
	}
	ctx.body = result;
}

module.exports = compose([
	middleware.validator({ params: schema }),
	getByName
]);
