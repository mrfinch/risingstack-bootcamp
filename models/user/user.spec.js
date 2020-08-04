const { expect } = require('chai');
const User = require('./user');
const db = require('../db');

describe('User', () => {
	let id, params;

	beforeEach(() => {
		id = Math.floor(Math.random() * 1000) + 1;

		params = {
			id: id,
			login: 'developer',
			avatar_url: 'https://developer.com/avatar.png',
			html_url: 'https://github.com/developer',
			type: 'User'
		}
	})

	afterEach(async () => {
		await db(User.tableName)
			.where({ id })
			.delete();
	})

	describe('insert', () => {
		it('should insert valid data', async () => {
			const result = await User.insert(params);
			expect(result).to.not.equal(null);
			expect(result[0]).to.eql(params);
		})

		it('should fail when invalid params', async () => {
			delete params.login
			let error;
			try {
				error = await User.insert(params);
			} catch(err) {
				error = err;
			}
			expect(error).to.not.equal(null);
			expect(error.message).to.include('login');
		})
	})

	describe('read', () => {
		it('should return existing object on basis of id', async () => {
			await User.insert(params);

			const result = await User.read({ id });
			expect(result).to.not.equal(null);
			expect(result.id).to.eql(id);
		})

		it('should return existing object on basis of login', async () => {
			await User.insert(params);

			const result = await User.read({ login: params.login });
			expect(result).to.not.equal(null);
			expect(result.id).to.eql(id);
		})

		it('should return undefined when object doesnt exist', async () => {
			const result = await User.read({ id });
			expect(result).to.eql(undefined);
		})
	});
});
