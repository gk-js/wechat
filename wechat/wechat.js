var Promise = require('bluebird');
var request = Promise.promisify(require('request'))
var util = require('./util')
var fs = require('fs')
var _ = require('lodash')

var prefix = 'https://api.weixin.qq.com/cgi-bin/';
var api = {
    accessToken: prefix + 'token?grant_type=client_credential&',
    temporary: {
        upload: prefix + 'media/upload?'
    },
    permanent: {
        upload: prefix + 'material/add_material?',
        uploadNews: prefix + 'material/add_news?',
        uploadNewsPic: prefix + 'media/uploadimg?',
        fetch: prefix + 'material/get_material?',
        remove: prefix + 'material/del_material?',
        updateNews: prefix + 'material/update_news?',
        count: prefix + 'material/get_materialcount?',
        batch: prefix + 'material/batchget_material?'

    },
    user: {
        setNickName: prefix + 'user/info/updateremark?',
        fetch: prefix + 'user/info?',
        fetchBatch: prefix + 'user/info/batchget?'
    },
    menu: {
        add: prefix + 'menu/create?',
        fetch: prefix + 'menu/get?',
        delete: prefix + 'menu/delete?',
        get_current: prefix + 'get_current_selfmenu_info?'
    },
    ticket: {
        get: prefix + 'ticket/getticket?'
    }
}
function Wechat(opts){
    var that = this
    this.appID = opts.appID;
    this.appsecret = opts.appsecret
    this.getAccessToken = opts.getAccessToken
    this.saveAccessToken = opts.saveAccessToken
    this.getTicket = opts.getTicket
    this.saveTicket = opts.saveTicket
    this.fetchAccessToken()
}
Wechat.prototype.fetchAccessToken = function(data){
    var that = this
    if(this.access_token && this.expires_in){
        if(this.isValidAccessToken(this)){
            return Promise.resolve(data)
        }else{

        }
    }
    return this.getAccessToken()
        .then(function(data){
            try{
                data = JSON.parse(data)
            }
            catch(e){
                return that.updateAccessToken()
            }

            if(that.isValidAccessToken(data)){
                return Promise.resolve(data)
            }else{
                return that.updateAccessToken()
            }
        })
        .then(function(data){
            that.access_token = data.access_token
            that.expires_in = data.expires_in
            console.log(data);
            that.saveAccessToken(data)
            
            return Promise.resolve(data) 
        })
}
Wechat.prototype.isValidAccessToken = function(data){
    //todo 校验微信accesstoken
    if(!data || !data.access_token || !data.expires_in){
        return false
    }
    var access_token = data.access_token
    var expires_in = data.expires_in
    var now = new Date().getTime()

    if(now < expires_in){
        return true
    }else{
        return false
    }
}
Wechat.prototype.updateAccessToken = function(){
    //todo 更新accesstoken
    var appID = this.appID
    var appsecret = this.appsecret
    var url = api.accessToken + 'appid='+ appID +'&secret=' + appsecret;
    return new Promise(function(resolve, reject){
        request({url: url, json: true}).then(function(response){
            console.log(response.body)
            var data =  response.body;
            console.log(data.expires_in, data.access_token)
            var now = (new Date().getTime());
            var expires_in = now + (data.expires_in - 20) * 1000;

            data.expires_in = expires_in
            resolve(data)
        })
    })
}

Wechat.prototype.fetchTicket = function(access_token){
    var that = this
    if(this.ticket && this.expires_in){
        if(this.isValidTicket(this)){
            return Promise.resolve(data)
        }else{

        }
    }
    return this.getTicket()
        .then(function(data){
            try{
                data = JSON.parse(data)
            }
            catch(e){
                return that.updateTicket(access_token)
            }

            if(that.isValidTicket(data)){
                return Promise.resolve(data)
            }else{
                return that.updateTicket(access_token)
            }
        })
        .then(function(data){
            
            that.saveTicket(data)
            
            return Promise.resolve(data) 
        })
}

