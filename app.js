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

        </head>
        <body>
            <h1>点击录音</h1>  
        </body>
        <script src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>
        <script>
            wx.config({
                debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: '<%= appId%>', // 必填，公众号的唯一标识
                timestamp: <%= timestamp%>, // 必填，生成签名的时间戳
                nonceStr: '<%= nonceStr%>', // 必填，生成签名的随机串
                signature: '<%= signature%>',// 必填，签名，见附录1
                jsApiList: [
                    'getNetworkType',
                    'openLocation',
                    'getLocation',
                    'hideOptionMenu',
                    'showOptionMenu'
                ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
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