var Koa = require('koa');
var wechat = require('./wechat/g');
var config = require('./config') 
var util = require('./libs/util')
var replay = require('./wx/reply')
var heredoc = require('heredoc')
var Wechat = require('./wechat/wechat')
var crypto = require('crypto')
var ejs = require('ejs')

var app = new Koa();

var tpl = heredoc(function(){/*
    <!DOCTYPE html>
    <html>
        <head>
            <title></title>
            <meta name="viewport" content="width=device-width,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no">
        </head>
        <body>
            <input type="button" value="点击录音"> 
        </body>
        <script src="//cdn.bootcss.com/zepto/1.2.0/zepto.min.js"></script>
        <script src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>
        <script>
            wx.config({
                debug: false, 
                appId: '<%= appId%>', 
                timestamp: <%= timestamp%>, 
                nonceStr: '<%= nonceStr%>', 
                signature: '<%= signature%>',
                jsApiList: [
                    'getNetworkType',
                    'openLocation',
                    'getLocation',
                    'hideOptionMenu',
                    'showOptionMenu',
                    'startRecord',
                    'stopRecord',
                    'onVoiceRecordEnd',
                    'playVoice',
                    'pauseVoice',
                    'stopVoice',
                    'onVoicePlayEnd',
                    'translateVoice',
                    'scanQRCode'
                ]
            });
            wx.ready(function(){
                var record = false;
                $("input").click(function(){
                    alert("clicked")
                    wx.scanQRCode({
                        needResult: 1,
                        desc: 'scanQRCode desc',
                        success: function (res) {
                            alert(JSON.stringify(res));
                        }
                    });
                })
            });
        </script>
    </html>
*/})

var createNonce = function(){
    return Math.random().toString(36).substr(2, 15)
}

var createTimestamp = function(){
    return parseInt(new Date().getTime() / 1000 , 10) + ''
}

function sign(ticket, url){
    var nonceStr = createNonce()
    var timestamp = createTimestamp()
    var signature = _sign(nonceStr, ticket, timestamp, url)
    
    console.log(nonceStr, timestamp, signature)
    return {
        nonceStr: nonceStr,
        timestamp: timestamp,
        signature: signature
    }
}
function _sign(nonceStr, ticket, timestamp, url){
    console.log(arguments)
    
    var params = [
        'noncestr=' + nonceStr,
        'jsapi_ticket=' + ticket,
        'timestamp=' + timestamp,
        'url=' + url
    ]
    var str = params.sort().join('&');
    console.log(str)
    
    var shasum = crypto.createHash('sha1')
    
    shasum.update(str)

    return shasum.digest('hex')
}
app.use(function*(next){
    if(this.url.indexOf('/movie') >= 0){
        var wechatApi = new Wechat(config.wechat)
        var data = yield wechatApi.fetchAccessToken()
        var access_token = data.access_token
        var ticketData = yield wechatApi.fetchTicket(access_token)
        var ticket = ticketData.ticket
        var wehcatWeb = sign(ticket, this.href)
        this.body = ejs.render(tpl, {
            appId: config.wechat.appID, 
            timestamp: wehcatWeb.timestamp,
            nonceStr: wehcatWeb.nonceStr, 
            signature: wehcatWeb.signature
        });
        return next
    }
    
    yield next;
})

app.use(wechat(config.wechat, replay.reply))

app.listen(3100);

console.log('Listening: 3100')