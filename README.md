app-mixin-ws
============

koaフレームワークにメソッドをミックスインし、webscoketのミドルウェアを追加出来るようにします

ミドルウェアのthisはsocketとparamを参照するオブジェクトです

## はじめに

```
$ npm install koa
```

  koaはnode v0.11.9以上で`--harmony`フラグを追加して実行してください

```
node --harmony app.js
```

通常は下記のように作成アプリケーションをするところを
 
```
var koa = require('koa');
var app = koa();
```

次のように作成してください

```
var koa = require('koa');
var mixin = require('app-mixin-ws');
var app = mixin(koa)();
```

## 記述例


全体:


```js:example.js

var koa = require('koa');
var mixin = require('app-mixin-ws');
var app = mixin(koa)();

// HTTPミドルウェアの追加
app.use(function*(next){
	yield next;
});

// HTTPリクエストの監視開始
var server = app.listen();

// websocketのミドルウェアの追加
app.ws('message', function*(next){
	yield next;
});

// websocketリクエストの監視開始
app.wsListen(server);

```

ミドルウェアのthisは３つのプロパティを持ちます。

socketは接続を開始した際に作成されるソケットオブジェクトです

valuesは接続している間に保持される変数です。

すべてのイベントで共通して使用されることに注意してください

paramはイベントの発生先から引き渡される変数です。

paramは発生するたびに再作成されます


ws(connectionイベント):

connectionイベントはイベント引数が存在しません

```javascript
app.ws('connection', function*(next) {
	// ソケット
	var socket = this.socket;
	// ソケット変数
	var values = this.values;
	yield next;
});

```

ws(その他のイベント)

その他のイベントは、イベント変数を受け取ることができます

ただし複数の値を受け取るには、JSON形式で一つの変数にする必要があります

```
app.ws('message', function*(next) {
	// ソケット
	var socket = this.socket;
	// ソケット変数
	var values = this.values;
	// イベント引数
	var message = this.param;

	values.x = (values.x || 0) + 1;

	yield next;
});
```

