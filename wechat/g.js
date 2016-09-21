var sha1 = require('sha1');
var getRawBody = require('raw-body')
var Wechat = require('./wechat')
var util = require('./util')

module.exports = function(config, handler){
    var wechat = new Wechat(config);
    return function *(next){
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
            var content = yield util.parseXMLAsync(data); //xml转json
            var message = util.formatMessage(content.xml); //格式化json
            
            this.weixin = message
            yield handler.call(this, next)

            wechat.reply.call(this)
        }
        
    }
}
