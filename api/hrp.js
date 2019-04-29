import http from '../utils/http.js'
import config from'../env/config.js'

const URL = config.hrp_server_url
module.exports = {
  // homeInfo: (params) => http.get(URL + '/home/info', { data: params })
  homeInfo: (params) => http.get(URL + '/home/info', { data: params }),

  //产品详情页面产品接口
  productInfo: (params) => http.get(URL + '/safeguard/insure/getProductDetail', { data: params }), 
  
  //投保信息确认页面核保接口
  underwriting: (params) => http.post(URL + '/safeguard/insure/underWrite', {
    data: params,  header: { 'content-type': 'application/json;charset=UTF-8' }
  }),
  //首页接口
  homeAInfo: (params) => http.get(URL + '/home/wxaInfo', { data: params }),
  noticeInfo: (params) => http.post(URL + '/notice/info', { data: params, header: { 'content-type':'application/json;charset=UTF-8'} }),
  
  //订单明细
  orderDetail: (params) => http.get(URL + '/safeguard/order/detail', { data: params, header: { 'content-type': 'application/json;charset=UTF-8' } }),

  //订单列表
  orderList: (params) => http.get(URL + '/safeguard/order/insurances', { data: params, header: { 'content-type': 'application/json;charset=UTF-8' } }),

//待付款
  waiterorderList: (params) => http.get(URL + '/safeguard/order/list', { data: params, header: { 'content-type': 'application/json;charset=UTF-8' } }),
  //支付结果页
  getInsureResultInfo: (params) => http.get(URL +'/safeguard/insure/getInsureResultInfo', { data: params }),

  // 支付信息查询测试mock
  getPayInfo: (params) => http.get(URL + '/safeguard/insure/getPayInfo', { data: params, header: { 'content-type': 'application/json;charset=UTF-8' } }),

  //支付承保
  payAndSign: (params) => http.post(URL + '/safeguard/insure/payAndSign', { data: params, header: { 'content-type': 'application/json;charset=UTF-8' } }),

  //产品详情二级页面
  productContent: (params) => http.get(URL + '/safeguard/insure/getProductContent', { data: params, header: { 'content-type': 'application/json;charset=UTF-8' }})  
}