var sha1 = require('sha1');
var getRawBody = require('raw-body')
var Wechat = require('./wechat')
var util = require('./util')

module.exports = function(config){
    var wechat = new Wechat(config);
    return function *(next){
        console.log(this.query);
        var token = config.token;
        var signature = this.query.signature;
        var timestamp = this.query.timestamp;
        var nonce = this.query.nonce;
        var echostr = this.query.echostr;
        var str = [token, timestamp, nonce].sort().join('');
        var sha = sha1(str);

        if(this.method === "GET"){
            if(sha === signature){
                console.log(echostr, typeof echostr + '');
                this.body = echostr + '';
            }else{
                this.body = 'wrong';
            }
        }else if(this.method === "POST"){
            if(sha !== signature){
                this.body = 'wrong';
                return false;
            }

            var data = yield getRawBody(this.req, {
                length: this.length,
                limit: 'lmb',
                encoding: this.charset
            })
            console.log(data.toString());
            var content = yield util.parseXMLAsync(data);
            console.log(content);
            var message = util.formatMessage(content.xml);
            if(message.MsgType === 'event'){
                if(message.Event === 'subscribe'){
                    var now = new Date().getTime()
                    var replay = "hello 欢迎关注！"
                    this.body = '<xml>\
                                    <ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>\
                                    <FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>\
                                    <CreateTime>'+ now +'</CreateTime>\
                                    <MsgType><![CDATA[text]]></MsgType>\
                                    <Content><![CDATA['+ replay +']]></Content>\
                                </xml>';
                }
            }
            if(message.MsgType === 'text'){
                var now = new Date().getTime()
                var replay = "您回复的是文字！"
                this.body = '<xml>\
                                <ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>\
                                <FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>\
                                <CreateTime>'+ now +'</CreateTime>\
                                <MsgType><![CDATA[text]]></MsgType>\
                                <Content><![CDATA['+ replay +']]></Content>\
                            </xml>';
            }
            if(message.MsgType === 'image'){
                var now = new Date().getTime()
                var replay = "您回复的是图片！"
                this.body = '<xml>\
                                <ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>\
                                <FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>\
                                <CreateTime>'+ now +'</CreateTime>\
                                <MsgType><![CDATA[text]]></MsgType>\
                                <Content><![CDATA['+ replay +']]></Content>\
                            </xml>';
            }
            if(message.MsgType === 'voice'){
                var now = new Date().getTime()
                var replay = "您回复的是语音！"
                this.body = '<xml>\
                                <ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>\
                                <FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>\
                                <CreateTime>'+ now +'</CreateTime>\
                                <MsgType><![CDATA[text]]></MsgType>\
                                <Content><![CDATA['+ replay +']]></Content>\
                            </xml>';
            }
            if(message.MsgType === 'video'){
                var now = new Date().getTime()
                var replay = "您回复的是视频！"
                this.body = '<xml>\
                                <ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>\
                                <FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>\
                                <CreateTime>'+ now +'</CreateTime>\
                                <MsgType><![CDATA[text]]></MsgType>\
                                <Content><![CDATA['+ replay +']]></Content>\
                            </xml>';
            }
        }
        
    }
}
