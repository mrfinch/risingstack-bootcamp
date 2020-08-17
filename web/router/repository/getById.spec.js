const { expect } = require('chai');
const sinon = require('sinon');
const url = '/api/v1/repository/:id';
const Repository = require('../../../models/repository');
const server = require('../../server');
const request = require('super-request');

describe(`GET ${url}`, async () => {
	let sandbox;
	beforeEach(function beforeEach() {
		sandbox = sinon.sandbox.create()
	})

	afterEach(function afterEach() {
		sandbox.restore()
	})

	it(`should return 200 when repository exists`, async () => {
		const params = {
			id: Math.floor(Math.random() * 100)
		};
		sandbox.stub(Repository, 'read').resolves(params);

		const { body } = await request(server.listen())
			.get(url.replace(':id', params.id))
			.expect(200)
			.json(true)
			.end()

		expect(body).to.eql(params);
		expect(Repository.read).to.have.been.calledWith(params);
	})

	it('should return 404 when no repository exists', async () => {
		const params = {
			id: Math.floor(Math.random() * 1000)
		};
		sandbox.stub(Repository, 'read').resolves(undefined);

		await request(server.listen())
			.get(url.replace(':id', params.id))
			.expect(404)
			.json(true)
			.end();

		expect(Repository.read).to.have.been.calledWith(params);
	})
})
