const db = require('../db');
const joi = require('joi');
const tableName = 'user';

const insertSchema = joi.object({
	id: joi.number().integer().required(),
	login: joi.string().required(),
	avatar_url: joi.string().required(),
	html_url: joi.string().required(),
	type: joi.string().required()
}).required();

async function insert(params) {
	const validatedData = joi.attempt(params, insertSchema);

	return db.insert(validatedData)
		.into(tableName)
		.returning('*');
}

const readSchema = joi.object({
	id: joi.number().integer(),
	login: joi.string()
}).xor('id', 'login').required();

async function read(params) {
	const validatedData = joi.attempt(params, readSchema);

	return db(tableName)
		.where(validatedData)
		.select()
		.first();
}

module.exports = {
	insert,
	read,
	tableName
};
