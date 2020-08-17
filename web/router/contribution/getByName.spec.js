const sinon = require('sinon');
const { expect } = require('chai');
const Contribution = require('../../../models/contribution');
const request = require('super-request');
const server = require('../../server');
const url = '/api/v1/repository/:owner/:name/contributions';

describe(`GET ${url}`, async () => {
	let sandbox;
	beforeEach(function beforeEach() {
		sandbox = sinon.sandbox.create()
	})

	afterEach(function afterEach() {
		sandbox.restore()
	})

	it('should return 200 with contribution when repository exists', async () => {
		const owner = 'RisingStack';
		const name = 'foo';
		const fullName = `${owner}/${name}`;
		const lineCount = Math.floor(Math.random() * 1000);
		const dummy = { line_count: lineCount };
		sandbox.stub(Contribution, 'read').resolves([dummy]);

		const { body } = await request(server.listen())
			.get(url.replace(':owner', owner).replace(':name', name))
			.expect(200)
			.json(true)
			.end()

		expect(body).to.eql([dummy]);
		expect(Contribution.read).to.have.been.calledWith({ repository: { full_name: fullName }});
	})

	it('should return 404 when no repository exists with contribution', async () => {
		const owner = 'RisingStack';
		const name = 'foo';
		const fullName = `${owner}/${name}`;
		sandbox.stub(Contribution, 'read').resolves([]);

		await request(server.listen())
			.get(url.replace(':owner', owner).replace(':name', name))
			.expect(404)
			.json(true)
			.end()

		expect(Contribution.read).to.have.been.calledWith({ repository: { full_name: fullName } });
	})
})