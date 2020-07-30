'use strict'
const joi = require('joi');

const schema = joi.object({
  port: joi.number().required().min(3001).max(65555)
});

const envVars = process.env;
const config = {
  port: envVars.PORT
}

const { error, value } = schema.validate(config);
if (error) {
  throw new Error(error);
}


module.exports = config
