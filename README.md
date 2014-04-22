cocotte-mixin-ws
============

## はじめに

koaフレームワークにメソッドをミックスインし、webscoketのミドルウェアを追加出来るようにします

```
$ npm install koa
```
koaはnode v0.11.9以上で動作します。`--harmony`フラグを追加して実行してください

```
node --harmony app.js
```

koaは通常は下記のように作成アプリケーションをします
 
```
var koa = require('koa');
var app = koa();
```

websocketのミドルウェアを使用出来るアプリケーションを設定する場合は、次のようにしてください。

```
var koa = require('koa');
var mixin = require('cocotte-mixin-ws');
var app = mixin(koa)();
```

# 記述例

## 全体:

```js:example.js

var koa = require('koa');
var mixin = require('cocotte-mixin-ws');
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

## connectionイベント

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

## その他のイベント

connection以外のイベントは、イベント変数を受け取ることができます

ただし変数は１つだけしか受け取れません。

複数の値を受け取るには、JSON形式で一つのオブジェクトにする必要があります

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

