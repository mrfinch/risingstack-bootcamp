const redis = require('../../models/redis');
const { CHANNELS } = redis;
const worker = require('../worker');
const repository = require('./repository');
const handlers = require('./index');
const { expect } = require('chai');
const sinon = require('sinon');
const Github = require('../../models/github');
const User = require('../../models/user');
const Repository = require('../../models/repository');

describe('Worker Repository channel', () => {

	let sandbox;
	beforeEach(function beforeEach() {
		sandbox = sinon.sandbox.create()
	})

	afterEach(function afterEach() {
		sandbox.restore()
	})

	it(`should handle messages on ${CHANNELS.collect.repository.v1} channel`, async () => {
		const date = new Date().toISOString();
		const query = 'language:javascript';
		const page = Math.floor(Math.random() * 10);

		await worker.init();
		const stub = sandbox.stub(handlers, 'repository').resolves();
		const params = {
			date,
			query,
			page
		};
		await redis.publishObject(
			CHANNELS.collect.repository.v1,
			params
		);
		// expect(stub.calledOnce).to.equal(true);
		expect(stub.getCall(0).args[0]).to.eql(params);
		await worker.halt();
	})

	it(`should fetch repo from github and send to ${CHANNELS.collect.contributions.v1} channel`, async () => {
		const owner = {
			id: Math.floor(Math.random() * 1000),
			login: 'project-owner',
			avatar_url: 'https://github.com/project-owner.png',
			html_url: 'https://github.com/project-owner.png',
			type: 'User'
		}

		const repository = {
			id: Math.floor(Math.random() * 1000),
			full_name: 'project/name',
			description: 'Very project',
			html_url: 'https://github.com/project/name',
			language: 'JavaScript',
			stargazers_count: Math.floor(Math.random() * 1000)
		}

		sandbox.stub(Github.api, 'searchRepositories').resolves({ items: [{ ...repository, owner }]});
		sandbox.stub(User, 'insert').resolves();
		sandbox.stub(Repository, 'insert').resolves();
		sandbox.stub(redis, 'publishObject').resolves(null);

		const date = new Date().toISOString()
		const query = 'language:javascript'
		const page = 0

		await handlers.repository({
			date,
			query,
			page
		})

		const repo = { owner: owner.id, ...repository };
		expect(Github.api.searchRepositories).to.have.been.calledWith({ q: query, per_page: 100, page });
		expect(User.insert).to.have.been.calledWith(owner);

		expect(Repository.insert.getCall(0).args[0]).to.eql(repo);
		expect(redis.publishObject.getCall(0).args[0]).to.eql(redis.CHANNELS.collect.contributions.v1, {
			date,
			repo
		});
	})
})
