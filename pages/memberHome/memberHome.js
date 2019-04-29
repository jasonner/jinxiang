 // pages/memberHome/memberHome.js
const app = getApp();
const util = require('../../utils/util.js');
import pageUtil from '../../utils/page-util.js';
const customer = require('../../api/customer.js');
const hrp = require('../../api/hrp.js');
import http from '../../utils/http.js';
import config from '../../env/config.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showView: false, //是否显示登录弹窗
    userInfo: {},//存放globalData中的userinfo信息
    hasUserInfo: true, //记录已经是否已经获取到userinfo信息
    canIUse: wx.canIUse('button.open-type.getUserInfo'), //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    isLogin:false, //华瑞账户登录状态
    isSend:true, //是否已经发送过手机验证码
    orderBtnState:true, //记录不同登录状态下，按钮的样式(原因：获取手机号必须通过button实现，我的订单处未登录时状态通登录按钮)
    getCodeNum:'获取验证码',
    noLoginPhone:true,
    noLoginNoPhone:false,
    isFormOk: true,
    errorMsg: null,
    buttonDisable:false, //控制短信验证码点击发送一次之后，1分钟之内不可再点击
    show:false, //是否显示图形验证码
    encryptedData:'',
    iv:'',
    graphCode:'',//图形验证码
    graphUrl:'',//图形验证码URL
    graphId:'',//图形验证码ID
    mobileSub:'',//短信验证码
    smsId:'',//短信验证码ID
    form: { //存放要验证的手机号和短信验证码
      tel : "",
      smsInfo : "",
    }
  },

  // 取消登录，弹窗关闭
  cancel: function () {
    console.log(1)
    this.setData({
      showView: false
    });
  },

  // confirm: function () {
  //   var that = this;
  //   that.setData({
  //     showView: (!that.data.showView)
  //   })
  // },

  myPolicyDetail: function (){ 
      wx.navigateTo({
        url: '../myPolicy/myPolicy',
      })
  },
  
  //跳转到关于华瑞
  toAbountHuaRui:function(){
    wx.navigateTo({
      url: '/pages/abountHuaRui/index',
    })
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 判断登录状态
    // var that = this;
    pageUtil.checkLogin().then((data) => {
      console.log(data.isLogin);
      if (data.isLogin) {
        this.setData({
          isLogin: data.isLogin,
          orderBtnState: false,
          // loginSelected:false,
          noLogin:false,
          hasLogin:true
        })
        console.log(app.globalData.userInfo);
        console.log(app.globalData);
        if (app.globalData.userInfo) {
          this.setData({
            userInfo: app.globalData.userInfo,
            hasUserInfo: true
          })
        } else if (this.data.canIUse) {
          // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
          // 所以此处加入 callback 以防止这种情况
          app.userInfoReadyCallback = res => {
            this.setData({
              userInfo: res.userInfo,
              hasUserInfo: true
            })
          }
        } else {
          // 在没有 open-type=getUserInfo 版本的兼容处理
          wx.getUserInfo({
            success: res => {
              app.globalData.userInfo = res.userInfo
              this.setData({
                userInfo: res.userInfo,
                hasUserInfo: true
              })
            }
          })
        }
        console.log(this.data.orderBtnState)
      } else {
        this.setData({
          orderBtnState: true,
          // loginSelected: true,
          noLogin:true,
          hasLogin:false
        })
      }
    })
    var that = this;
      // 初始化表单验证
      this.WxValidate = app.WxValidate(
      {
          tel: {
            required: true,
            tel: true
        },
          smsInfo: {
          required: true,
          smsInfo: true
        }
      },
      {
          tel: {
            required: '请输入手机号'
          },
          smsInfo: {
            required: '请输入短信验证码'
          }
      }
    )
      console.log(this.WxValidate );
  },

  /**
 * 生命周期函数--监听页面显示
 */
  onShow: function () {
  
    // 判断登录状态
    // var that = this
    pageUtil.checkLogin().then((data) => {
      console.log(data.isLogin);
     //ceshi
      // data.isLogin = false;
      if (data.isLogin) {
        this.setData({
          isLogin: data.isLogin,
          orderBtnState: false,
          // loginSelected: false,
          hasLogin:true,
          noLogin:false
        })
        console.log(this.data.orderBtnState);
        if (app.globalData.userInfo) {
          this.setData({
            userInfo: app.globalData.userInfo,
            hasUserInfo: true
          })
        } else if (this.data.canIUse) {
          // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
          // 所以此处加入 callback 以防止这种情况
          app.userInfoReadyCallback = res => {
            this.setData({
              userInfo: res.userInfo,
              hasUserInfo: true
            })
          }
        } else {
          // 在没有 open-type=getUserInfo 版本的兼容处理
          wx.getUserInfo({
            success: res => {
              app.globalData.userInfo = res.userInfo
              this.setData({
                userInfo: res.userInfo,
                hasUserInfo: true
              })
            }
          })
        }
      } else {
        this.setData({
          orderBtnState: true,
          // loginSelected: true,
          noLogin:true,
          hasLogin:false
        })
      }
    })
  },

  // 微信获取手机号
  getPhoneNumber: function (e) {
    var that = this;
    wx.login({
      success: function (res) {
        if (res.code) {
          console.log(e.detail.iv);
          console.log(e.detail.encryptedData);
          var iv = e.detail.iv;
          var encryptedData = e.detail.encryptedData;
          console.log(e);
          if (iv && encryptedData) {
            var third = wx.getStorageSync('third');
            customer.getPhoneNum({ encryptedData: encryptedData, iv: iv, thirdToken: third }).then((data) => {
              console.log(data);
              if (data.result == "0" && data.phoneNum){
                app.globalData.userInfo = data.phoneNum;
                  that.setData({
                    isLogin:true,
                    phoneNum: data.phoneNum
                  })
               }
              if (app.globalData.userInfo != "" && app.globalData.userInfo){
                that.setData({
                  phoneNum: app.globalData.userInfo,
                  noLoginNoPhone:true,
                  noLoginPhone:false
                })
              }
            }) 
          }
        }
      },
      fail:function(){
        errTip("登录失败");
      }
    })
    this.setData({
      showView: true
    })
  },

  //录入手机号
  mobileinput:function(e){
    console.log(e.detail.value);
    this.setData({
      phoneNum: e.detail.value
    })
  },
  LoginAndResig:function(){
      this.setData({
        showView: true,
      })
  },
  //获取手机验证短信验证码输入值
  smsinput: function (e) {
    console.log(e.detail.value);
    this.setData({
      smsNum: e.detail.value
    })

  },

  //获取图形验证码输入值
  graphinput: function (e) {
    console.log(e.detail.value)
    this.setData({
      graphCode: e.detail.value
    })
  },

  // 获取图形验证码
  getImage:function(){
    console.log('发送图形验证码');
    var loginToken = wx.getStorageSync('loginToken');
    customer.graphSend({ loginToken: loginToken}).then((data) => {
      console.log(data)
      console.log(data.result)
      if (data && data.result == 0) {
        console.log(data)
        console.log(config.customer_server_url)
        this.setData({
          graphUrl: config.customer_server_url + '/verify/showgraph/' + data.graphId
        })
        this.setData({
          graphId: data.graphId
        })
      }else{
        wx.showModal({
          title: '提示',
          content: data.resultMessage,
          confirmColor: "#f3b256",
        })
      }
    })
  },

  //获取验证码事件
  getSecurityCode: function (e) {
    var mobile = this.data.phoneNum;
    var graph = this.data.graphCode;
    var graphId = this.data.graphId;
    console.log(mobile+"手机号");
    var that = this;
    var regMobile = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    // 获取验证码时，手机号验证失败
    if (!regMobile.test(mobile)) {
      if (mobile == ' ' || !mobile || !regMobile.test(mobile)){
        wx.showModal({
          title: '提示',
          content: '请输入正确的手机号码',
        })
      }
      return false;
    }else{
      // 获取验证码时，手机号验证成功,调用发送短信验证码接口，根据返回值判断是否显示图形验证码
       // 请求发送短信验证码
      console.log(this.data.isSend);
       if(this.data.isSend){
         console.log(this.data.isSend)
         that.setData({
           isSend: false
         })
        wx.getStorage({
           key: 'third',
           success: function (res) {
             console.log(res.data)
             // 请求发送短信验证码
             customer.smsSend({ operateType: 'regandlogin', mobile: mobile, graphId: graphId, graphCode: graph, thirdToken: res.data, system: 'hr', type: 'wxa' }).then((data) => {
               console.log(data);
               if (data.result == "0") {
                 //发送成功
                 wx.showToast({
                   title: '验证码已发送',
                 })
                 that.setData({
                   isSend: false,
                   mobileSub: data.mobileSub,
                   smsId: data.smsId
                 })
                console.log(999);
                that.getImage();
                 that.waitSend(60);
                 // 返回参数有graphId，并且不为空的时候
                 if (data.graphId != null && data.graphId !='') {
                   // 显示图形验证码一栏，并请求发送图形验证码
                   that.setData({
                     show: true
                   })
                   that.getImage()
                 } else {

                 }
               } else if (data.result == "2") {
                 that.setData({
                   show: true
                 })
                 that.getImage()
                 that.setData({
                   isSend:true
                 })
                
               } else if (data.result == "1") {
                 // 发送失败
                 that.setData({
                   show: true
                 })
                 that.getImage()
                 that.setData({
                   isSend: true
                 })
                 wx.showModal({
                   title: '提示',
                   content: data.resultMessage,
                   confirmColor: "#f3b256",
                 })
               } else {
                 that.setData({
                   isSend: true
                 })
                 wx.showModal({
                   title: '提示',
                   content: data.resultMessage,
                   confirmColor: "#f3b256",
                 })
               }

             })

           }
         })
       
       }     
      
    }
  },
   
  // 登录验证事件
  formSubmit: function (e) {
    var that = this;
    var graph = this.data.graphCode;//图形验证码值
    console.log(this.data.phoneNum);
    console.log(this.data.smsNum);
    console.log(this.data.smsId);
    console.log("图形验证码"+graph);
    //未获取到用户手机号时
    if(!this.data.phoneNum){
      this.setData({
        disabledW:false
      })
    }
    // 表单验证不通过，提交错误描述
    if (!this.WxValidate.checkForm(e)) {
            const error = this.WxValidate.errorList[0];
            this.setData({
                isFormOk: false,
                errorMsg: error.msg,
              });

        wx.showModal({
            title: '提示',
            content: error.msg,
            showCancel: false,
            confirmColor: "#f3b256",
        });
    } else{
      // 表单验证通过，进行快捷登录
      wx.getStorage({//获取thirdToken
        key: 'third',
        success: function (res) {
          console.log(res.data)
          that.setData({
            thirdToken: res.data
          })
          // 快捷登录
          console.log("电话号码" + that.data.phoneNum);
          console.log("短信验证码ID"+that.data.smsId);
          console.log("短信验证码" + that.data.smsNum);
          console.log("图形验证码" + that.data.graphCode);
          console.log("图形验证码ID" + that.data.graphId);
          console.log("thirdToken" + that.data.thirdToken);
          customer.quickLogin({ mobile: that.data.phoneNum, smsId: that.data.smsId, smsCode: that.data.smsNum, graphCode: that.data.graphCode, graphId: that.data.graphId, thirdToken: that.data.thirdToken, system: 'hr', type: 'wxa' }).then((data) => {
            console.log(data);
            if (data.loginToken != "" && data.loginToken){
              wx.setStorageSync('loginToken', data.loginToken);
            }
            if (data.token){
              wx.setStorageSync('lognimgToken', data.token);
            }
            if (data.regSystemType){
              wx.setStorageSync('regSystemType', data.regSystemType);
            }
            // 登录成功
            if (data.result == "0"){
              that.setData({
                // loginSelected: false,
                noLogin:false,
                hasLogin:true,
                showView: false,
                hrAccountLogin: true //更新华瑞账户登录状态
              })
              wx.setStorageSync("token", data.token);
              wx.setStorage({
                key: 'hrAccountLogin',
                data: that.data.hrAccountLogin,
              })

              that.setData({
                orderBtnState: false,
                // BtnState: false
              })

            } else if (data.result == "3"){
              // 需要用户授权登录
              // TODO 待确认

            }else if (data.result == "7"){
              // 需要提交图形验证码
                that.setData({
                  show: true
                })
                wx.showModal({
                  title: '提示',
                  content: "",
                  confirmColor: "#f3b256",
                  content: data.resultMessage
                })
                that.getImage()
                that.setData({
                  isSend: true
                })
            }else {
              // 登录失败
              wx.showModal({
                title: '提示',
                content: "",
                confirmColor: "#f3b256",
                content: data.resultMessage
              })
              that.setData({
                showView: false
              })
            }
          })
        },
      })
    }
  },

  getUserInfo: function (e) {//获取用户微信头像和昵称
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  
  //验证码倒计时
  waitSend: function (i) {
    console.log(i);
    var that = this;
    var intervalId = setInterval(function () {
      i--;
      that.setData({
        getCodeNum: "重新获取(" + i + ")",
        buttonDisable: true
      })
      if (i == 0) {
        that.setData({
          isSend: true,
          grayactive:false
        })
        clearInterval(intervalId);
        that.setData({
          getCodeNum: '获取验证码',
          buttonDisable: false
        })
      }else{
        grayactive: true
      }
    }, 1000)
  },

  //错误提示
  errTip: function (text) {
    wx.showModal({
      title: '提示',
      content: text,
      confirmColor: "#f3b256",
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
})
  