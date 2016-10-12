'use strict'

var config = require('../config')
var Wechat = require('../wechat/wechat')
var wechatApi = new Wechat(config.wechat)
var menu = require('./menu');
var path = require('path')


exports.reply = function*(next){
    var message = this.weixin

    if(message.MsgType === "event"){
        if(message.Event === "subscribe"){
            if(message.EventKey){
                console.log('扫描进来：' + message.EventKey + ' ' + message.Ticket)
            }
            this.body = "你订阅了卟离卟离\r\n" + message.MsgId
        }else if(message.Event === "unsubscribe"){
            console.log('无情取关')
            this.body = ''
        }else if(message.Event === "LOCATION"){
            this.body = "您上报的位置是：" + message.Latitude + message.Longitude 
            + message.Precision;
        }else if(message.Event === "CLICK"){
            this.body = "您点击了菜单" + message.EventKey

        }else if(message.Event === "SCAN"){
            console.log('关注后扫描了二维码：' + message.EventKey + message.Ticket)

        }else if(message.Event === "VIEW"){
            this.body = "您点击了菜单的链接" + message.EventKey
            
        }
    }
    else if(message.MsgType === "text"){
        var content = message.Content
        var reply = "您说的啥？" + message.Content

        if(message.Content === '1'){
            reply = '第一个啊'
        }
        else if(message.Content === '2'){
            reply = "二龙戏珠"
        }
        else if(message.Content === "3"){
            reply = '三言两语'
        }else if(message.Content === "4"){
            reply = [
                {
                    title: '秒速五厘米',
                    description: '如果，樱花掉落的速度是每秒5厘米，那么两颗心需要多久才能靠近？ ',
                    picurl: 'https://img3.doubanio.com/view/movie_poster_cover/spst/public/p982896012.jpg',
                    url: 'https://movie.douban.com/subject/2043546/'
                },
                 {
                    title: '你的名字',
                    description: '千年后再度回归的彗星造访地球的一个月前，日本深山的某个乡下小镇。女高中生三叶每天都过着忧郁的生活，而她烦恼的不光有担任镇长的父亲所举行的选举运动，还有家传神社的古老习俗。三叶身居这小镇之中，又处于过多在意周围人目光的年龄，因此对大都市的憧憬日益强烈。  ',
                    picurl: 'https://img3.doubanio.com/view/movie_poster_cover/spst/public/p2293569246.jpg',
                    url: 'https://movie.douban.com/subject/26683290/'
                }
            ]
        }else if(content === "5"){
            var data = yield wechatApi.uploadMaterial('image', path.join(__dirname + '../m.jpg'))
            reply = {
                type: 'image',
                mediaId: data.media_id
            }
        }else if(content === "6"){
            var data = yield wechatApi.uploadMaterial('video', path.join(__dirname + '../m.mp4'));
            reply = {
                type: 'video',
                mediaId: data.media_id,
                title: '冰菓',
                description: '冰菓 OP'
            }
            
        }else if(content === "7"){
            reply = {
                type: 'video',
                mediaId: 'ifA_p6beyK178P1Ur3kB-RT8XO-_bGCadEnnpZWYnE56rTn6i7KqSVfZZ8syO7tC',
                title: '冰菓',
                description: '冰菓 OP'
            }
            
        }else if(content === "8"){
            var data = yield wechatApi.uploadMaterial('image', path.join(__dirname + '../m.jpg'), {type: 'image'})
            reply = {
                type: 'image',
                mediaId: data.media_id
            }
        }else if(content === "9"){
            var data = yield wechatApi.uploadMaterial('video', path.join(__dirname + '../m.mp4'), {type: 'video', description: '{"title":"冰菓", "introduction":"冰菓"}'})
            console.log(data);
            reply = {
                type: 'video',
                mediaId: '0zjyDlqB1u3AHhv4Sl1A4pk-mZhqgbQ1zAvB-vvi1ng',
                title: '冰菓',
                description: '冰菓 OP'
            }
        }else if(content === "10"){
            var data = yield wechatApi.getCount()
            console.log(data)
            reply = {
                type: 'text',
                content: 'voice_count:' + data.voice_count + "\r\n" 
                          + 'video_count:' + data.video_count + "\r\n" 
                          + 'image_count:' + data.image_count + "\r\n"
                          + 'news_count:' + data.news_count + "\r\n"
            }
        }else if(content === "11"){
            var data = yield wechatApi.fetchUserInfo(message.FromUserName)
            console.log(data)
            reply = {
                type: 'text',
                content: '用户名：' + data.nickname + "\r\n"    
                         + '性别' + data.sex + "\r\n"                
                         + '城市' + data.city + "\r\n"                
                         + '国家' + data.country + "\r\n"                
                         + '省份' + data.province	 + "\r\n"                
                         + '用户名：' + data.nickname + "\r\n"   
                         + "<img src=" + data.headimgurl + ">"         
            }
        }else if(content === "12"){
            var data = yield wechatApi.fetchUserInfo(
                [{
                    "openid": message.FromUserName, 
                    "lang": "zh-CN"
                }]
            )
            console.log(data)
            reply = {
                type: 'text',
                content: data 
            }
        }else if(content === "13"){
            wechatApi.createMenu(menu)
                .then(function(msg){
                    reply = {
                        type: 'text',
                        content: msg 
                    }
                })
        }else if(content === "14"){
            wechatApi.fetchMenu()
                .then(function(msg){
                    reply = {
                        type: 'text',
                        content: msg 
                    }
                })
        }else if(content === "15"){
            wechatApi.removeMenu(menu)
                .then(function(msg){
                    reply = {
                        type: 'text',
                        content: msg 
                    }
                })
        }
        this.body = reply;
    }
    yield next
}