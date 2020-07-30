'use strict'

const Koa = require('koa')
const logger = require('winston')
const Router = require('koa-router');

const app = new Koa()
const router = new Router();

router.get('/hello', (ctx, next) => {
  ctx.body = 'Hello Node.js!';
});

app.on('error', (err) => {
  logger.error('Server error', { error: err.message })
})

app.use(router.routes()).use(router.allowedMethods());

module.exports = app
