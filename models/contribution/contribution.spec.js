const { expect } = require('chai');
const Contribution = require('./contribution');
const User = require('../user');
const Repository = require('../repository');
const db = require('../db');

describe('Contribution', () => {

	let userId, repositoryId, userToInsert, repositoryToInsert, contributionToInsert;

	beforeEach(async () => {
		userId = Math.floor(Math.random() * 1000);
		repositoryId = Math.floor(Math.random() * 1000);

		userToInsert = {
			id: userId,
			login: 'developer',
			avatar_url: 'https://developer.com/avatar.png',
			html_url: 'https://github.com/developer',
			type: 'User'
		}

		repositoryToInsert = {
			id: repositoryId,
			owner: userId,
			full_name: '@risingstack/foo',
			description: 'Very foo package, using bar technologies',
			html_url: 'https://github.com/risingstack/foo',
			language: 'Baz',
			stargazers_count: Math.floor(Math.random() * 10)
		}

		contributionToInsert = {
			user: userId,
			repository: repositoryId,
			line_count: Math.floor(Math.random() * 1000)
		}

		await db(User.tableName).insert(userToInsert);
		await db(Repository.tableName).insert(repositoryToInsert);
	})

	afterEach(async () => {
		await db(User.tableName).where({ id: userId }).delete();
		await db(Repository.tableName).where({ id: repositoryId }).delete();
	})

	describe('insert', () => {
		it('should insert with valid params', async () => {
			const result = await Contribution.insert(contributionToInsert);

			expect(result).to.not.equal(null);
			expect(result[0]).to.eql(contributionToInsert);
		})

		it('should fail with invalid params', async () => {
			delete contributionToInsert.user;

			let error;
			try {
				await Contribution.insert(contributionToInsert);
			} catch (err) {
				error = err;
			}
			expect(error).to.not.equal(null);
			expect(error.message).to.include('user');
		})
	})

	describe('read', () => {
		it('should return contribution on basis of user', async () => {
			await Contribution.insert(contributionToInsert);

			const result = await Contribution.read({ user: { id: userId }});

			expect(result).to.not.equal(null);
			expect(result[0]).to.eql(contributionToInsert);

			const result2 = await Contribution.read({ user: { login: userToInsert.login }});
			expect(result2).to.not.eql(null);
			expect(result2[0]).to.eql(contributionToInsert);
		})

		it('should return contribution based on repository', async () => {
			await Contribution.insert(contributionToInsert);

			const result = await Contribution.read({ repository: { id: repositoryId } });
			expect(result[0]).to.eql(contributionToInsert);

			const result2 = await Contribution.read({ repository: { full_name: repositoryToInsert.full_name }});
			expect(result2[0]).to.eql(contributionToInsert);
		})
	})

});
