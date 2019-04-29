//app.js
const hrp = require('api/hrp.js')
const customer = require('api/customer.js')
const pageUtil = require('./utils/page-util.js')
import WxRequest from './assets/plugins/wx-request/lib/index'
import WxValidate from './assets/plugins/wx-validate/WxValidate'
import WxService from './assets/plugins/wx-service/WxService'
import http from './utils/http.js'


App({
  data:{
    
  },
  globalData: {
    userInfo: null,
    productDetailInfo:{},//产品data
    insureInfoDetail:{},//销售计划信息
    buyInfo: {},//购买信息
    orderInfo: {},//订单信息
    insuredInfo: {},//被保人信息
    selfRelationFlag: false,
    keyInfo: {},
    isLogin: false,
    phoneNum:""
  },
  itemCode:"",
  onLaunch: function () {
    var that = this;
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
   
    // 登录
    wx.login({
      success: res => {
        console.log(res.code)
       
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          console.log(res.code);
          wx.request({
            url: 'https://api.weixin.qq.com/sns/jscode2session',
            data: {
              // 小程序唯一标示
              appid: 'wxb99f39ca7ab1b635',
              // 小程序的 app secret
              secret: '50751457f0dfc99fb50d93728305e009',
              grant_type: 'authorization_code',
              js_code: res.code
            },
            method: 'GET',
            header: { 'content-type': 'application/json' },
            success: function (openIdRes) {
              // 获取到 openId
              console.log(openIdRes.data.openid);
              // 判断openId是否为空
              if (openIdRes.data.openid != null & openIdRes.data.openid != undefined) {
                wx.getUserInfo({
                  success: function (data) {
                    // 自定义操作
                    // 绑定数据，渲染页面
                    console.log(data);
                    that.globalData.userInfo = data.userInfo;
                  }
                })
              } else {
                // openId为空
              }
            }
          })
          // code = res.code
          var code = res.code;
          wx.getUserInfo({//getUserInfo流程
            success: function (res2) {//获取userinfo成功
              console.log(res2);
              that.globalData.userInfo = res2.userInfo;
              console.log(that.globalData.userInfo);
            }
          })
          //发起网络请求
          console.log(res.code)
          customer.thirdAuth({ "code": res.code, system: 'hr', thirdType: "hrwxa", type: 'wxa'}).then((data) => {
            console.log(res.code);
            console.log(data);
            wx.setStorageSync("third", data.thirdToken);
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    })
   
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            },

          })
        }
      }
    })
  },
  WxValidate: (rules, messages) => new WxValidate(rules, messages)
})