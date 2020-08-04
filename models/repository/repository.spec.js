const { expect } = require('chai');
const Repository = require('./repository');
const User = require('../user');
const db = require('../db');

describe('Repository', () => {

	let id, repositoryToInsert, userToInsert, userId;

	beforeEach(async () => {
		id = parseInt(Math.random() * 1000);
		userId = parseInt(Math.random() * 1000);
		repositoryToInsert = {
			id,
			owner: userId,
			full_name: '@risingstack/foo',
			description: 'Very foo package, using bar technologies',
			html_url: 'https://github.com/risingstack/foo',
			language: 'Baz',
			stargazers_count: parseInt(Math.random() * 10)
		}

		userToInsert = {
			id: userId,
			login: 'developer',
			avatar_url: 'https://developer.com/avatar.png',
			html_url: 'https://github.com/developer',
			type: 'User'
		}

		await db(User.tableName).insert(userToInsert);
	});

	afterEach(async () => {
		await db(User.tableName).where({ id: userId }).delete();
		await db(Repository.tableName).where({ id }).delete();
	});

	describe('insert', () => {
		it('should insert valid data', async () => {
			const result = await Repository.insert(repositoryToInsert);

			expect(result).to.not.equal(null);
			expect(result[0]).to.eql(repositoryToInsert);
		})

		it('should throw error for invalid data', async () => {
			delete repositoryToInsert.full_name;
			let error;
			try {
				error = await Repository.insert(repositoryToInsert);
			} catch (err) {
				error = err;
			}
			expect(error).to.not.equal(null);
			expect(error.message).to.include('full_name');
		})
	})

	describe('read', () => {
		it('should return data for correct id', async () => {
			await Repository.insert(repositoryToInsert);

			const result = await Repository.read({ id });
			expect(result).to.not.eql(null);
			expect(result.id).to.eql(id);
		})
	})
});
