const joi = require('joi');

const envVarsSchema = joi.object({
	TRIGGER_QUERY: joi.string().required()
}).required();

const envVars = joi.attempt(process.env, envVarsSchema);

const redis = require('../models/redis');

redis.publishObject(redis.CHANNELS.collect.trigger.v1, {
	query: envVars.TRIGGER_QUERY,
	date: new Date().toISOString()
}).then(() => {
	console.log('Trigger published successfully');
	process.exit(0);
}).catch((err) => {
	console.log('trigger failed', err);
	process.exit(1);
})

