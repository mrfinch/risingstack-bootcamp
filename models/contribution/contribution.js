const db = require('../db');
const tableName = 'contribution';
const joi = require('joi');
const User = require('../user');
const Repository = require('../repository');

const insertSchema = joi.object({
	user: joi.number().integer().required(),
	repository: joi.number().integer().required(),
	line_count: joi.number().integer().required()
}).required();

async function insert(params) {
	const validatedData = joi.attempt(params, insertSchema);

	return db.insert(validatedData)
		.into(tableName)
		.returning('*');
}

function insertOrReplace(params) {
	const contribution = joi.attempt(params, insertSchema)

	const query = `
    INSERT INTO :tableName: ("user", repository, line_count)
      VALUES (:user, :repository, :line_count)
      ON CONFLICT ("user", repository) DO UPDATE SET line_count = :line_count
      RETURNING *;
  `

	return db.raw(query, Object.assign({ tableName }, contribution));
}

const readSchema = joi.object({
	user: joi.object({
		id: joi.number().integer(),
		login: joi.string()
	}).xor('id', 'login'),
	repository: joi.object({
		id: joi.number().integer(),
		full_name: joi.string()
	}).xor('id', 'full_name')
}).or('user', 'repository').required()

async function read(params) {
	const { repository = {}, user = {} } = joi.attempt(params, readSchema);

	const queryParams = {
		[`${User.tableName}.id`]: user.id,
		[`${User.tableName}.login`]: user.login,
		[`${Repository.tableName}.id`]: repository.id,
		[`${Repository.tableName}.full_name`]: repository.full_name
	}

	const query = Object.keys(queryParams).reduce((result, key) => {
		if (queryParams[key]) {
			result[key] = queryParams[key];
		}
		return result;
	}, {});

	return db(tableName)
		.join(User.tableName, `${User.tableName}.id`, '=', `${tableName}.user`)
		.join(Repository.tableName, `${Repository.tableName}.id`, '=', `${tableName}.repository`)
		.where(query)
		.select(`${tableName}.*`);
}

module.exports = {
	insert,
	insertOrReplace,
	read
}