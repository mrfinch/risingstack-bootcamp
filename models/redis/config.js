const joi = require('joi');

const schema = joi.object({
	url: joi.string().required()
}).unknown().required();

const envVars = joi.attempt(process.env, schema);

const config = {
	url: envVars.url
}

module.exports = config;
