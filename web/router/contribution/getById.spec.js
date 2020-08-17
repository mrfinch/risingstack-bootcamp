const request = require('super-request');
const { expect } = require('chai');
const Contribution = require('../../../models/contribution');
const server = require('../../server');
const sinon = require('sinon');

const url = '/api/v1/repository/:id/contributions';

describe(`GET ${url}`, async () => {
	let sandbox;
	beforeEach(function beforeEach() {
		sandbox = sinon.sandbox.create()
	})

	afterEach(function afterEach() {
		sandbox.restore()
	})

	it('should return 200 when repository exists with contribution', async () => {
		const dummy = {
			id: Math.floor(Math.random() * 1000),
			line_count: Math.floor(Math.random() * 1000)
		}
		sandbox.stub(Contribution, 'read').resolves([dummy]);

		const { body } = await request(server.listen())
			.get(url.replace(':id', dummy.id))
			.expect(200)
			.json(true)
			.end();

		expect(body).to.be.eql([dummy]);
		expect(Contribution.read).to.have.been.calledWith({ repository: { id: dummy.id } })
	})

	it('should return 404 when no repository exists with contribution', async () => {
		const id = Math.floor(Math.random() * 1000);
		sandbox.stub(Contribution, 'read').resolves([]);

		await request(server.listen())
			.get(url.replace(':id', id))
			.expect(404)
			.json(true)
			.end();

		expect(Contribution.read).to.have.been.calledWith({ repository: { id }});
	})
})
