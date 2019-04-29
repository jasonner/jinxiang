//index.js
//获取应用实例
const app = getApp();
const hrp = require('../../api/hrp.js');
import http from '../../utils/http.js';

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    productInfo: {},//存放产品列表信息：产品名称，产品链接，产品描述，产品图片自身地址
    imgUrl: '', //首页背景图片
    iPhoneX:false,
    swiperCurrent: 0,  //当前轮播图
    indicatorDots: true,
    vertical: false,
    autoplay:false,
    loop:true,
    interval: 4000,
    duration: 1000,
    loadingHidden: false,  // loading
  },

  onLoad: function () {
    this.setData({
      loadingModelShow: false,
      loadingHidden: false,
    }) 
    //查询首页信息
    hrp.homeAInfo({}).then((data) => {
      var that = this;
      console.log(data);
      wx.getSystemInfo({//获取用户手机信息
        success: function (res) {
          console.log(res.model)
          if (res.model =="iPhone X"){
            console.log("苹果手机666")
            that.setData({
              iPhoneX:true
            })
          }else{
            that.setData({
              iPhoneX: false
            })
          }
        }
      })
      that.setData({
        imgUrl: data.imgUrl,
        productInfo: data.productList
      })
     
    })
    this.setData({
      loadingModelShow: true,
      loadingHidden: true
    }) 
  },
  // 改变轮播变换按钮
  changeIndicatorDots: function (e) {
    this.setData({
      indicatorDots: !this.data.indicatorDots
    })
  },

  changeAutoplay: function (e) {
    this.setData({
      autoplay: !this.data.autoplay
    })
  },
  intervalChange: function (e) {
    this.setData({
      interval: e.detail.value
    })
  },
  // 获取当前轮播图，设置轮播按钮
  swiperChange: function (e) {
    this.setData({
      swiperCurrent: e.detail.current
    })
  },  
  
  durationChange: function (e) {
    this.setData({
      duration: e.detail.value
    })
  }
})
