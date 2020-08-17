const joi = require('joi');

function validatorFactory(schemas) {
	return async function validatorMiddleware(ctx, next) {
		try {
			[ 'params', 'query', 'body' ]
				.forEach((partToValidate) => {
					const toValidate = ctx.request[partToValidate] || ctx[partToValidate];
					if (schemas[partToValidate]) {
						// see output of .label
						const validatedData = joi.attempt(toValidate, schemas[partToValidate]);
						Object.assign(toValidate, validatedData);
					}
				})

			if (schemas.body && ctx.request.body) {
				ctx.request.body = joi.attempt(ctx.request.body, schemas.body.label('body'));
			}
		} catch (err) {
			if (!err.isJoi) {
				throw err;
			}

			ctx.status = 400;
			ctx.body = err.message;

			return;
		}
		await next();
	}
}

module.exports = validatorFactory;
