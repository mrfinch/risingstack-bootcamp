const { expect } = require('chai');
const request = require('super-request');
const server = require('../../server');
const url = '/api/v1/repository/:owner/:name';
const Repository = require('../../../models/repository');
const sinon = require('sinon');

describe(`GET ${url}`, () => {
	let sandbox;
	beforeEach(() => {
		sandbox = sinon.sandbox.create();
	})

	afterEach(() => {
		sandbox.restore();
	})

	it('should return 200 when repository exists', async () => {
		const owner = 'RisingStack';
		const name = 'foo';
		const fullName = `${owner}/${name}`;
		const result = {
			id: Math.floor(Math.random() * 1000),
			full_name: fullName
		};
		sandbox.stub(Repository, 'read').resolves(result);

		const { body } = await request(server.listen())
			.get(url.replace(':owner', owner).replace(':name', name))
			.expect(200)
			.json(true)
			.end();

		expect(body).to.eql(result);
		expect(Repository.read).to.have.been.calledWith({ full_name: fullName });
	})

	it('should return 404 when no repository exists', async () => {
		const owner = 'RisingStack';
		const name = 'foo';
		const fullName = `${owner}/${name}`;
		sandbox.stub(Repository, 'read').resolves(undefined);
		await request(server.listen())
			.get(url.replace(':owner', owner).replace(':name', name))
			.expect(404)
			.json(true)
			.end();

		expect(Repository.read).to.have.been.calledWith({ full_name: fullName });
	})
})
