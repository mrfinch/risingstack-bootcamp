const { CHANNELS } = require('../../models/redis');
const worker = require('../worker');
const handlers = require('./');
const { expect } = require('chai');
const redis = require('../../models/redis');
const sinon = require('sinon');

describe('Worker Trigger channel', () => {
	let sandbox;
	beforeEach(function beforeEach() {
		sandbox = sinon.sandbox.create()
	})

	afterEach(function afterEach() {
		sandbox.restore()
	})

	it(`should handle messages on ${CHANNELS.collect.trigger.v1} channel`, async () => {
		const date = new Date().toISOString();
		const query = 'language:javascript';

		await worker.init();
		const stub = sandbox.stub(handlers, 'trigger').resolves(null);
		const params = {
			date,
			query
		};
		await redis.publishObject(redis.CHANNELS.collect.trigger.v1, params);
		// expect(stub.calledOnce).to.equal(true);
		expect(stub.getCall(0).args[0]).to.eql(params);
		await worker.halt();
	})

	it(`should send messages to ${CHANNELS.collect.repository.v1} channel`, async () => {
		const date = new Date().toISOString();
		const query = 'language:javascript';
		const params = {
			date,
			query
		};
		sandbox.stub(redis, 'publishObject').resolves();

		await handlers.trigger(params);
		expect(redis.publishObject).to.have.callCount(10);
		[...Array(10).keys()].map((page) => {
			expect(redis.publishObject.args[page][1]).to.eql({
				page, ...params
			})
		})
	})
})
