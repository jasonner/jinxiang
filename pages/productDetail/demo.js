const hrp = require('../../api/hrp.js');
import http from '../../utils/http.js';
const app = getApp();
var productDetailInfo = app.globalData.productDetailInfo;
var buyInfo = app.globalData.buyInfo;//购买信息
var orderInfo = app.globalData.orderInfo;//订单信息
var insuredInfo = app.globalData.insuredInfo;//被保人信息
var selfRelationFlag = app.globalData.selfRelationFlag//是否只支持本人购买
var isLogin = false;//登录标志
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 头部banner图
    bannerInfo: [],
    // tipTitle详情提示
    productAdvantageInfo: [],
    // 产品
    safeguardPlansInfo: [
      {
        planDesc: []
      }
    ],
    //默认产品份数
    fewNum: 1,
    Protectiontext: "",//保障期间默认时间
    effectiveDate: "",//生效日期默认时间
    sexShow: true,//性别是否展示
    BirthdayShow: true,//被保人出生日期是否展示
    initialBirthday: "2017-03-10",//初始化被保人生日
    price: 0,//保费
    //公告详情title数据
    titleArr: ['交20年保20年，定制期限，价格恒定', '身故返保费，首年赠绿通及抗癌检测'],
    initialPremiumPaymentPeriod: "",//缴费期间显示初始化
    Protection: [],//保障期间数据
    ProtectionShow: true,//保障期间是否显示
    ProtectionDataChangeNO: true,//保障期间是否可选
    PayDataShow: true,
    PremiumPaymentPeriodData: [],//缴费期间数据
    PayDataChangeSelectNo: true,//缴费期间是否固定可选
    getCodeNum: "获取验证码",
    modelShow: true,//遮罩层
    clauseShow: true,//条款弹层
    telNum: '',
    graphCode: '',
    graphUrl: '',
    graphId: '',
    form: {
      tel: "",
      smsInfo: "",
    },
    userInfo: {},

    tabArr: {//产品productcode
      curHdIndex: 2258,
      curBdIndex: 2258
    },
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    items: [
      { name: 'CHN', value: '', checked: 'true' }
    ],
    sexSelect: ['男', '女'], //性别数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
    var that = this;
    console.log(options);
    orderInfo.itemCode = options.itemCode
    http.all([hrp.productInfo({//请求产品数据
      itemCode: options.itemCode
    })]).then((data) => {
      for (var i = 0; i < data.length; i++) {
        productDetailInfo = data[i]
        orderInfo.productDetailName = productDetailInfo.productName
        wx.setNavigationBarTitle({ title: productDetailInfo.productName })//动态获取title
        if (true) {//判断是否只支持本人投保并且被保人信息已经确认完毕
          selfRelationFlag = true;
        } else if (productDetailInfo.insureInfo.insuredType == "2") {
          if (productDetailInfo.insureInfo.relationToAppnt.length == "1" && productDetailInfo.insureInfo.relationToAppnt[0].value == "00") {
            selfRelationFlag = true;
          }
        }
        //1.头部banner图获取数据
        this.setData({
          bannerInfo: [
            {
              'productName': productDetailInfo.productName,
              "productImageUrl": productDetailInfo.bannerInfo.productImageUrl,
              'organizationName': productDetailInfo.bannerInfo.organizationName,
              'salesMult': productDetailInfo.bannerInfo.salesMult
            }
          ],
        })
        //2.公告渲染
        this.setData({
          productAdvantageInfo: [
            {
              'dispaly': productDetailInfo.productAdvantageInfo.dispaly
            }
          ]
        })
        // 3.产品渲染
        this.setData({
          safeguardPlansInfo: productDetailInfo.safeguardPlansInfo
        })
        // 3.1产品 默认选择
        for (var i = 0; i < productDetailInfo.safeguardPlansInfo.length; i++) {
          if (productDetailInfo.safeguardPlansInfo[i].productCode == productDetailInfo.productCode) {
            this.setData({
              tabArr: {//产品productcode
                curHdIndex: productDetailInfo.safeguardPlansInfo[i].productCode,
                curBdIndex: productDetailInfo.safeguardPlansInfo[i].productCode
              },
            })
            wx.setStorage({//获取产品下标
              key: "productId",
              data: i
            })
            buyInfo.planName = productDetailInfo.safeguardPlansInfo[i].planName
          }
        }
        wx.setStorage({
          key: 'productCode',
          data: productDetailInfo.productCode,
        })

        orderInfo.productCode = productDetailInfo.productCode//获取初始化产品的序号
        console.log(orderInfo.productCode)
        //判断产品数量是否为0，如果为0则产品不展示，否则反之；
        console.log(productDetailInfo.safeguardPlansInfo)
        if (productDetailInfo.safeguardPlansInfo[0].productCode == "") {
          this.setData({
            productListShow: false
          })
        } else {
          this.setData({
            productListShow: true
          })
        }
        // 4.产品介绍渲染
        this.setData({
          'planDesc': productDetailInfo.safeguardPlansInfo[0].planDesc
        })
        // 5.保障期间渲染
        var arr = [];
        for (var j = 0; j < productDetailInfo.insureInfo.insurePeriod.length; j++) {
          console.log(productDetailInfo.insureInfo.insurePeriod[j].showContent);
          arr.push(productDetailInfo.insureInfo.insurePeriod[j].showContent);
          this.setData({
            Protection: arr,
          })
          this.setData({
            initialProtection: productDetailInfo.insureInfo.insurePeriod[j].showContent
          })
          orderInfo.insurePeriod = productDetailInfo.insureInfo.insurePeriod[j].insurePeriod
          orderInfo.insurePeriodType = productDetailInfo.insureInfo.insurePeriod[j].insurePeriodUnit
          orderInfo.insurePeriodIndex = j
        }
        6.//生效日期范围渲染
        this.setData({
          effectiveDateStart: productDetailInfo.insureInfo.cvalidDateRange.startDay
        })
        this.setData({
          effectiveDateEnd: productDetailInfo.insureInfo.cvalidDateRange.endDay
        })
        // 7.缴费期间渲染

        this.setData({
          PremiumPaymentPeriodData: productDetailInfo.insureInfo.chargePeriod
        })
        orderInfo.payInterval = productDetailInfo.insureInfo.chargePeriod.payInterval
        orderInfo.payIntervalType = productDetailInfo.insureInfo.chargePeriod.payIntervalType
        // console.log(orderInfo.payInterval)
        // console.log(orderInfo.payIntervalType)
        // 7.份数渲染
        if (productDetailInfo.insureInfo.maxMult > 1) {//判断份数是否显示
          this.setData({
            fewNum: productDetailInfo.insureInfo.maxMult
          })
          wx.setStorage({
            key: 'fewNum',
            data: productDetailInfo.insureInfo.maxMult,
          })
        } else {
          this.setData({
            fewNumShow: true
          })
          wx.setStorage({
            key: 'fewNum',
            data: 1,
          })
        }
        // 8.保额渲染
        this.setData({
          price: productDetailInfo.insureInfo.price
        })
        //9.出生日期范围渲染
        console.log(productDetailInfo.insureInfo.insuredAgeRange[0].startDay + "出生日期渲染")
        this.setData({
          birthDaystart: productDetailInfo.insureInfo.insuredAgeRange[0].startDay//起始日期
        })
        this.setData({
          birthDayEnd: productDetailInfo.insureInfo.insuredAgeRange[0].endDay//结束日期
        })
        for (var k = 0; k < productDetailInfo.insureInfo.propertyMapperExcel.length; k++) {
          arr.push(productDetailInfo.insureInfo.propertyMapperExcel[k].insuredAge)
        }
        this.setData({
          PremiumPaymentPeriodData: arr
        })
        //10.缴费方式
        this.setData({
          chargeType: productDetailInfo.insureInfo.chargeType.label
        })
        this.initSex(productDetailInfo);//性别
        this.initInsurePeroid(productDetailInfo);//保障期间
        this.initPayInterval(productDetailInfo)//缴费期间
        this.initBirthday(productDetailInfo)//出生日期
        this.getAge(buyInfo.birthday)//被保人年龄
        this.calInsurePlan()//保障计划
        this.initPointsDeduction()//积分抵扣
      }
      setTimeout(function () {//等待加载
        that.setData({
          loadingHidden: true
        })
        that.setData({
          modalFlag: true
        })
      }, 100)

    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var timestamp = Date.parse(new Date());//生效日期
    timestamp = timestamp / 1000;
    console.log("当前时间戳为：" + timestamp);
    console.log(productDetailInfo)
    //获取当前时间  
    var n = timestamp * 1000;
    var date = new Date(n);
    //年  
    var Y = date.getFullYear();
    //月  
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    //日  
    var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    var effectiveDate = Y + "-" + M + "-" + D
    console.log(effectiveDate);
    this.setData({
      effectiveDate: effectiveDate
    })
    orderInfo.cvalidDate = effectiveDate
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  // 产品选择
  productListSelect: function (e) {
    //获取触发事件组件的dataset属性  
    var _datasetId = e.target.dataset.id;
    var _datasetIndex = e.currentTarget.dataset.index;
    var _obj = {};
    _obj.curHdIndex = _datasetId;
    _obj.curBdIndex = _datasetId;

    this.setData({
      tabArr: _obj,
    })

    this.setData({
      'planDesc': productDetailInfo.safeguardPlansInfo[_datasetIndex].planDesc
    })
    buyInfo.price = productDetailInfo.safeguardPlansInfo[_datasetIndex].planMoney
    buyInfo.planName = productDetailInfo.safeguardPlansInfo[_datasetIndex].planName
    this.initCvalidate(_datasetIndex)// 生效日期
    console.log(_datasetIndex + "生效日期")
    wx.setStorage({//获取产品下标
      key: "productId",
      data: e.currentTarget.dataset.index
    })
    this.calInsurePlan();
    orderInfo.productCode = e.target.dataset.id
  },

  // 被保人生日选择
  chooseBirthday: function (e) {
    this.setData({
      initialBirthday: e.detail.value
    })
    console.log(e.detail.value);
    wx.setStorage({
      key: 'birthday',
      data: e.detail.value,
    })
    buyInfo.birthday = e.detail.value;
    this.calInsurePlan();
  },
  //份数改变
  fewNumChange: function (e) {
    this.setData({
      fewNum: e.detail.value
    })
    console.log(e.detail.value);
    wx.setStorage({
      key: 'fewNum',
      data: e.detail.value,
    })
    buyInfo.mult = e.detail.value
    this.calInsurePlan();
  },

  // 被保人性别改变
  bindSexChange: function (e) {
    var that = this;
    this.setData({
      sex: e.detail.value
    })

    wx.setStorage({
      key: 'sex',
      data: e.detail.value,
    })
    buyInfo.sex = e.detail.value
    console.log(e.detail.value + 1)
    this.calInsurePlan();
  },
  //积分抵扣
  switch1Change: function (e) {
    this.setData({
      checked: e.detail.value
    })
    buyInfo.isOpen = e.detail.value
    console.log('switch1 发生 change 事件，携带值为', e.detail.value)
  },
  //获取手机验证手机号输入值
  mobileinput: function (e) {
    this.setData({
      telNum: e.detail.value
    })

  },
  //获取手机验证短信验证码输入值
  smsinput: function (e) {
    console.log(e.detail.value)
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
  //验证码倒计时
  waitSend: function (i) {
    if (this.data.buttonDisable) {
      return false;
    }
    var that = this;
    var intervalId = setInterval(function () {
      i--;
      that.setData({
        getCodeNum: "重新获取(" + i + ")",
        buttonDisable: true
      })
      if (i == 0) {
        that.setData({
          isSend: true
        })

        clearInterval(intervalId);
        that.setData({
          getCodeNum: '获取验证码',
          buttonDisable: false
        })
      }
    }, 1000)
  },
  // 获取图形验证码
  getImage: function () {
    console.log('发送图形验证码')
    customer.graphSend({}).then((data) => {
      console.log(data)
      console.log(data.result)
      if (data && data.result == 0) {
        console.log(data)
        console.log(customer.URL)
        this.setData({
          graphUrl: customer.URL + '/verify/showgraph/' + data.graphId
        })
        this.setData({
          graphId: data.graphId
        })
        console.log(this.data.graphUrl)
      } else {
        wx.showModal({
          title: '提示',
          content: data.resultMessage
        })
      }
    })
  },
  //获取验证码事件
  getSecurityCode: function (e) {
    var mobile = this.data.telNum;
    var graph = this.data.graphCode;
    var that = this;
    console.log(graph)
    var regMobile = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    // 获取验证码时，手机号验证失败
    if (!regMobile.test(mobile)) {
      if (mobile == '') {
        wx.showModal({
          title: '提示',
          content: '请输入手机号',
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '请输入11位的手机号码。',
        })
      }

      return false;
    } else {
      // 获取验证码时，手机号验证成功,调用发送短信验证码接口，根据返回值判断是否显示图形验证码
      // 请求发送短信验证码
      if (this.data.isSend) {
        that.setData({
          isSend: false
        })
        var thirdToken = wx.getStorage({
          key: 'thirdToken',
          success: function (res) {
            console.log(res.data)
            customer.smsSend({ mobile: mobile, graphId: '', graphCode: '', operateType: 'regandlogin', thirdToken: thirdToken, system: 'hr', type: 'wx' }).then((data) => {
              if (data.result === 0) {
                //发送成功
                wx.showToast({
                  title: '验证码已发送至您的手机"+data.mobileStar',
                })
                that.setData({
                  isSend: false
                })

                that.waitSend(60);
                // 返回参数有graphId，并且不为空的时候
                if (null != data.graphId && '' != data.graphId) {
                  // 显示图形验证码一栏，并请求发送图形验证码
                  that.setData({
                    show: true
                  })
                  that.getImage()
                } else {

                }
              } else if (data.result === 2) {
                // 需要提交图形验证码
                that.setData({
                  show: true
                })
                that.getImage()
                that.setData({
                  isSend: true
                })

              } else if (data.result === 1) {
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
                  content: data.resultMessage
                })
              } else {
                that.setData({
                  isSend: true
                })
                wx.showModal({
                  title: '提示',
                  content: data.resultMessage
                })
              }

            })

          }
        })
      }
    }
  },

  // 保障期间选择
  ProtectionDataChange: function (e) {
    var that = this;
    this.setData({
      ProtectionData: e.detail.value
    })
    var index = e.detail.value
    orderInfo.insurePeriod = productDetailInfo.insureInfo.insurePeriod[index].insurePeriod
    orderInfo.insurePeriodType = productDetailInfo.insureInfo.insurePeriod[index].insurePeriodUnit
    orderInfo.insurePeriodIndex = index
    that.calInsurePlan();
  },

  // 缴费期间选择
  PayDataChange: function (e) {
    var that = this;
    this.setData({
      PayData: e.detail.value
    })
    var index = e.detail.value;
    wx.setStorage({
      key: 'payInterval',
      data: e.detail.value,
    })
    orderInfo.payInterval = productDetailInfo.insureInfo.chargePeriod[index].payInterval
    that.calInsurePlan();
  },

  //生效日期选择
  effective: function (e) {
    this.setData({
      effectiveDate: e.detail.value
    })
    wx.setStorage({
      key: 'cvalidate',
      data: e.detail.value,
    })
    orderInfo.cvalidDate = e.detail.value
    this.calInsurePlan();
  },

  //条款弹层
  clauseTap: function () {
    console.log(1);
    this.setData({
      modelShow: false
    })
    this.setData({
      clauseShow: false
    })
  },
  //取消条款弹层
  abolish: function () {
    this.setData({
      modelShow: true
    })
    this.setData({
      clauseShow: true
    })
  },

  //立即投保确认跳转
  immediatelyInsure: function () {
    this.calPrem(buyInfo.planName, orderInfo.insurePeriod, orderInfo.insurePeriodType, insuredInfo.age, buyInfo.sex, orderInfo.payInterval, orderInfo.payIntervalType);
    console.log(orderInfo)
    console.log(buyInfo)
    console.log("产品名称:" + buyInfo.planName)
    console.log("性别:" + buyInfo.sex);
    console.log("被保人年龄:" + insuredInfo.age)
    console.log("出生日期:" + buyInfo.birthday);
    console.log("产品编码:" + orderInfo.productCode);
    console.log("生效日期:" + orderInfo.cvalidDate);
    console.log("保险期间:" + orderInfo.insurePeriod);
    console.log("保险期间单位:" + orderInfo.insurePeriodType);
    console.log("缴费期间:" + orderInfo.payInterval);
    console.log("缴费期间单位:" + orderInfo.payIntervalType);

    wx.navigateTo({
      url: '../insure/insure'
    })
  },
  // 1.被保人性别
  initSex: function (productDetailInfo) {
    // 判断是否展示性别录入
    console.log("性别判断")
    // if(!isLogin) { // 已登录状态
    // 判断insuredType是否仅支持本人投保
    if (productDetailInfo.insureInfo.insuredType == "1") { // 是，仅支持本人购买
      if (productDetailInfo.insureInfo.sex != "" && productDetailInfo.insureInfo.sex != "0") // 如果登录用户信息中性别有值，则使用登录用户信息中性别初始化页面
        this.setData({
          sexSelect: productDetailInfo.insureInfo.sex
        })
      buyInfo.sex = productDetailInfo.insureInfo.insuredType;
    } else if (productDetailInfo.insureInfo.insuredType == "2") { // 否，不仅支持本人购买，还支持其他关系人购买         
      buyInfo.sex = productDetailInfo.insureInfo.insuredType;
      for (var i = 0; i < productDetailInfo.insureInfo.relationToAppnt.length; i++) {
        if (productDetailInfo.insureInfo.relationToAppnt[i].value == "00") {
          // 如果被保人与投保人关系中包含本人，则判断如果登录用户信息中性别有值，则使用登录用户信息中性别初始化页面
          if (productDetailInfo.insureInfo.sex != "" && productDetailInfo.insureInfo.sex != "0") {
            //性别不能选

            this.setData({
              sexChangeDis: true
            })
          }
        }
        // })
      }
      // // TODO
      //     if (selfRelationFlag && improveInfoFlag) {
      //   //$("#sex").attr("disabled", true);
      //       this.setData({
      //         c: false,
      //       })   
      //     }


      // 判断是否区分性别
      if (productDetailInfo.insureInfo.sex == "0") {
        // 不区分，隐藏性别input
        // $("#sex-li").hide();
        this.setData({
          sexShow: false,
        })
      } else {
        // 区分，判断sessionStorage中是否有已选择性别，有则使用渲染到页面
        if (buyInfo.sex) {
          // $("#sex").val(buyInfo.sex);
          this.setData({
            sexSelect: buyInfo.sex//[customerInfo.sex]
          })
        }
      }
    }
  },

  // 初始化保障期间
  initInsurePeroid: function () {
    console.log("保障期间判断")
    // 初始化保险期间页面元素
    // 判断保险期间是否配置
    if (productDetailInfo.insureInfo.insurePeriod && productDetailInfo.insureInfo.insurePeriod.length > 0) {
      // 有配置，判断保险期间长度是否大于1
      if (productDetailInfo.insureInfo.insurePeriod.length > 1) {
        // 大于1，页面渲染要做成下拉选择
        console.log("保险期间长度大于1")
        this.setData({
          ProtectionDataChangeNO: true
        })
      } else {
        // 等于1，页面渲染要input，同时不能修改readonly
        this.setData({
          ProtectionDataChangeNO: false
        })
      }

    } else {
      // 没有，隐藏保险期间input
      this.setData({
        ProtectionShow: false
      })

      // 判断sessionStorage中是否有已选择保险期间，有则使用渲染到页面
      if (orderInfo.insurePeriod) {
        //$(".insurePeriod").val(orderInfo.insurePeriod);
        this.setData({
          initialPremiumPaymentPeriod: orderInfo.insurePeriod
        })
      }
    }
  },

  // 初始化缴费期间
  initPayInterval: function () {
    console.log(productDetailInfo + "缴费期间")
    // 初始化缴费期间页面元素
    // 判断缴费期间是否配置
    if (productDetailInfo.insureInfo.chargePeriod && productDetailInfo.insureInfo.chargePeriod.length > 0) {
      // 有配置，判断缴费期间长度是否大于1

      if (productDetailInfo.insureInfo.chargePeriod.length > 1) {
        // 大于1，页面渲染要做成下拉选择
        this.setData({
          PayDataChangeSelectNo: false
        })
        orderInfo.payInterval = productDetailInfo.insureInfo.chargePeriod.payInterval
        orderInfo.payIntervalType = productDetailInfo.insureInfo.chargePeriod.payIntervalType
      } else {
        // 等于1，页面渲染要input，同时不能修改readonl
        this.setData({
          PayDataChangeSelectNo: true
        })
      }
    } else {
      // 没有，隐藏缴费期间input
      // $("#chargePeriod-li").hide();
      this.setData({
        PayDataShow: false
      })
    }


    // 判断sessionStorage中是否有已选择缴费期间，有则使用渲染到页面
    if (orderInfo.payInterval) {
      this.setData({
        initialPremiumPaymentPeriod: orderInfo.payInterval
      })
    }
  },

  // 初始化生效日期，index看做是选择了第几个tab
  initCvalidate: function (index) {
    this.changeCvalidate(index);
    // 判断sessionStorage中是否有已选择生效日期，有则使用渲染到页面
    if (orderInfo.cvalidDate) {
      this.setData({
        effectiveDate: orderInfo.cvalidDate
      })
    }

  },

  //5.重置生效日期
  changeCvalidate: function (index) {
    console.log(index)
    // 取itemCode的生效日期类型或保障计划生效日期类型
    if (productDetailInfo.safeguardPlansInfo.length > 1 &&
      productDetailInfo.safeguardPlansInfo[index].planCvalidateType != undefined &&
      productDetailInfo.safeguardPlansInfo[index].planCvalidateType != "") {
      // 当safeguardPlansInfo长度大于1，且对应Index中的planCvalidateType不为空的时候
      var planCvalidate = productDetailInfo.safeguardPlansInfo[index].planCvalidateType;
    } else {
      // 当safeguardPlansInfo长度等于1
      // 判断对应Index中的planCvalidateType不为空
      if (productDetailInfo.safeguardPlansInfo[index].planCvalidateType &&
        productDetailInfo.safeguardPlansInfo[index].planCvalidateType != "") {
        var planCvalidate = productDetailInfo.safeguardPlansInfo[index].planCvalidateType;
      } else {
        // 使用insureInfo中的cvalidDateType作为生效日期类型
        var planCvalidate = productDetailInfo.insureInfo.cvalidDateType;
      }
    }
    // 次日生效
    if (planCvalidate == "1") {
      // 在当前时间上+1天
      var currDate = new Date(new Date().getTime() + 24 * 3600000);
      var month = currDate.getMonth() < 9 ? ('0' + (currDate.getMonth() + 1)) : (currDate.getMonth() + 1);
      var day = currDate.getDate() < 10 ? ('0' + currDate.getDate()) : currDate.getDate();
      var fomateCurrDate = currDate.getFullYear() + "-" + month + "-" + day;
      this.setData({
        effectiveDate: fomateCurrDate
      })
      orderInfo.cvalidDate = fomateCurrDate
    } else if (planCvalidate == "3") {
      // 当日生效
      // 直接使用当天时间
      var currDate = new Date(new Date().getTime());
      var month = currDate.getMonth() < 9 ? ('0' + (currDate.getMonth() + 1)) : (currDate.getMonth() + 1);
      var day = currDate.getDate() < 10 ? ('0' + currDate.getDate()) : currDate.getDate();
      var fomateCurrDate = currDate.getFullYear() + "-" + month + "-" + day;
      this.setData({
        effectiveDate: fomateCurrDate
      })
      orderInfo.cvalidDate = fomateCurrDate
    } else {
      // 指定日期生效
      // 判断生效日期起始时间大于(晚于)生效日期控件选择时间 或 生效日期结束时间小于(早于)生效日期控件选择时间
      if (new Date(productDetailInfo.insureInfo.cvalidDateRange.startDay).getTime() > new Date(this.effectiveDate).getTime() ||
        new Date(this.effectiveDate).getTime() > new Date(productDetailInfo.insureInfo.cvalidDateRange.endDay).getTime()) {
        // 生效日期默认为空
        this.setData({
          effectiveDate: ""
        })
      }
    }
  },

  // 初始化被保人出生日期
  initBirthday: function () {
    // 判断是否展示出生日期录入
    if (productDetailInfo.insureInfo.insuredAgeRange.length == 0) {
      this.setData({
        BirthdayShow: false
      })
    }
    // if (isLogin) {
    // 判断insuredType是否仅支持本人投保
    if (productDetailInfo.insureInfo.insuredType == "1") {
      // 是，判断用户信息中出生日期是否有值，如果有值则使用用户信息中出生日期渲染页面
      // if (customerInfo.birthday != ""){
      //   // $("#birthday-picker").val(customerInfo.birthday);
      //   this.setData({
      //     initialBirthday:customerInfo.birthday
      //   })
      // } 
    } else if (productDetailInfo.insureInfo.insuredType == "2") {
      for (var k = 0; k < productDetailInfo.insureInfo.relationToAppnt; k++) {
        if (customerInfo.birthday != "") {
          //$("#birthday-picker").val(customerInfo.birthday);
          this.setData({
            initialBirthday: customerInfo.birthday
          })
          buyInfo.birthday = customerInfo.birthday
          return false;
        }
      }
    }
    //判断sessionStorage中是否有已选择出生日期，有则使用渲染到页面
    if (buyInfo.birthday)
      // $("#birthday-picker").val(buyInfo.birthday);
      this.setData({
        initialBirthday: buyInfo.birthday
      })
    // // 出生日期变更
    console.log("出生日期biang" + buyInfo.birthday)
    this.changeBirthday();
  },

  // 重置被保人出生日期
  changeBirthday: function () {
    console.log("更新日历控件");
    // 初始化出生日期时间控件
    // 当前时间
    var currDate = new Date(new Date().getTime());
    // 当前月份
    var month = currDate.getMonth() < 9 ? ('0' + (currDate.getMonth() + 1)) : (currDate.getMonth() + 1);
    // 当前天数
    var day = currDate.getDate() < 10 ? ('0' + currDate.getDate()) : currDate.getDate();
    // 当前时间 yyyy-MM-dd
    var fomateCurrDate = currDate.getFullYear() + "-" + month + "-" + day;
    // 起始时间
    var startDay = "";
    // 结束时间
    var endDay = fomateCurrDate;
    // 判断被保人年龄区间是否有返回值
    if (productDetailInfo.insureInfo.insuredAgeRange.length > 0) {
      console.log("大于1")
      // 有返回值
      // 忽略这个If
      if (productDetailInfo.insureInfo.insuredAgeRange[productDetailInfo.insureInfo.insuredAgeRange.length - 1].startDay) {
        startDay = productDetailInfo.insureInfo.insuredAgeRange[productDetailInfo.insureInfo.insuredAgeRange.length - 1].startDay;
      }
      // 忽略这个If
      if (productDetailInfo.insureInfo.insuredAgeRange[productDetailInfo.insureInfo.insuredAgeRange.length - 1].startDay) {
        endDay = productDetailInfo.insureInfo.insuredAgeRange[0].endDay;
      }
      // 获取用户输入的生效日期
      var civalidate = orderInfo.cvalidDate

      // 投保起始年龄
      var beginParm_birth = productDetailInfo.insureInfo.insuredAgePeriod.beginBirth;
      // 投保结束年龄
      var endParm_birth = productDetailInfo.insureInfo.insuredAgePeriod.endBirth;
      // 投保起始年龄单位
      var beginParmUnit_birth = productDetailInfo.insureInfo.insuredAgePeriod.beginBirthUnit;
      // 投保结束年龄单位
      var endParmUnit_birth = productDetailInfo.insureInfo.insuredAgePeriod.endBirthUnit;

      if (civalidate == undefined || civalidate == "" || civalidate == null) {
        civalidate = new Date();
      }
      // 按投保日计算出生日期范围，默认以当前时间计算
      if (productDetailInfo.insureInfo.insuredAgeType == "1") {
        civalidate = new Date();
      }

      // 设置最小年龄限制，根据不同单位用生效日期减
      var beginDate = new Date();
      if ("D" == beginParmUnit_birth) {
        beginDate = new Date(civalidate).setDate(new Date(civalidate).getDate() - parseInt(beginParm_birth));
      } else if ("Y" == beginParmUnit_birth) {
        beginDate = new Date(civalidate).setFullYear((new Date(civalidate).getFullYear() - parseInt(beginParm_birth))); //获取80年前的时间信息
      }
      // 设置最大年龄限制，根据不同单位用生效日期减
      var endDate = new Date();
      if ("D" == endParmUnit_birth) {
        endDate = new Date(civalidate).setDate(new Date(civalidate).getDate() - parseInt(endParm_birth));
      } else if ("Y" == endParmUnit_birth) {
        endDate = new Date(civalidate).setFullYear((new Date(civalidate).getFullYear() - parseInt(endParm_birth) - parseInt("1"))); //获取80年前的时间信息
        endDate = new Date(endDate).setDate(new Date(endDate).getDate() + parseInt("1"));
      }

      beginDate = new Date(beginDate);
      endDate = new Date(endDate);
      //最小年龄设为生日结束时间
      var emonth = beginDate.getMonth() < 9 ? ('0' + (beginDate.getMonth() + 1)) : (beginDate.getMonth() + 1);
      var eday = beginDate.getDate() < 10 ? ('0' + beginDate.getDate()) : beginDate.getDate();
      endDay = beginDate.getFullYear() + "-" + emonth + "-" + eday;
      //最大年龄设为生日开始时间
      var smonth = endDate.getMonth() < 9 ? ('0' + (endDate.getMonth() + 1)) : (endDate.getMonth() + 1);
      var sday = endDate.getDate() < 10 ? ('0' + endDate.getDate()) : endDate.getDate();
      startDay = endDate.getFullYear() + "-" + smonth + "-" + sday;
      console.log("投保年龄限制开始时间：" + startDay);
      console.log("投保年龄限制结束时间：" + endDay);

      // 存到sessionstorage中
      buyInfo.insuredBeginDate = startDay;
      buyInfo.insuredEndDate = endDay;
      // 如果计算出的startDay小于等于(早于)出生日期

      //控件选择的值 并且计算出的endDate大于等于(晚于)出生日期控件选择的值
      // 则使用出生日期控件选择的值作为defaultBirthday
      if (new Date(startDay).getTime() <= new Date(defaultBirthday).getTime() &&
        new Date(defaultBirthday).getTime() <= new Date(endDay).getTime()) {
        console.log("设置生日控件默认时间" + defaultBirthday);
        this.setData({
          initialBirthday: defaultBirthday
        })
        buyInfo.birthday = defaultBirthday
      } else {
        // 否则使用endDay和startDay的中间值作为defaultBirthday
        var time = new Date(endDay).getTime() - new Date(startDay).getTime();
        var days = Math.floor(time / (24 * 3600 * 1000)) / 2;
        var midDate = new Date(new Date(startDay).setDate(new Date(startDay).getDate() + days));

        var month = midDate.getMonth() < 9 ? ('0' + (midDate.getMonth() + 1)) : (midDate.getMonth() + 1);
        var day = midDate.getDate() < 10 ? ('0' + midDate.getDate()) : midDate.getDate();
        var midDay = midDate.getFullYear() + "-" + month + "-" + day;
        this.setData({
          initialBirthday: midDay
        })
        buyInfo.birthday = midDay
        var defaultBirthday = midDay;
        console.log("设置生日控件默认时间" + defaultBirthday);
      }
    } else {
      // 没有
      // console.log("不限制投保年龄，默认选中30岁");
      // 如果控件中选择的日期小于等于endDay(当前时间)，则还使用控件中选择的日期赋值给defaultBirthday
      if (new Date(initialBirthday).getTime() <= new Date(endDay).getTime()) {
        // console.log($("#birthday-picker").val());
        console.log("设置生日控件默认时间" + defaultBirthday);
        buyInfo.birthday = defaultBirthday
      } else {
        // 如果控件中选择的日期大于endDay(当前时间)，则使用当前时间减30年作为defaultBirthday
        var midDate = new Date(new Date().setYear(new Date().getYear() - 30))
        var month = midDate.getMonth() < 9 ? ('0' + (midDate.getMonth() + 1)) : (midDate.getMonth() + 1);
        var day = midDate.getDate() < 10 ? ('0' + midDate.getDate()) : midDate.getDate();
        var midDay = midDate.getFullYear() + "-" + month + "-" + day;
        //$("#birthday-picker").val(midDay);
        this.setData({
          initialBirthday: midDay
        })
        var defaultBirthday = midDay;
        buyInfo.birthday = midDay
        console.log("生日控件默认时间" + defaultBirthday);
      }
    }

    // 组装obj，用于最后初始化datePicker
    var obj = {};
    console.log("初始化生日控件开始时间" + startDay);
    console.log("初始化生日控件结束时间" + endDay);
    console.log("初始化生日控件默认时间" + defaultBirthday);
    if (startDay != '') {
      obj = {
        minDate: startDay,
        maxDate: endDay,
        value: defaultBirthday,
        change: function (date) {
          console.log("出生日期变更");
          //$("#birthday-picker").val(date);
          this.setData({
            initialBirthday: midDay
          })
          buyInfo.birthday = midDay
          this.calInsurePlan();
        }
      }
    } else {
      obj = {
        maxDate: endDay,
        value: defaultBirthday,
        change: function (date) {
          console.log("出生日期变更");
          this.setData({
            initialBirthday: data
          })
          buyInfo.birthday = data
          calInsurePlan(data);
        }
      }
    }
    //7.核保
    // TODO
    //  if (selfRelationFlag && customerInfo != null && customerInfo.birthday != null && customerInfo.birthday != "") {
    // //  // $("#birthday-picker").val(customerInfo.birthday);//直接跳转到支付页
    //   this.setData({
    //     initialBirthday: customerInfo.birthday
    //   })
    //   wx.navigateTo({
    //     url: '../payAndSign/payAndSign',
    //   })
    //  } else {
    // //   // // 初始化datePicker
    // //   // var pickerHtml = $("#birthdayDiv").html();
    // //   // $("#birthday-picker").remove();
    // //   // $("#birthdayDiv").html(pickerHtml);
    // //   // $("#birthday-picker").datePicker(obj);
    //     this.setData({
    //       BirthdayShow:false
    //     })
    // }
  },
  //7.核保
  doUnderWrite: function () {

  },

  //8.根据出生年月与保单生效日计算年龄
  getAge: function (birthDate) {
    console.log("年龄计算")
    console.log(birthDate)
    if (birthDate != undefined) {
      var insuredAgeType = 1; // 指定日期生效
      if (insuredAgeType == "0") {
        var cvalidate = orderInfo.cvalidDate; // yyyy-mm-dd;
      } else {
        // 格式化生效时间
        var currDate = new Date(new Date().getTime());
        var month = currDate.getMonth() < 9 ? ('0' + (currDate.getMonth() + 1)) : (currDate.getMonth() + 1);
        var day = currDate.getDate() < 10 ? ('0' + currDate.getDate()) : currDate.getDate();
        cvalidate = currDate.getFullYear() + "-" + month + "-" + day;
      }
      // 生效日期
      var cvalidateArry = cvalidate.split("-");
      var cvalidateYear = cvalidateArry[0];
      var cvalidateMonth = cvalidateArry[1];
      var cvalidateDay = cvalidateArry[2];
      console.log("cvalidateYear: " + cvalidateYear);
      console.log("cvalidateMonth: " + cvalidateMonth);
      console.log("cvalidateDay: " + cvalidateDay);

      // 出生日期
      var birthDateArry = birthDate.split("-");
      var birthDateYear = birthDateArry[0];
      var birthDateMonth = birthDateArry[1];
      var birthDateDay = birthDateArry[2];
      console.log("birthDateYear: " + birthDateYear);
      console.log("birthDateMonth: " + birthDateMonth);
      console.log("birthDateDay: " + birthDateDay);

      console.log((parseInt(cvalidateYear) == parseInt(birthDateYear) + 1) &&
        (parseInt(cvalidateMonth) < parseInt(birthDateMonth)));
      console.log((parseInt(cvalidateYear) == parseInt(birthDateYear) + 1) &&
        (parseInt(cvalidateMonth) == parseInt(birthDateMonth)) &&
        (parseInt(cvalidateDay) <= parseInt(birthDateDay)));

      var oDate1 = new Date(cvalidateYear, cvalidateMonth - 1, cvalidateDay, 0, 0, 0);
      console.log("oDate1: " + oDate1);
      var oDate2 = new Date(birthDateYear, birthDateMonth - 1, birthDateDay, 0, 0, 0);
      console.log("oDate2: " + oDate2);
      returnAge = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24); //把相差的毫秒数转换为天数
      console.log("returnAge: " + returnAge + "D");

      // 计算年龄
      if (cvalidateYear == birthDateYear ||
        ((parseInt(cvalidateYear) == parseInt(birthDateYear) + 1) && (parseInt(cvalidateMonth) < parseInt(birthDateMonth))) ||
        ((parseInt(cvalidateYear) == parseInt(birthDateYear) + 1) && (parseInt(cvalidateMonth) == parseInt(birthDateMonth)) && (parseInt(cvalidateDay) <= parseInt(birthDateDay)))) {
        oDate1 = new Date(cvalidateYear, cvalidateMonth - 1, cvalidateDay, 0, 0, 0);
        console.log("oDate1: " + oDate1);
        oDate2 = new Date(birthDateYear, birthDateMonth - 1, birthDateDay, 0, 0, 0);
        console.log("oDate2: " + oDate2);
        var returnAge = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24); //把相差的毫秒数转换为天数
        console.log("returnAge: " + returnAge);
        returnAge += 'D';   // 计算出生了多少天
      } else {
        var ageDiff = cvalidateYear - birthDateYear; //年之差
        if (ageDiff > 0) {
          if (cvalidateMonth == birthDateMonth) {
            var dayDiff = cvalidateDay - birthDateDay;//日之差
            if (dayDiff < 0) {
              returnAge = ageDiff - 1;
            } else {
              returnAge = ageDiff;
            }
          } else {
            var monthDiff = cvalidateMonth - birthDateMonth;//月之差
            if (monthDiff < 0) {
              returnAge = ageDiff - 1;
            } else {
              returnAge = ageDiff;
            }
          }
          returnAge += 'Y';
        } else {
          returnAge = -1;//返回-1 表示出生日期输入错误 晚于今天
        }
      }
      console.log("周岁年龄：" + returnAge)
      insuredInfo.age = returnAge
      return returnAge;//返回周岁年龄
    } else {
      return "";//返回空
    }
  },
  // 8. 计算保费
  calPrem: function (planName, period, insurePeriodUnit, age, sex, payInterval, payIntervalType) {
    console.log("开始计算保费");
    var that = this
    console.log("计划名：" + planName + "，保险期间：" + period + "，保险期间单位：" + insurePeriodUnit + "，年龄：" + age + "，性别：" + sex + "，缴费期间：" + payInterval + "，缴费期间单位：" + payIntervalType);
    // 格式化性别
    if (sex == '0') {
      sex = '男';
    } else if (sex == '1') {
      sex = '女';
    } else if (sex == '2') {
      sex = '不详';
    }
    // 格式化保险期间
    if (insurePeriodUnit == "M") {
      period = period + "月";
      console.log(period)
    } else if (insurePeriodUnit == "D") {
      period = period + "天";
      console.log(period)
    } else if (insurePeriodUnit == "Y") {
      period = period + "年";
      console.log(period)
    } else if (insurePeriodUnit == "A") {
      period = period + "岁";
      console.log(period)
    }
    // 格式化缴费期间
    if (payIntervalType == "Y") {
      payInterval = payInterval + "年";
    } else if (payIntervalType == "M") {
      payInterval = payInterval + "月";
    }
    // 保费试算
    var saleMapper = productDetailInfo.insureInfo.propertyMapperExcel;
    if (saleMapper != undefined && saleMapper != "") {
      var amt = ""; // 保费
      console.log("保费999" + amt)
      console.log(saleMapper.length)
      for (var i = 0; i < saleMapper.length; i++) {
        console.log(saleMapper[i].protectPlan)
        if (planName == undefined || saleMapper[i].protectPlan == '' || saleMapper[i].protectPlan == planName) {   // 产品编码是计算保费的一个标识  所以不能为空
          console.log("产品编码" + saleMapper[i].protectPlan)
          if (sex == undefined || saleMapper[i].sex == '' || saleMapper[i].sex == sex) {
            if (payInterval == undefined || saleMapper[i].chargePeriod == '' || saleMapper[i].chargePeriod == payInterval) {
              if (payInterval == undefined || saleMapper[i].chargePeriod == '' || saleMapper[i].chargePeriod == payInterval) {
                if (period == undefined || saleMapper[i].insurePeriod == '' || saleMapper[i].insurePeriod == period) {
                  if (period == saleMapper[i].insurePeriod) {
                    // value含有key=age  属性，同时这个值不为空时，进行年龄范围的筛选
                    if (period == saleMapper[i].insurePeriod) {
                      var k = i;
                      if (saleMapper[k].insuredAge && saleMapper[i].insuredAge != "" && saleMapper[k].insuredAge != "-") {
                        var checkMin = "";
                        var checkMax = "";
                        var ageUnit = age.substring(age.length - 1); // 获取用户年龄单位 D/Y
                        console.log(ageUnit)
                        var ageVal = age.substring(0, age.length - 1); // 获取用户年龄
                        console.log(ageVal)
                        // var ageMapper = value['insuredAge'];  // 获取配置中的年龄范围
                        var ageMapper = saleMapper[k].insuredAge
                        var ageMapperArry = ageMapper.split("-"); //eg: [60D,17Y]
                        console.log(ageMapperArry)
                        // 18Y的情况
                        if (ageMapperArry.length == 1) {
                          var beginUnit = ageMapperArry[0].toString().substring(ageMapperArry[0].length - 1);  // 获取单位 eg:Y
                          var beginVal = ageMapperArry[0].toString().substring(0, ageMapperArry[0].length - 1);  // 获取单位 eg:60
                          console.log(beginUnit)
                          console.log(beginVal)
                          if (beginUnit == "天") {
                            beginUnit = "D";
                          } else if (beginUnit == "年") {
                            beginUnit = "Y";
                          }
                          if (ageUnit == beginUnit && parseInt(ageVal) == parseInt(beginVal)) {       // 单位相同
                            checkMin = true;
                            checkMax = true;
                          } else {             // 单位不同
                            checkMin = false;
                            checkMax = false;
                          }
                        } else { //18Y-65Y的情况    
                          for (var j = 0; j < ageMapperArry.length; j++) {
                            var beginUnit = ageMapperArry[j].toString().substring(ageMapperArry.length);  // 获取单位 eg:60
                            var beginVal = ageMapperArry[j].toString().substring(0, ageMapperArry.length);  // 获取单位 eg: D
                            if (j == 0) {
                              if (beginUnit == "天") {
                                beginUnit = "D";
                              } else if (beginUnit == "年") {
                                beginUnit = "Y";
                              }

                              console.log(ageUnit + "+" + beginUnit)
                              if (ageUnit == beginUnit) { // 单位相同
                                if (parseInt(ageVal) >= parseInt(beginVal)) {
                                  checkMin = true;
                                } else {
                                  checkMin = false;
                                }
                              } else { // 单位不同               
                                if (ageUnit == 'D' && beginUnit == 'Y') {
                                  checkMin = false;
                                } else if (ageUnit == 'Y' && beginUnit == 'D') {
                                  checkMin = true;
                                }
                              }
                            }
                            if (j == 1) {
                              var endUnit = ageMapperArry[j].toString().substring(ageMapperArry.length);  // 获取单位
                              var endVal = ageMapperArry[j].toString().substring(0, ageMapperArry.length);  // 获取单位  eg: D/Y                          
                              console.log(endUnit + "单位" + endVal)
                              if (endUnit == "天") {
                                endUnit = "D";
                              } else if (endUnit == "年") {
                                endUnit = "Y";
                              }
                              if (ageUnit == endUnit) {
                                if (parseInt(ageVal) <= parseInt(endVal)) {
                                  checkMax = true;
                                } else {
                                  checkMax = false;
                                }
                              } else {
                                if (ageUnit == 'D' && endUnit == 'Y') {
                                  checkMax = true;
                                } else if (ageUnit == 'Y' && endUnit == 'D') {
                                  checkMax = false;
                                }
                              }
                            }
                          }
                        }
                      }
                      if (checkMax && checkMin) { // 最终出生日期也正确了  则开始计算保费
                        console.log(saleMapper[k])
                        wx.getStorage({
                          key: 'fewNum',
                          success: function (res) {
                            var mult = res.data;
                            console.log(mult)
                            if (parseInt(saleMapper[k].mult) < parseInt(mult)) {
                              this.setData({
                                fewNum: mult
                              })
                              // isAllow(parseInt(saleMapper[k].mult));
                              if (saleMapper[k].amt == undefined || saleMapper[k].amt == "") {
                                amt = "--";
                                this.setData({
                                  price: amt
                                })
                              } else {
                                amt = saleMapper[k].amt;
                                this.setData({
                                  price: amt * mult
                                })
                              }
                            } else if (parseInt(saleMapper[k].mult) > parseInt(mult)) {
                              this.setData({
                                fewNum: saleMapper[k].mult
                              })

                              if (saleMapper[k].amt == undefined || saleMapper[k].amt == "") {
                                amt = "--";
                                this.setData({
                                  price: amt
                                })
                              } else {
                                amt = saleMapper[k].amt;
                                this.setData({
                                  price: amt * mult
                                })
                              }
                            } else {
                              amt = saleMapper[k].amt
                              that.setData({
                                price: amt
                              })
                              buyInfo.price = amt
                            }
                            //isAllow(parseInt(saleMapper[k].mult));   
                          }
                        })
                      }
                    }
                  }
                }
              }
            }
          }
        }

      }
      return amt;
      buyInfo.price = amt
      console.log("保费" + amt)
    } else {
      return ""
    }
  },
  //9.重置保障计划进行试算
  calInsurePlan: function () {
    var that = this
    console.log("开始重置保障")
    this.setOrderInfo();
    this.setShowInfo();
    // 年龄
    var age = this.getAge(buyInfo.birthday);
    console.log(buyInfo.birthday)
    // 保障计划名称
    var planName = buyInfo.planName;
    console.log("年龄" + age);
    if (orderInfo.cvalidDate != "" && buyInfo.sex != "" && (buyInfo.birthday != "" || productDetailInfo.insureInfo.insuredAgeRange.length == 0)) {
      console.log("校验年龄范围结果:" + this.checkInsurdBirth());
      if (this.checkInsurdBirth(productDetailInfo)) {
        console.log("试算保费")
        var price = this.calPrem(planName, orderInfo.insurePeriod, orderInfo.insurePeriodType, age, buyInfo.sex, orderInfo.payInterval, orderInfo.payIntervalType);
        console.log("保费试算：" + price);
        if (price == "") {//如果试算保费为空，则price取当前选中产品的价钱，如果所选产品价钱的为空，则取insureInfo.price;
          wx.getStorage({//获取产品下标
            key: 'productId',
            success: function (res) {
              price = productDetailInfo.safeguardPlansInfo[res.data].planMoney;
              console.log(price + "保保费结果666");
              if (price == "") {
                price = productDetailInfo.insureInfo.price;
              }
              wx.getStorage({//获取份数
                key: 'fewNum',
                success: function (res) {
                  price = parseFloat(parseInt(res.data) * parseInt(price)).toFixed(2);
                  that.setData({
                    price: price
                  })
                  orderInfo.orderAmount = price;
                },
              })
            },
          })
        } else if (price == "--") {//不能购买
          buyInfo.price = "--";
          orderInfo.orderAmount = -1;
        } else {
          wx.getStorage({//获取份数
            key: 'fewNum',
            success: function (res) {
              price = parseFloat(parseInt(res.data) * parseInt(price).toFixed(2));
              orderInfo.orderAmount = price;
              that.setData({
                price: parseFloat(price).toFixed(2)
              })
            },
          })
        }
      } else {
        var maxMult = productDetailInfo.insureInfo.maxMult;
        wx.getStorage({
          key: 'fewNum',
          success: function (res) {
            var number = res.data;
            if (parseInt(number) > maxMult) {
              number = maxMult;
              orderInfo.mult = number;
              //$.alertMessage("超过最大购买份数")
            } else {
              number = res.data;
              orderInfo.mult = number;
            }
          },
        })
        wx.getStorage({
          key: 'productId',
          success: function (res) {
            var productCode = res.data
            var price = productDetailInfo.safeguardPlansInfo[productCode].planMoney;
            if (price == "") {
              price = productDetailInfo.insureInfo.price;
            }
            price = parseFloat(parseInt(price) * parseInt(orderInfo.mult)).toFixed(2);
            orderInfo.orderAmount = price;
            that.setData({
              price: price
            })
          },
        })

      }
    } else {
      var maxMult = productDetailInfo.insureInfo.maxMult;
      wx.getStorage({
        key: 'fewNum',
        success: function (res) {
          var number = res.data;
          if (parseInt(number) > maxMult) {
            number = maxMult;
            orderInfo.mult = number;
            //$.alertMessage("超过最大购买份数")
          } else {
            number = res.data;
            orderInfo.mult = number;
          }
        },
      })
      wx.getStorage({
        key: 'productId',
        success: function (res) {
          var productCode = res.data
          var price = productDetailInfo.safeguardPlansInfo[productCode].planMoney;
          if (price == "") {
            price = productDetailInfo.insureInfo.price;
          }
          price = parseFloat(parseInt(price) * parseInt(orderInfo.mult)).toFixed(2);
          orderInfo.orderAmount = price;
          that.setData({
            price: price
          })
        },
      })
    }
    if (orderInfo.orderAmount == 0) {
      that.setData({
        SaleStatus: "免费领取"
      })
    } else {
      that.setData({
        SaleStatus: "立即投保"
      })
    }
    // if (isLogin && productDetailInfo.pointsInfo.isPoint == 1) {
    //   // calPoint();
    // }
  },


  setOrderInfo: function () {
    // 保险期间
    var insurePeriod = orderInfo.insurePeriodIndex;
    console.log(insurePeriod + "保险期间")
    // 保险期间单位
    if (productDetailInfo.insureInfo.insurePeriod.length > 0) {
      orderInfo.insurePeriod = productDetailInfo.insureInfo.insurePeriod[insurePeriod].insurePeriod;
      orderInfo.insurePeriodType = productDetailInfo.insureInfo.insurePeriod[insurePeriod].insurePeriodUnit;
    }
    console.log(orderInfo)
    // 缴费期间
    var payInterval = insurePeriod;
    // 缴费期间单位
    if (productDetailInfo.insureInfo.chargePeriod.length > 0) {
      var payIntervalType = productDetailInfo.insureInfo.chargePeriod[payInterval].payIntervalType
      orderInfo.payInterval = productDetailInfo.insureInfo.chargePeriod[payInterval].payInterval;
      orderInfo.payIntervalType = productDetailInfo.insureInfo.chargePeriod[payInterval].payIntervalType;
    } else {
      this.setData({
        PayDataChangeSelectNo: true
      })
    }


    // 生效日期
    wx.getStorage({
      key: 'cvalidate',
      success: function (res) {
        var cvalidate = res.data
        console.log(cvalidate + "生效日期")
        orderInfo.cvalidDate = cvalidate;
      },
    })


    // 产品编码
    wx.getStorage({
      key: 'productId',
      success: function (res) {
        var productId = res.data
        console.log(productId)
        var productName = productDetailInfo.safeguardPlansInfo[productId].planName
        var productId = productDetailInfo.safeguardPlansInfo[productId].productCode;
        orderInfo.productCode = productId;
        orderInfo.productName = productName
        // var productName = $("#plansListTab .tab-link.active").data("planname");

        if (orderInfo.productCode == "") {
          orderInfo.productCode = productDetailInfo.productCode;
          orderInfo.productName = productDetailInfo.productName;
        }
      }
    })
    //份数
    wx.getStorage({
      key: 'fewNum',
      success: function (res) {
        orderInfo.mult = res.data
      },
    })
    //  orderInfo.mult = $("#mult").val();
  },

  setShowInfo: function () {
    if (productDetailInfo.insureInfo.insuredType == "1") {
      // 只支持本人投保
      insuredInfo.relationToAppnt = "00";
      buyInfo.relationToAppntLabel = "本人";
      insuredInfo.bnfLegalFlag = "1";
    }
    // 性别
    // var sex = $("#sex").val();
    wx.getStorage({
      key: 'sex',
      success: function (res) {
        var sex = res.data
        if (productDetailInfo.insureInfo.sex == "0") {
          sex = "0";
        }
        buyInfo.sex = sex;
      },
    })
    buyInfo.informContent = productDetailInfo.informContent;
    console.log(buyInfo.informContent);
  },

  //校验年龄范围
  checkInsurdBirth: function () {
    console.log("校验年龄范围")
    console.log(productDetailInfo)
    var startDay = buyInfo.insuredBeginDate;
    var endDay = buyInfo.insuredEndDate;
    console.log("校验生日计算生日开始时间：" + startDay);
    console.log("校验生日计算生日结束时间：" + endDay);
    if (new Date(endDay).getTime() >= new Date(buyInfo.birthday).getTime() && new Date(buyInfo.birthday).getTime() >= new Date(startDay).getTime()) {
      return true;
    } else {
      console.log("请确认被保险人年龄在可保范围内");
      return false;
    }
  },


  /* checkStockNum();*/
  //10.初始化积分抵扣
  initPointsDeduction: function () {
    var rate = productDetailInfo.pointsInfo.rate;
    var maxPrice = productDetailInfo.pointsInfo.maxPrice;
    console.log(rate);
    console.log(maxPrice);
    var isPoint = false;
    //如果pointsInfo中的isPoint=1并且可抵扣的最大金额和比例不同时为空，
    // 则展示积分抵扣这一行，isPoint = true
    if (productDetailInfo.pointsInfo.isPoint == "1") {
      if ((rate != '' && rate != null) || (maxPrice != '' && maxPrice != null)) {
        isPoint = true;
      }
    }
    buyInfo.isPoint = isPoint;
    if (isPoint) {
      this.setData({
        Point_li: true
      })
    } else {
      this.setData({
        Point_li: false
      })
    }
    if (isLogin) {
      this.setData({
        userPhoneLoginShow: false
      })
    } else {
      this.setData({
        userPhoneLoginShow: true
      })
    }
  },
  //11.积分抵扣计算方法(初始化)
  calPoint: function () {
    //获取后台配置积分抵扣的信息
    var minPoint = productDetailInfo.pointsInfo.minPoint;
    var minPrice = productDetailInfo.pointsInfo.minPrice;
    minPrice = (minPrice != '' && minPrice != null) ? minPrice : 0;//如果没有，表示任意成单金额都可使用积分抵扣
    var rate = productDetailInfo.pointsInfo.rate;
    rate = (rate != '' && rate != null) ? rate : 1;//如果没有比例，就是保费
    var maxPrice = productDetailInfo.pointsInfo.maxPrice;
    var orderAmount = orderInfo.orderAmount;
    var exchangeMoney;
    var exchangeIntegral;
    var payMoney;
    if (orderAmount == '-1') {
      this.setData({
        switchOpen: false,
        checked: false
      })
      wx.showModal({
        title: '提示',
        content: '保费满' + minPrice + '元可用',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else if (orderAmount != '') {
      if (orderAmount < minPrice) {
        this.setData({
          switchOpen: false,
          checked: false
        })
        wx.showModal({
          title: '提示',
          content: '保费满' + minPrice + '元可用',
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
        buyInfo.payMoney = orderInfo.orderAmount;
        return;
      }

      //计算最高可抵扣金额exchangeMoney，兑换可用积分exchangeIntegral
      //用户积分>最小积分可用，积分不足显示最小积分
      var point = availablePoint > minPoint ? availablePoint : minPoint;
      // var availablePrice = parseInt(point/100);
      var availablePrice = point / 100;
      var ratePrice = null;
      if (rate != '' && rate != null) {
        ratePrice = parseFloat(rate * orderAmount).toFixed(2);
      } else {
        ratePrice = orderAmount;
      }

      if (availablePoint >= minPoint) {
        if (maxPrice == '' || maxPrice == null) {//两值比较取小
          exchangeMoney = availablePrice < ratePrice ? availablePrice : ratePrice;
        } else {//三值比较取小
          exchangeMoney = availablePrice - (ratePrice - maxPrice < 0 ? ratePrice : maxPrice) < 0 ? availablePrice : (ratePrice - maxPrice < 0 ? ratePrice : maxPrice);
        }
      } else {//积分不满足条件时，exchangeMoney计算不同
        if (maxPrice == '' || maxPrice == null) {//两值比较取小
          exchangeMoney = ratePrice;
        } else {//三值比较取小
          exchangeMoney = ratePrice - maxPrice < 0 ? ratePrice : maxPrice;
        }
      }
      exchangeIntegral = parseFloat(exchangeMoney * 100).toFixed(0);
      orderInfo.exchangeIntegral = exchangeIntegral;
      buyInfo.exchangeMoney = exchangeMoney;
      if (availablePoint < minPoint) {
        this.setData({
          switchOpen: false,
          checked: false
        })
        wx.showModal({
          title: '提示',
          content: '共' + availablePoint + '积分，满' + minPoint + '积分可用',
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
        buyInfo.payMoney = orderInfo.orderAmount;
      } else {
        //解除不满足条件的影响
        this.setData({
          switchOpen: false,
          checked: true
        })
        var availablePointStr = availablePoint >= 100000 ? (availablePoint / 10000) + '万' : availablePoint;
        if (this.setData.checked) {
          var payMoney = orderInfo.orderAmount - buyInfo.exchangeMoney;
          if (orderInfo.orderAmount == -1) {
            this.setData({
              price: '--'
            })
          } else {
            this.setData({
              price: parseFloat(payMoney).toFixed(2)
            })
          }
          buyInfo.payMoney = payMoney;
          wx.showModal({
            title: '提示',
            content: '共' + availablePointStr + '积分,可用' + parseFloat(exchangeIntegral).toFixed(0) + '积分,抵' + parseFloat(exchangeMoney).toFixed(2) + '元',
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        } else {
          this.setData({
            price: parseFloat(orderInfo.orderAmount).toFixed(2)
          })
          buyInfo.payMoney = orderInfo.orderAmount;
          // buyInfo.isOpen = false;
          wx.showModal({
            title: '提示',
            content: '共' + availablePointStr + '积分,可用' + parseFloat(exchangeIntegral).toFixed(0) + '积分,抵' + parseFloat(exchangeMoney).toFixed(2) + '元',
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
        //满足条件初始化
        console.log('满足条件默认打开' + buyInfo.isOpen + orderAmount);
        if (buyInfo.isOpen == false) {//后退回来
          this.setData({
            checked: false,
            price: parseFloat(orderAmount).toFixed(2)
          })
          wx.showModal({
            title: '提示',
            content: '共' + availablePointStr + '积分,可用' + exchangeIntegral + '积分,抵' + parseFloat(exchangeMoney).toFixed(2) + '元',
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
          return;
          console.log('后退');
        } else {
          this.setDta({
            checked: true
          })
          wx.showModal({
            title: '提示',
            content: '共' + availablePointStr + '积分,可用' + exchangeIntegral + '积分,抵' + parseFloat(exchangeMoney).toFixed(2) + '元',
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
          $('#pointDesc').html('共' + availablePointStr + '积分,可用' + exchangeIntegral + '积分,抵' + parseFloat(exchangeMoney).toFixed(2) + '元');
          payMoney = orderAmount - exchangeMoney;
          $('#orderAmount').html(parseFloat(payMoney).toFixed(2));
          buyInfo.payMoney = payMoney;
          console.log('初始化');
        }
      }
    }
  },
})