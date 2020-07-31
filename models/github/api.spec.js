const request = require('super-request');
const { expect } = require('chai');
const api = require('./api');
const nock = require('nock');
const API_URL = 'https://api.github.com';

describe('Github API', () => {

	describe('searchRepositories',() => {
		it('should search repo successfully', async () => {
			const scope = nock(API_URL)
				.get('/search/repositories')
				.query({ q: 'language:js' })
				.reply(200, { items: [] })

			const result = await api.searchRepositories({ q: 'language:js' });
			expect(scope.isDone()).to.eql(true);
			expect(result).to.eql({ items: [] })
		})
	})

	describe('getContributors', () => {
		it('should get contributors for repo', async () => {
			const repository = 'test';
			const scope = nock(API_URL)
				.get(`/repos/${repository}/stats/contributors`)
				.query({})
				.reply(200, [{ author: {}, weeks: [] }]);

			const result = await api.getContributors(repository);
			expect(scope.isDone()).to.eql(true);
			expect(result).to.eql([{ author: {}, weeks: [] }]);
		})

	})
});