Wechat.prototype.isValidTicket = function(data){
    //todo 校验微信accesstoken
    if(!data || !data.ticket || !data.expires_in){
        return false
    }
    var ticket = data.ticket
    var expires_in = data.expires_in
    var now = new Date().getTime()

    if(ticket && now < expires_in){
        return true
    }else{
        return false
    }
}
Wechat.prototype.updateTicket = function(){
    //todo 更新accesstoken
    var appID = this.appID
    var appsecret = this.appsecret
    var url = api.ticket.get + "access_token=" + this.access_token + '&type=jsapi';
    return new Promise(function(resolve, reject){
        request({url: url, json: true}).then(function(response){
            console.log(response.body)
            var data =  response.body;
            console.log(data.expires_in, data.ticket)
            var now = (new Date().getTime());
            var expires_in = now + (data.expires_in - 20) * 1000;

            data.expires_in = expires_in
            resolve(data)
        })
    })
}

Wechat.prototype.reply = function(){
    //todo 回复内容
    var content = this.body; //
    var message = this.weixin // 

    var xml = util.tmpl(content, message)

    this.status = 200
    this.type = 'application/xml'
    this.body = xml;
}
Wechat.prototype.uploadMaterial = function(type, filepath, permanent){
    var that = this;
    var form = {}
    var uploadUrl = api.temporary.upload

    if(permanent){
        uploadUrl = api.permanent.upload

        _.extend(form, permanent)
    }

    if(type === "pic"){
        uploadUrl = api.permanent.uploadNewsPic
    }
    if(type === "news"){
        uploadUrl = api.permanent.uploadNews
        form = material
    }
    else{
        form.media = fs.createReadStream(filepath)
    }

    //todo 上传文件
    var appID = this.appID;
    var appsecret = this.appsecret
    return new Promise(function(resolve, reject){
        that.fetchAccessToken()
            .then(function(data){
                var url = uploadUrl + 'access_token='+ that.access_token +'&type=' + type;
                
                if(!permanent){
                    url += '&type=' + type
                }else{
                    form.access_token = that.access_token
                }

                var options = {
                    method: 'POST',
                    url: url,
                    json: true
                }

                if(type === 'news'){
                    options.body = form
                }
                else{
                    options.formData = form
                }
                request(options)
                .then(function(response){
                    console.log(_data)
                    var _data = response.body
                    console.log(_data)
                    if(_data){
                        resolve(_data);
                    }else{
                        throw new Error('Upload material fails')
                    }
                })
                .catch(function(err){
                    reject(err);
                })

            })
    })
}
Wechat.prototype.fetchMaterial = function(mediaId, type, permanent){
    var that = this;
    var fetchUrl = api.temporary.upload

    if(permanent){
        fetchUrl = api.permanent.upload
    }

    //todo 上传文件
    var appID = this.appID;
    var appsecret = this.appsecret
    return new Promise(function(resolve, reject){
        that.fetchAccessToken()
            .then(function(data){
                var url = fetchUrl + 'access_token='+ that.access_token +'&media_id=' + mediaId;
                if(!permanent && type === 'video'){
                    url = url.replace('https://', 'http://')
                }
                resolve(url)
            })
    })
}
Wechat.prototype.deleteMaterial = function(mediaId){
    var that = this;
    var form = {
        media_id: mediaId
    }
    

    //todo 上传文件
    var appID = this.appID;
    var appsecret = this.appsecret
    return new Promise(function(resolve, reject){
        that.fetchAccessToken()
            .then(function(data){

                var uploadUrl = api.permanent.remove + 'access_token='+ that.access_token

                var options = {
                    method: 'POST',
                    url: url,
                    json: true,
                    body: form
                }

                request(options)
                .then(function(response){
                    console.log(_data)
                    var _data = response.body
                    console.log(_data)
                    if(_data){
                        resolve(_data);
                    }else{
                        throw new Error('delete material fails')
                    }
                })
                .catch(function(err){
                    reject(err);
                })

            })
    })
}
Wechat.prototype.updateMaterial = function(mediaId, news){
    var that = this;
    var form = {}
    _.extend(form, news)

    var appID = this.appID;
    var appsecret = this.appsecret
    return new Promise(function(resolve, reject){
        that.fetchAccessToken()
            .then(function(data){
            
                var uploadUrl = api.permanent.updateNews + 'access_token='+ that.access_token
                var options = {
                    method: 'POST',
                    url: url,
                    json: true,
                    body: form
                }

                request(options)
                .then(function(response){
                    console.log(_data)
                    var _data = response.body
                    console.log(_data)
                    if(_data){
                        resolve(_data);
                    }else{
                        throw new Error('update_news material fails')
                    }
                })
                .catch(function(err){
                    reject(err);
                })

            })
    })
}
Wechat.prototype.getCount = function(){
    var that = this;

    var appID = this.appID;
    var appsecret = this.appsecret
    return new Promise(function(resolve, reject){
        that.fetchAccessToken()
            .then(function(data){

                var url = api.permanent.count + 'access_token='+ that.access_token
                var options = {
                    method: 'POST',
                    url: url,
                    json: true,
                    body: options
                }

                request(options)
                .then(function(response){
                    resolve(response.body)
                })
            })
    })
}
Wechat.prototype.batchMaterial = function(options){
    var that = this;

    options.type = options.type || 'image'
    options.offset = options.offset || 1
    options.count = options.count || 0

    var appID = this.appID;
    var appsecret = this.appsecret
    return new Promise(function(resolve, reject){
        that.fetchAccessToken()
            .then(function(data){
            
                var uploadUrl = api.permanent.batch + 'access_token='+ that.access_token
                var options = {
                    method: 'POST',
                    url: url,
                    json: true,
                    body: options
                }

                request(options)
                .then(function(response){
                    console.log(_data)
                    var _data = response.body
                    console.log(_data)
                    if(_data){
                        resolve(_data);
                    }else{
                        throw new Error('batch material fails')
                    }
                })
                .catch(function(err){
                    reject(err);
                })

            })
    })
}
Wechat.prototype.fetchUserInfo = function(openId){
    var that = this
    var options = {
        json: true
    }
    if(_.isArray(openId)){
        options.url = api.user.fetchBatch + 'access_token='+ that.access_token
        options.body = {
            "user_list": openId
        }
        options.method = "POST"
    }else{
        options.url = api.user.fetch + "access_token=" + that.access_token + '&openid=' + openId + '&lang=zh_CN'
        options.method = "GET"
    }
    return new Promise(function(resolve, reject){
    that.fetchAccessToken()
        .then(function(data){

            request(options)
            .then(function(response){
                resolve(response.body)
            })
            .catch(function(err){
                reject(err);
            })
        })
    })
}

