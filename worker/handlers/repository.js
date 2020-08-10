const logger = require('winston');
const joi = require('joi');
const Github = require('../../models/github');
const User = require('../../models/user');
const redis = require('../../models/redis');
const Repository = require('../../models/repository');

const schema = joi.object({
	page: joi.number().integer().required(),
	query: joi.string().required(),
	date: joi.string().required()
}).required();

async function onRepository(message) {
	logger.info('onRepository', message);

	let data;
	try {
		data = joi.attempt(message, schema);
	} catch (err) {
		logger.error('onRepository validation failed', { err: err });
		return;
	}

	const { page, query, date } = data;

	let { items } = await Github.api.searchRepositories({ q: query, per_page: 100, page });
	items = items.map((item) => {
		return {
			owner: getUser(item),
			repository: getRepository(item)
		};
	})
	await Promise.all(
		items.map(({ owner, repository }) => {
			return new Promise((resolve, reject) => {
				User.insert(owner)
					.catch((err) => {
						console.log('user insert failed', err);
					})
					.then(() => {
						Repository.insert(repository);
					})
					.catch((err) => {
						console.log('repository insert failed', err);
						return reject(err);
					})
					.then(() => {
						redis.publishObject(
							redis.CHANNELS.collect.contributions.v1,
							{
								date,
								repository
							}
						).then((val) => {
							return resolve(true);
						})
					})
					.catch((err) => {
						console.log('publish to contribution failed', err);
						return reject(err);
					})
			});
		})
	)
}

function getUser(item) {
	const { id, login, avatar_url, type, html_url } = item.owner;
	return { id, login, avatar_url, type, html_url };
}

function getRepository(item) {
	const { id, full_name, description, html_url, language, stargazers_count } = item;
	const owner = item.owner.id;
	return { id, owner, full_name, description, html_url, language, stargazers_count };
}

module.exports = onRepository;
