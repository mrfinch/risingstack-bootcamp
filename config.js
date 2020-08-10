const joi = require('joi');

const schema = joi.object({
	envType: joi.string().allow(['development', 'production', 'test']).default('development'),
	processType: joi.string().allow(['web', 'worker']).required()
}).required();

const envVars = process.env;
const config = {
	environment: envVars.NODE_ENV,
	processType: envVars.PROCESS_TYPE
}

const envConfig = joi.attempt(config, schema);

module.exports = envConfig;
