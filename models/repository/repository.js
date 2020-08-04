const db = require('../db');
const tableName = 'repository';
const joi = require('joi');
const User = require('../user');

const insertSchema = joi.object({
	id: joi.number().integer().required(),
	owner: joi.number().integer().required(),
	full_name: joi.string().required(),
	description: joi.string().allow('').required(),
	html_url: joi.string().uri().required(),
	language: joi.string().allow('').required(),
	stargazers_count: joi.number().integer().required()
}).required();

async function insert(params) {
	const validatedData = joi.attempt(params, insertSchema);

	return db.insert(validatedData)
		.into(tableName)
		.returning('*');
}

const readSchema = joi.object({
	id: joi.number().integer(),
	full_name: joi.string()
}).xor('id', 'full_name').required();

async function read(params) {
	const validatedData = joi.attempt(params, readSchema);

	const repositoryParams = Object.keys(validatedData).reduce((result, key) => {
		if (key) {
			result[`${tableName}.${key}`] = params[key];
		}
		return result;
	}, {});

	return db(tableName)
		.join(User.tableName, `${User.tableName}.id`, '=', `${tableName}.owner`)
		.where(repositoryParams)
		.select(`${tableName}.*`)
		.first();
}

module.exports = {
	insert,
	read,
	tableName
};