Wechat.prototype.createMenu = function(menu){
    var that = this;

    return new Promise(function(resolve, reject){
        that.fetchAccessToken()
            .then(function(data){
                var url = api.menu.add + 'access_token='+ that.access_token;

                var options = {
                    method: 'POST',
                    url: url,
                    body: menu,
                    json: true
                }

                request(options)
                .then(function(response){
                    var _data = response.body
                    console.log(_data)
                    if(_data){
                        resolve(_data);
                    }else{
                        throw new Error('create menu fails')
                    }
                })
                .catch(function(err){
                    reject(err);
                })

            })
    })
}

Wechat.prototype.removeMenu = function(menu){
    var that = this;

    return new Promise(function(resolve, reject){
        that.fetchAccessToken()
            .then(function(data){
                var url = api.menu.delete + 'access_token='+ that.access_token;

                var options = {
                    method: 'GET',
                    url: url,
                    json: true
                }

                request(options)
                .then(function(response){
                    var _data = response.body
                    console.log(_data)
                    if(_data){
                        resolve(_data);
                    }else{
                        throw new Error('removeMenu menu fails')
                    }
                })
                .catch(function(err){
                    reject(err);
                })

            })
    })
}

Wechat.prototype.fetchMenu = function(menu){
    var that = this;

    return new Promise(function(resolve, reject){
        that.fetchAccessToken()
            .then(function(data){
                var url = api.menu.fetch + 'access_token='+ that.access_token;

                var options = {
                    method: 'GET',
                    url: url,
                    json: true
                }

                request(options)
                .then(function(response){
                    var _data = response.body
                    console.log(_data)
                    if(_data){
                        resolve(_data);
                    }else{
                        throw new Error('fetch menu fails')
                    }
                })
                .catch(function(err){
                    reject(err);
                })

            })
    })
}

module.exports = Wechat