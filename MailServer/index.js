'use strict';

/*
    $ npm install
    $ node index.js --ipaPath {ipapath} --emails {email1, email2}
*/

// 获取命令参数
var argv = require('minimist')(process.argv.slice(2))
console.log(argv)

var filePath = argv.ipaPath || ''
filePath = '../app-test.ipa'
console.log(`filePath: ${filePath}`)

var emails = argv.emails || ''
emails = emails.length > 0 ? `${emails}, defaultEmail` : 'email'
console.log(`emails: ${emails}`)


var fs = require('fs')
var extract = require('ipa-extract-info')
const nodemailer = require('nodemailer')

var displayName = ''
var bundleIdentifier = ''
var shortVersionString = ''
var bundleVersion = ''

var subject = ''
var html = ''

var request = require('request')

fs.exists(filePath, function (exists) {

    if (exists == false) {
        console.log('文件不存在')
        return
    }

    var fd = fs.openSync(filePath, 'r')

    extract(fd, function(err, info, raw){
      if (err) {
        subject = 'ios 测试包 ✔'
        html = '<a href=https://fir.im/75dq>测试包下载地址</a>'
        sendEmail(emails, subject, html)
        return
      } 
        var cfInfo = info[0] // the parsed plist
        // console.log(cfInfo);
        displayName = cfInfo.CFBundleDisplayName
        bundleIdentifier = cfInfo.CFBundleIdentifier
        shortVersionString = cfInfo.CFBundleShortVersionString
        bundleVersion = cfInfo.CFBundleVersion

        console.log(`displayName: ${displayName}`)
        console.log(`bundleIdentifier: ${bundleIdentifier}`)
        console.log(`shortVersionString: ${shortVersionString}`)
        console.log(`bundleVersion: ${bundleVersion}`)

        subject = `${displayName} ios 测试包 ✔`
        html = `<div>
                  <div>
                    app名称: ${displayName}
                  </div>
                  <div>
                    id: ${bundleIdentifier}
                  </div>
                  <div>
                    版本号: ${shortVersionString}
                  </div>
                  <div>
                    build号: ${bundleVersion}
                  </div>
                  <div>
                  <a href=https://fir.im/75dq>测试包下载地址</a>
                  </div>
                </div>
                  `
        sendEmail(emails, subject, html)

        var markdown = {
            title: 'displayName iOS 测试包',
            text: `#### displayName: ${displayName} iOS 测试包\n > 1. bundleIdentifier: ${bundleIdentifier}\n > 2. shortVersionString: ${shortVersionString}\n > 3. bundleVersion: ${bundleVersion}\n > 4. [下载地址](https://fir.im/75dq)\n 
                @13051149394
                `
            }
        var atMobiles = []
        sendDingTalkMessage(markdown, atMobiles)
    })
})


var sendEmail = function (emails, subject, html) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    nodemailer.createTestAccount((err, account) => {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            service: '163',
            host: 'smtp.163.com',
            port: 465,
            secure: false, // true for 465, false for other ports
            auth: {
                user: 'your email address', // generated ethereal user
                pass: 'email smtp password' // generated ethereal password
            }
        });

        // setup email data with unicode symbols
        let mailOptions = {
            from: '"Test 👻" <your email>', // sender address
            to: emails, // list of receivers
            subject: subject, // Subject line
            text: 'Hello world?', // plain text body
            html: html // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('----------')
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
        });
    });
}


var sendDingTalkMessage = function (markdown, atMobiles) {
    var dingtalkUrl = 'https://oapi.dingtalk.com/robot/send?access_token=9b0e81393bbb04d0cc3acbf402e86f078053c2c6adde646b87ae316d08ee1211'
    var dingtalkData = {
       "msgtype": "markdown",
       "markdown": markdown,
        "at": {
           "atMobiles": atMobiles, 
           "isAtAll": false
       }
    }
    var dingtalkOptions = {
      url: dingtalkUrl,
      headers: {'Content-Type': 'application/json ;charset=utf-8'},
      method: 'POST',
      json: true,
      body: dingtalkData
    }

    request(dingtalkOptions, function (err, httpResponse, body) {
      console.log(err)
      console.log(httpResponse)
      console.log(body)
    })
}
