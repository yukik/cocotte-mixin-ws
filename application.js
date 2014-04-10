'use strict';

/**
 * このモジュールは、koa frameworkにWebsocket用のミドルウェアを追加できるように
 * 拡張を行います。
 */

/**
 * Module dependencies.
 */
var debug = require('debug')('koa:application - ws');
var compose = require('koa-compose');
var assert = require('assert');
var co = require('co');
var socketIo = require('socket.io');

/**
 * コールバック関数、例外発生時
 */
var onerror = function(err){
	if (err) {
		console.error(err.stack);
	}
};


// Mix-in Object
var app = {};

/**
 * WebSocket用のミドルウェアの追加
 * Use the given wsMiddleware `fn`.
 *
 * @param {GeneratorFunction} fn
 * @return {Application} self
 * @api public
 */
app.ws = function (event, fn) {
	assert(typeof event === 'string', 'app.ws() requires string in first param');
	assert('GeneratorFunction' === fn.constructor.name, 'app.ws() requires a generator function in second param');
	debug('use %s', event);

	if (!this.wsMiddleware) {
		this.wsMiddleware = {};
	}

	if (!this.wsMiddleware[event]) {
		this.wsMiddleware[event] = [];
	}
	this.wsMiddleware[event].push(fn);
	return this;
};

/**
 * Websocketのポート監視を行う
 * @method wsListen
 * @param  {Server} server
 */
app.wsListen = function (server) {
	var middleware = this.wsMiddleware || {};
	var connectionMiddleware = null;
	var otherMiddlewares = [];

	// イベント毎にジェネレータを結合
	Object.keys(middleware).forEach(function(event) {
		if (event === 'connection') {
			connectionMiddleware = compose(middleware.connection);

		} else {
			otherMiddlewares.push([event, compose(middleware[event])]);

		}
	});

	if (!otherMiddlewares.length) {
		throw new Error('イベントがひとつも登録されていません');
	}

	// イベントリスナー登録
	var io = socketIo.listen(server);
	io.sockets.on('connection', function(socket) {

		var values = {};

		// connectionのイベント処理
		if (connectionMiddleware) {
			co(connectionMiddleware).call({socket: socket, values: values}, onerror);
		}

		// その他のイベント処理
		otherMiddlewares.forEach(function(x) {
			socket.on(x[0], function(param) {
				co(x[1]).call({socket: socket, param: param, values: values}, onerror);
			});
		});
	});

};

exports = module.exports = function wsExtend (target) {
	target.prototype.ws = app.ws;
	target.prototype.wsListen = app.wsListen;
	return target;
};
