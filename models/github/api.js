const request = require('request-promise-native');

const API_URL = 'https://api.github.com';

function searchRepositories(query) {
	const options = {
		url: `${API_URL}/search/repositories`,
		method: 'GET',
		qs: query,
		json: true
	};
	return request(options);
}

function getContributors(repository, query = {}) {
	const options = {
		url: `${API_URL}/repos/${repository}/stats/contributors`,
		method: 'GET',
		qs: query,
		json: true
	};
	return request(options);
}

module.exports = {
	searchRepositories,
	getContributors
}