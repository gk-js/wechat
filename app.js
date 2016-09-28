var Koa = require('koa');
var wechat = require('./wechat/g');
var config = require('./config') 
var util = require('./libs/util')
var replay = require('./wx/replay')
// var onerror = require('koa-onerror')


var app = new Koa();
// onerror(app);
app.use(wechat(config.wechat, replay.reply))

app.listen(3100);

console.log('Listening: 3100')