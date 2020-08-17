const sinon = require('sinon');
const request = require('super-request');
const server = require('../../server');
const { expect } = require('chai');
const redis = require('../../../models/redis');
const { CHANNELS } = redis;
const url = '/api/v1/trigger';

describe(`url ${url}`, async () => {

	let now, sandbox;
	beforeEach(() => {
		sandbox = sinon.sandbox.create();
		now = Date.now();
		sandbox.useFakeTimers(now);
	})

	afterEach(() => {
		sandbox.restore()
	})

	it('should validate the body', async () => {
		const { body } = await request(server.listen())
			.post(url)
			.expect(400)
			.json(true)
			.end()

		expect(body).to.include('"query" is required');
	})

	it('should return 201 and send to trigger queue', async () => {
		sandbox.stub(redis, 'publishObject').resolves();

		const query = 'language:javascript';
		await request(server.listen())
			.post(url)
			.body({ query })
			.expect(201)
			.json(true)
			.end();

		expect(redis.publishObject).to.have.been.calledWith(
			CHANNELS.collect.trigger.v1,
			{
				query,
				date: new Date(now).toISOString()
			}
		);
	})
});
