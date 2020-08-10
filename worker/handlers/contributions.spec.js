const redis = require('../../models/redis');
const { CHANNELS } = redis;
const worker = require('../worker');
const sinon = require('sinon');
const handlers = require('../handlers');
const { expect } = require('chai');
const User = require('../../models/user');
const Contribution = require('../../models/contribution');
const Github = require('../../models/github');

describe('Worker contributions channel', () => {

	let sandbox;
	beforeEach(function beforeEach() {
		sandbox = sinon.sandbox.create()
	})

	afterEach(function afterEach() {
		sandbox.restore()
	})

	it(`should handle message ${CHANNELS.collect.contributions.v1} channel`, async () => {
		const date = new Date().toISOString();
		const repository = {
			id: Math.floor(Math.random() * 100),
			full_name: 'project/name'
		}
		const params = {
			date, repository
		};

		await worker.init();
		const stub = sandbox.stub(handlers, 'contributions').resolves();
		await redis.publishObject(
			redis.CHANNELS.collect.contributions.v1,
			params
		);
		console.log('contrib handler', stub.getCall(0).args);
		expect(stub.getCall(0).args[0]).to.eql(
			params
		);
		await worker.halt();
	})

	it('should fetch contributions from github and save to database', async () => {
		const date = new Date().toISOString();
		const repository = {
			id: Math.floor(Math.random() * 100),
			full_name: 'project/name'
		}
		const params = {
			date, repository
		};
		const author = {
			id: Math.floor(Math.random() * 1000),
			login: 'user'
		}

		sandbox.stub(Github.api, 'getContributors').resolves([{
			author,
			weeks: [{
				a: 100,
				d: 10
			}, {
				a: 30,
				d: 50
			}]
		}])
		sandbox.stub(User, 'read').resolves();
		sandbox.stub(User, 'insert').resolves(author);
		sandbox.stub(Contribution, 'insertOrReplace').resolves();
		await handlers.contributions(params);

		expect(Github.api.getContributors).to.have.been.calledWith(repository.full_name);
		expect(User.read).to.have.been.calledWith(author);
		expect(User.insert).to.have.been.calledWith(author);
		expect(Contribution.insertOrReplace).to.have.been.calledWith({
			user: author.id,
			repository: repository.id,
			line_count: 70
		})
	})
})