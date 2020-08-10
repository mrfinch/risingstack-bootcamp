const joi = require('joi');

const schema = joi.object({
  port: joi.number().required().min(3001).max(65555),
}).required();

const envVars = process.env;
const config = {
  port: envVars.PORT,
}

const envConfig = joi.attempt(config, schema);

module.exports = envConfig;
