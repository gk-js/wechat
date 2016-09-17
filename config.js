var path = require('path')
var wechat_file = path.join(__dirname, './config/wechat.txt')
var util = require('./libs/util')

var config = {
    wechat: {
        appID: 'wxef7ce7721f21a566',
        appsecret: '712c6899a1e68144be2beb8cad863fd3',
        token: 'wqeiuwqewwwwdasdsa12321',
        getAccessToken: function(){
            return util.readFileAsync(wechat_file)
        },
        saveAccessToken: function(data){
            console.log(JSON.stringify(data))
            var data = JSON.stringify(data)
            return util.writeFileAsync(wechat_file, data)
        }
    }
}

module.exports = config
