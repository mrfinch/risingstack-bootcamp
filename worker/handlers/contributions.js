const logger = require('winston');
const joi = require('joi');
const Github = require('../../models/github');
const User = require('../../models/user');
const Contribution = require('../../models/contribution');

const schema = joi.object({
	date: joi.date().raw().required(),
	repository: joi.object({
		id: joi.number().integer().required(),
		full_name: joi.string().required()
	}).required()
}).required();

async function onContributions(message) {
	logger.info('onContributions start');

	let data;
	try {
		data = joi.attempt(message, schema);
	} catch(err) {
		console.log('onContributions validation failed', err);
		return;
	}
	const { repository } = data;

	let contributors = await Github.api.getContributors(repository.full_name);
	contributors = contributors.map(({ author, weeks }) => {
		const user = getUser(author);
		const line_count = weeks.reduce((lines, { a: additions, d: deletions }) => {
			return lines + additions - deletions;
		}, 0)
		return { user, line_count };
	})

	await Promise.all(contributors.map(({ user, line_count }) => {
		return new Promise(async (resolve, reject) => {
			try {
				let userInfo = await User.read(user);
				if (!userInfo) {
					userInfo = await User.insert(user);
				}
				await Contribution.insertOrReplace({
					user: userInfo.id,
					repository: repository.id,
					line_count: line_count
				});
				return resolve(true);
			} catch (err) {
				return reject(err);
			}
		})
	}))
}

function getUser(author) {
	// const { id, login, avatar_url, html_url, type } = author;
	return [ 'id', 'login', 'avatar_url', 'html_url', 'type' ].reduce((acc, curr) => {
		if (author[curr]) {
			acc[curr] = author[curr];
		}
		return acc;
	}, {});
}

module.exports = onContributions;
