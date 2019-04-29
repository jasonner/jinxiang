import http from '../utils/http.js'
import config from'../env/config.js'

const URL = config.customer_server_url

module.exports = {
  //2.1.	第三方账户快捷登录
  thirdAuth: (params) => http.get(URL + '/third/auth', { data: params }),
  //获取短信验证码
  smsSend: (params) => http.post(URL + '/verify/sms', { data: params }),
  accountCheck: (params) => http.get(URL + '/account/check', { data: params }),
  thirdLogin: (params) => http.get(URL + '/third/login', { data: params }),
  graphSend: (params) => http.get(URL + '/verify/graph', { data: params }),
  //获取手机号
  getPhoneNum: (params) => http.post(URL + '/wxa/getPhoneNum', { data: params, header: { 'content-type': 'application/json;charset=UTF-8' } }),
  //4.4获取用户信息
  getCustomInfo: (params) => http.post(URL +'/account/info',{data:params}),
  //6.1.1获取用户积分信息
  pointsValue: (params) => http.get(URL + '/points/value',{ data: params }),
  //3.8快捷登录
  quickLogin: (params) => http.post(URL +'/account/quickLogin',{data:params}),
  //2.4
  chImg: (params) => http.post(URL + '/verify/graph', { data: params }),
}