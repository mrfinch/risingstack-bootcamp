const joi = require('joi');

const schema = joi.object({
	redisUrl: joi.string().required()
}).unknown().required();

const envVars = joi.attempt(process.env, schema);

const config = {
	redisUrl: envVars.url
}

module.exports = config;
