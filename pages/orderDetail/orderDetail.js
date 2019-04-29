const app = getApp()
const util = require('../../utils/util.js')
import pageUtil from '../../utils/page-util.js'
const customer = require('../../api/customer.js')
const hrp = require('../../api/hrp.js')
import http from '../../utils/http.js'
// pages/policyDetails/policyDetails.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    urlParams: {}, //记录url参数信息
    // 订单详情报文：JSON数据
    orderBase: {},
    contDetails: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 检查登录状态
    pageUtil.checkLogin().then((data)=>{

      //从url中拿出参数，存放到urlParams:itemCode和applicationNo
      this.setData({
        urlParams: util.getCurrentPageUrl(),
          loadingModelShow: false,
          loadingHidden: false
      })

      console.log(this.data.urlParams)
      var that = this;
      // 获取订单详情信息
      hrp.orderDetail({ "applicationNo": that.data.urlParams.applicationNo }).then((data) => {
        console.log(data);
        if (data.result!="1"){
          for (var i = 0; i < data.contDetails.length; i++) {
            if (data.contDetails[i].prvdContNo == undefined) {
              data.contDetails[i].prvdContNo = "";
            }
            data.contDetails[i].cvalidDate = data.contDetails[i].cvalidDate.replace(/\-/g, '.');
            data.contDetails[i].endDate = data.contDetails[i].endDate.replace(/\-/g, '.');
          }

          this.setData({
            contDetails: data.contDetails,
            orderBase: data.orderBase,
            riskDutys: data.contDetails[0].riskDutys,
            providerName: data.contDetails[0].providerCode,
            appntName: data.contDetails[0].appntName,
            insuredName: data.contDetails[0].insuredName
          })
        }
        this.setData({
          loadingModelShow: true,
          loadingHidden: true
        }) 
      })
    })
  },
})