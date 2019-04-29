const app = getApp();
const hrp = require('../../api/hrp.js');
const customer = require('../../api/customer.js');
import pageUtil from '../../utils/page-util.js';
import http from '../../utils/http.js';
import config from '../../env/config.js';

var productDetailInfo = app.globalData.productDetailInfo;//产品信息
var buyInfo = app.globalData.buyInfo;//购买信息
var buyInfoTemp = {};
var orderInfo = app.globalData.orderInfo;//订单信息
var insuredInfo = app.globalData.insuredInfo;//被保人信息
var availablePoint = null;//用户可用积分
var insuredInfoTemp = {};
var selfRelationFlag = app.globalData.selfRelationFlag//是否只支持本人购买

//产品详情信息
var productDetailInfo = null;
var customerInfo = "";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    //banner图片数据
    bannerInfo: {},

    //产品优势
    productAdvantageInfo: {},
    //产品优势详细信息，默认没有
    productAdvantageInfoDetail: false,

    //保障计划
    safeguardPlansInfo:{},
    //保障计划tab是否展示，默认不展示
    safeguardPlansInfoShow: false,
    //保障详情
    planDesc:[],
    //保障详情详细信息，默认没有
    safeguardPlansDetailShow: false,
    //当前选择产品编码
    currentProductCode: "",

    //是否展示份数，默认不展示
    multShow: false,
    //最大份数
    maxMult: 1,
    //当前份数
    mult: 1,
    //份数是否可更改，默认可修改
    multDisabled: false,
    //保险期间是否展示，默认不展示
    insurePeriodShow: false,
    //保障期间范围数据
    insurePeriod: [],
    //保障期间是否可选，默认可选
    insurePeriodDisabled: false,
    //选中的保险期间index
    insurePeriodIndex: 0,
    //保障期间默认展示
    insurePeriodDefault: "",
    
    //交费方式是否显示
    chargeTypeShow: false,
    //交费方式文本
    chargeTypeLabel: "",

    //缴费期间是否显示，默认不展示
    chargePeriodShow: false,
    //缴费期间数据
    chargePeriod: [],
    //缴费期间显示初始化
    chargePeriodDefault: "",
    //缴费期间是否可选，默认可选
    chargePeriodDisabled: false,
    //选中的交费期间index
    chargePeriodIndex: 0,

    //生效日期类型
    // cvalidDateType: "",
    //默认选中的生效日期
    // cvalidateDefault: "",
    //生效日期是否可选，默认可选
    cvalidateDisabled: false,

    //销售状态 
    saleStatus: false,
    //性别是否展示，默认不展示
    sexShow: false,
    //性别数据
    sexSelect: ["男","女"], 
    //是否可变更性别，默认可选
    sexDisable: false,
    //性别选择index
    sexIndex: 0,

    //被保人出生日期是否展示，默认不展示
    birthdayShow: false,
    //被保人出生日期是否可选，默认可选
    birthdayDisabled: false,
    //被保人生日出生日期默认选择值
    birthdayDefault: "",

    //阅读勾选
      checked: false,

    //华瑞账户登录状态
    isLogin:false,
    hrAccountLogin: false,
    //获取短息验证码
    getCodeNum:"获取验证码", 
    //是否已经发送过手机验证码
    isSend: true, 
    grayactive: false,
    buttonDisable: false, //控制短信验证码点击发送一次之后，1分钟之内不可再点击
    show: false, //是否显示图形验证码
    encryptedData: '',
    iv: '',
    graphCode: '',//图形验证码
    graphUrl: '',//图形验证码URL
    graphId: '',//图形验证码ID
    mobileSub: '',//短信验证码
    smsId: '',//短信验证码ID
    form: { //存放要验证的手机号和短信验证码
      tel: "",
      smsInfo: "",
    }, 
    //条款弹层 
    clauseShow: true,
    //遮罩层
    ModelShow:true,
    //保费
    price: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  
  onLoad: function (options) {
    this.setData({
      loadingModelShow: false,
      loadingHidden: false,
    }) 
    var that = this;
    console.log(options);
    orderInfo.itemCode = options.itemCode;
    //检测快捷登录
    pageUtil.checkLogin().then((data) => {
      console.log(data);
      console.log(data.isLogin);
      if (data.isLogin) {
        this.setData({
          isLogin:true,
          userPhoneLoginShow:false,
          imgCodeShow:false
        })
      }else {
        this.setData({
          isLogin:false,
          userPhoneLoginShow: true,
          UserPhoneValueShow:true
        })

      }   
    //请求产品数据
    hrp.productInfo({
      itemCode: options.itemCode
    }).then((data) => {
      console.log(data);
      productDetailInfo = data;

      //动态获取头部标题title
      wx.setNavigationBarTitle({ title: productDetailInfo.productName });

      //存储保单信息
      wx.setStorageSync('insureInfoDetail', data.insureInfo);

      //存储用户积分信息
      productDetailInfo.pointsInfo = data.pointsInfo;
      wx.setStorageSync('pointsInfo', data.pointsInfo )
      // wx.setStorage({
      //   key: 'pointsInfo',
      //   data: data.pointsInfo,
      // })


      //初始化banner信息
      this.initBannerInfo();

      //初始化产品优势渲染
      this.initProductAdvantageInfo();

      //初始化销售状态
      this.initSaleStatus();

      //初始化保障计划标签
      this.initPlanTab();

      //初始化份数渲染
      this.initMult();

      //初始化保障期间渲染
      this.initInsurePeroid();

      //初始化交费方式渲染
      this.initChargeType();

      //初始化缴费期间渲染
      this.initChargePeroid();

      //初始化生效日期渲染
      this.initCvalidate();

      //初始化被保人性别渲染
      this.initSex();

      //初始化被保人出生日期
      this.initBirthday();

      //初始化阅读勾选
      this.initReadTickInfo();

      //初始化积分抵扣
      this.initPointsDeduction();
      
      //重置保障计划
      // this.calInsurePlan();
      this.setData({
        loadingModelShow: true,
        loadingHidden: true
      }) 
    })
  })
  },
  /**
 * 生命周期函数--监听页面显示
 */
  onShow: function () {
    // 判断登录状态
    // var that = this;
    pageUtil.checkLogin().then((data) => {
      console.log(data.isLogin);
      if (data.isLogin) {
        this.setData({
          isLogin: data.isLogin,
          orderBtnState: false,
          loginSelected: false
        })
        console.log(this.data.orderBtnState)
      } else {
        this.setData({
          orderBtnState: true,
          loginSelected: true
          // BtnState:true
        })
      }
    })
  },
  //初始化banner图渲染
  initBannerInfo: function (){
    console.log(productDetailInfo);
    this.setData({
      bannerInfo: {
          'productName': productDetailInfo.productName,
          "productImageUrl": productDetailInfo.bannerInfo.productImageUrl,
          'organizationName': productDetailInfo.bannerInfo.organizationName,
          'salesMult': productDetailInfo.bannerInfo.salesMult
        }
    })
  },

  //初始化产品优势渲染
  initProductAdvantageInfo: function (){

    // productDetailInfo.productAdvantageInfo= this.convertHtmlToT(productDetailInfo.productAdvantageInfo.displayWxa);
    productDetailInfo.productAdvantageInfo = this.convertHtmlToT(productDetailInfo.productAdvantageInfo.displayWxa);
    console.log(productDetailInfo.productAdvantageInfo);
    productDetailInfo.productAdvantageInfo.replace(/<\/div>/ig, '\r\n');
    var str = productDetailInfo.productAdvantageInfo;
    console.log(str);
    var m = str.split("。");
    console.log(m);
    var detailArr = [];
    for (var i = 0; i < m.length; i++) {
      var obj = {};
      obj.text = m[i];
      detailArr.push(obj);
    }
    console.log(detailArr)
    this.setData({
      productAdvantageInfo: detailArr
    })

    //查看更多特色链接
    if (productDetailInfo.productAdvantageInfo.detailCode){
      this.setData({
        productAdvantageInfoDetail: true
      })
    }
  },

  convertHtmlToT:function (inputText) {
    var returnText = "" + inputText;
    returnText = returnText.replace(/<\/div>/ig, '<\viev>');
    returnText = returnText.replace(/<\/li>/ig, '<\/text>');
    returnText = returnText.replace(/<li>/ig, '<text>');
    returnText = returnText.replace(/<\/ul>/ig, '<\/text>');
    
    returnText = returnText.replace(/<br\s*[\/]?>/gi, "\r\n");

   
    returnText = returnText.replace(/<p.*?>/gi, "\r\n");
    returnText = returnText.replace(/<a.*href="(.*?)".*>(.*?)<\/a>/gi, " $2 ($1)");

    
    returnText = returnText.replace(/<script.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/script>/gi, "");
    returnText = returnText.replace(/<style.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/style>/gi, "");
   
    returnText = returnText.replace(/<(?:.|\s)*?>/g, "");

   
    returnText = returnText.replace(/(?:(?:\r\n|\r|\n)\s*){2,}/gim, "\r\n\r\n");

    
    returnText = returnText.replace(/ +(?= )/g, '');
    
    returnText = returnText.replace(/ /gi, " ");
    returnText = returnText.replace(/&/gi, "&");
    returnText = returnText.replace(/"/gi, '"');
    returnText = returnText.replace(/</gi, '<');
    returnText = returnText.replace(/>/gi, '>');
    returnText = returnText.replace(/'查看更多特色'\s/, "");
    return returnText;
  },

  //初始化销售状态
  initSaleStatus: function () {
    //已售罄
    if (productDetailInfo.insureInfo.isSale == "0") {
      this.setData({
        saleStatus:"已售罄",
        saleStatusBgColor:"grayColor"
      })
    }else if(productDetailInfo.insureInfo.isSale == "1"){
      this.checkStockNum(0);
    }
  },

  //初始化保障计划标签
  initPlanTab: function (){
    this.setData({
      safeguardPlansInfo: productDetailInfo.safeguardPlansInfo
    });

    //有多个保障计划，展示TAB
    if (productDetailInfo.safeguardPlansInfo.length > 1) {
      this.setData({
        safeguardPlansInfoShow: true,
      })
    }

    //有保障计划，默认使用第一个保障计划的保障详情描述
    if (productDetailInfo.safeguardPlansInfo.length >= 1) {
      //保障详情多行多列
      this.setData({
        planDesc: productDetailInfo.safeguardPlansInfo[0].planDesc
      })
      orderInfo.productCode = productDetailInfo.safeguardPlansInfo[0].productCode;
      orderInfo.productName = productDetailInfo.safeguardPlansInfo[0].productName;
      if (orderInfo.productCode == "" || orderInfo.productCode==undefined){
        orderInfo.productCode = productDetailInfo.productCode;
      }
      if (orderInfo.productName == "" || orderInfo.productName == undefined) {
        orderInfo.productName = productDetailInfo.productName;
      }
      //查看保障详情链接
      if (productDetailInfo.safeguardPlansInfo[0].planDesc) {
        this.setData({
          safeguardPlansDetailShow: true,
          termsOfInformUrl: orderInfo.itemCode
        })
      }

      //默认保障计划下标为0
      buyInfo.planIndex = 0;
    }

    //从缓存中获取已选择的TAB
     //orderInfo.productCode = "2257"; //为了测试
    if (orderInfo.productCode) {
      console.log("当前已选择产品： " + orderInfo.productCode);
      for (var i = 0; i < productDetailInfo.safeguardPlansInfo.length; i++) {
        if (productDetailInfo.safeguardPlansInfo[i].productCode == orderInfo.productCode) {
          //将已选择的产品赋值给页面
          this.setData({
            planDesc: productDetailInfo.safeguardPlansInfo[i].planDesc,
            currentProductCode: productDetailInfo.safeguardPlansInfo[i].productCode
          })

          //查看保障详情链接
          if (productDetailInfo.safeguardPlansInfo[i].planDesc) {
            this.setData({
              safeguardPlansDetailShow: true,
              termsOfInformUrl: orderInfo.itemCode
            })

          }

          //重置当前计划对应生效日期
          this.changeCvalidate(i);

          //保障计划下标为i
          buyInfo.planIndex = i;
        }else{//如果沒有匹配到則选择默认第一个
          this.setData({
            currentProductCode: productDetailInfo.productCode
          })
          orderInfo.productCode = productDetailInfo.productCode;
          //有多个保障计划，默认选中第一个TAB
          if (productDetailInfo.safeguardPlansInfo.length >= 1) {
            //判断是否有产品编码
            if (productDetailInfo.safeguardPlansInfo[0].productCode) {
              this.setData({
                currentProductCode: productDetailInfo.safeguardPlansInfo[0].productCode
              })
              orderInfo.productCode = productDetailInfo.safeguardPlansInfo[0].productCode;
              orderInfo.productName = productDetailInfo.safeguardPlansInfo[0].planName;
            }
          }

          //重置当前计划对应生效日期
          this.changeCvalidate(0);

          //默认保障计划下标为0
          buyInfo.planIndex = 0;
        }
      }
    }else{
      //缓存中没有已选择的TAB
      //默认使用外面的产品编码
      this.setData({
        currentProductCode: productDetailInfo.productCode
      })
      orderInfo.productCode = productDetailInfo.productCode;
      //有多个保障计划，默认选中第一个TAB
      if (productDetailInfo.safeguardPlansInfo.length >= 1) {
        //判断是否有产品编码
        if (productDetailInfo.safeguardPlansInfo[0].productCode) {
          this.setData({
            currentProductCode: productDetailInfo.safeguardPlansInfo[0].productCode
          })
          orderInfo.productCode = productDetailInfo.safeguardPlansInfo[0].productCode;
          orderInfo.productName = productDetailInfo.safeguardPlansInfo[0].planName;
        }
      }

      //重置当前计划对应生效日期
      this.changeCvalidate(0);

      //默认保障计划下标为0
      buyInfo.planIndex = 0;
    }
  },

  //保障计划TAB切换
  insurePlanChange: function(e){
    console.log("选择保障计划");
    var _datasetId = e.target.dataset.id; //data-id
    var _datasetIndex = e.currentTarget.dataset.index; //data-index
    console.log(_datasetId);
    console.log(_datasetIndex);

    //保障计划产品下标为_datasetIndex
    buyInfo.planIndex = _datasetIndex;

    //切换完保障计划后判断是否还有查询保障详情链接
    if (productDetailInfo.safeguardPlansInfo[_datasetIndex].planDesc) {
      this.setData({
        safeguardPlansDetailShow: true,
        termsOfInformUrl: orderInfo.itemCode
      })
    } else {
      this.setData({
        safeguardPlansDetailShow: false
      })
    }  

    console.log("选择保障计划对应产品编码：" + productDetailInfo.safeguardPlansInfo[_datasetIndex].productCode);
    console.log("选择保障计划名称：" + productDetailInfo.safeguardPlansInfo[_datasetIndex].planName);
    this.setData({
      currentProductCode: productDetailInfo.safeguardPlansInfo[_datasetIndex].productCode,
      planDesc: productDetailInfo.safeguardPlansInfo[_datasetIndex].planDesc
    })

    //在变更时覆盖orderInfo
    orderInfo.productCode = productDetailInfo.safeguardPlansInfo[_datasetIndex].productCode;
    orderInfo.productName = productDetailInfo.safeguardPlansInfo[_datasetIndex].planName;

    //重置当前计划对应生效日期
    this.changeCvalidate(_datasetIndex);

    //TODO 计算保费
    this.calInsurePlan();
    //TODO 校验库存
    this.checkStockNum(_datasetIndex);

  },

  //初始化份数渲染
  initMult: function (){
    //是否展示份数
    console.log("支持最大份数：" + productDetailInfo.insureInfo.maxMult);
    if (productDetailInfo.insureInfo.maxMult > 1) {
      this.setData({
        multShow: true,
        maxMult: productDetailInfo.insureInfo.maxMult,
        multDisabled: false
      })
    }
    orderInfo.mult = 1;
  },

  //录入份数
  multChange: function(e){
    console.log("份数： " + e.detail.value);
    var currMult = e.detail.value;
    var maxMult = productDetailInfo.insureInfo.maxMult;

    // // 如果文本值为空/为非纯数字/文本值小于1,设置为1
    if (currMult == "" || isNaN(currMult) || currMult < 1) {
      currMult = '1';
    } else if (parseInt(currMult) > maxMult) {
      currMult = maxMult;
    }

    this.setData({
      mult: currMult
    })
    //设置到缓存中
    orderInfo.mult = currMult;
    // this.initBirthday();
    //TODO 计算保费
    this.calInsurePlan();
    
    //TODO 校验库存
    this.checkStockNum(buyInfo.planIndex);

  },

  // 份数加
  multAdd:function(){
    var currMult = this.data.mult;
    var maxMult = productDetailInfo.insureInfo.maxMult;

    // // 如果文本值为空/为非纯数字/文本值小于1,设置为1
    if (currMult == "" || isNaN(currMult) || currMult < 1) {
      currMult = '1';
    } else if (parseInt(currMult) >= maxMult) {
      currMult = maxMult;
    }else{
      currMult+=1;
    }

    this.setData({
      mult: currMult
    })
    //设置到缓存中
    orderInfo.mult = currMult;
    // this.initBirthday();
    //TODO 计算保费
    this.calInsurePlan();

    //TODO 校验库存
    this.checkStockNum(buyInfo.planIndex);

  },

  //份数减
  multCut:function(){
    var currMult = this.data.mult;
    // // 如果文本值为空/为非纯数字/文本值小于1,设置为1
    if (currMult == "" || isNaN(currMult) || currMult < 1) {
      currMult = '1';
    } else if (parseInt(currMult) <= 1) {
      currMult = 1;
    } else {
      currMult -= 1;
    }

    this.setData({
      mult: currMult
    })
    //设置到缓存中
    orderInfo.mult = currMult;
    // this.initBirthday();
    //TODO 计算保费
    this.calInsurePlan();

    //TODO 校验库存
    this.checkStockNum(buyInfo.planIndex);
  },


  //初始化保障期间渲染
  initInsurePeroid: function (){
    // 初始化保险期间页面元素
    if (productDetailInfo.insureInfo.insurePeriod && 
          productDetailInfo.insureInfo.insurePeriod.length > 0) {

      //循环，组装label数组
      var arr = [];
      for (var i = 0; i < productDetailInfo.insureInfo.insurePeriod.length; i++) {
        arr.push(productDetailInfo.insureInfo.insurePeriod[i].showContent);
      }
      console.log("打算肯德基");
      console.log(this.data.insurePeriodIndex);
      if (productDetailInfo.insureInfo.insurePeriod.length == 1) {
        //只有一个保障期间时不可选
        this.setData({
          insurePeriodDisabled: true,
          insurePeriodMoreShow:true
        })
      }
      //默认下标为0;
      this.data.insurePeriodIndex = 0;
    }

    //从缓存中读取已选择的保险期间
    if (orderInfo.insurePeriod) {
      for (var i = 0; i < productDetailInfo.insureInfo.insurePeriod.length; i++) {
        if (productDetailInfo.insureInfo.insurePeriod[i].insurePeriod == orderInfo.insurePeriod &&
          productDetailInfo.insureInfo.insurePeriod[i].insurePeriodUnit == orderInfo.insurePeriodType) {
          this.setData({
            insurePeriodDefault: productDetailInfo.insureInfo.insurePeriod[i].showContent
          })
          //默认下标为i;
          this.data.insurePeriodIndex= i;
          this.setData({
            insurePeriodIndex:i
          })
        }
      }
    }else{
      //在初始化时设置orderInfo
      orderInfo.insurePeriod = productDetailInfo.safeguardPlansInfo[0].insurePeriod;
      orderInfo.insurePeriodType = productDetailInfo.safeguardPlansInfo[0].insurePeriodUnit;
    }
    this.setData({
      insurePeriodShow: true,
      insurePeriod: arr,
      insurePeriodDefault: productDetailInfo.insureInfo.insurePeriod[this.data.insurePeriodIndex].showContent
    })
  },

  //变更保障期间
  insurePeriodChange: function(e){
    console.log("选择保障期间index：" + e.detail.value);
    var insurePeriodIndex = e.detail.value;

    this.setData({
      insurePeriodDefault: productDetailInfo.insureInfo.insurePeriod[insurePeriodIndex].showContent,
      insurePeriodIndex: insurePeriodIndex
    })

    //在变更时覆盖orderInfo
    console.log("选择保障期间：" + productDetailInfo.insureInfo.insurePeriod[insurePeriodIndex].insurePeriod);
    console.log("选择保障期间单位：" + productDetailInfo.insureInfo.insurePeriod[insurePeriodIndex].insurePeriodUnit);
    orderInfo.insurePeriod = productDetailInfo.insureInfo.insurePeriod[insurePeriodIndex].insurePeriod;
    orderInfo.insurePeriodType = productDetailInfo.insureInfo.insurePeriod[insurePeriodIndex].insurePeriodUnit;
    this.data.insurePeriodIndex = insurePeriodIndex; //应该没有用了

    //TODO 计算保费
    this.calInsurePlan();
  },

  //初始化交费方式渲染
  initChargeType: function (){
    if (productDetailInfo.insureInfo.chargeType){
      this.setData({
        chargeTypeShow: true,
        chargeTypeLabel: productDetailInfo.insureInfo.chargeType.label
      })
      
      //TODO 往缓存中设置？
    }else{
      this.setData({
        chargeTypeShow:false
      })
    }
  },

  //初始化缴费期间渲染
  initChargePeroid: function (){
    // 初始化保险期间页面元素
    if (productDetailInfo.insureInfo.chargePeriod &&
      productDetailInfo.insureInfo.chargePeriod.length > 0) {
      console.log("缴费期间~")
      //循环，组装label数组
      var arr = [];
      for (var i = 0; i < productDetailInfo.insureInfo.chargePeriod.length; i++) {
        console.log(productDetailInfo.insureInfo.chargePeriod[i].showChargeContent);
        arr.push(productDetailInfo.insureInfo.chargePeriod[i].showChargeContent);
      }

      this.setData({
        chargePeriodShow: true,
        chargePeriod: arr,
        chargePeriodDefault: productDetailInfo.insureInfo.chargePeriod[0].showChargeContent
      })

      if (productDetailInfo.insureInfo.chargePeriod.length == 1) {
        //只有一个交费期间不可选
        this.setData({
          chargePeriodDisabled: true,
          chargePeriodMoreShow:true
        })
        //默认缴费期间下标为0;
        buyInfo.payIntervalIndex = 0;
      } else if (orderInfo.payInterval) { //从缓存中获取已选择交费期间
        for (var i = 0; i < productDetailInfo.insureInfo.chargePeriod.length; i++) {
          if (productDetailInfo.insureInfo.chargePeriod[i] == orderInfo.payInterval &&
            productDetailInfo.insureInfo.chargePeriod[i].ChargePeriodUnit == orderInfo.payIntervalType) {
            this.setData({
              chargePeriodDefault: productDetailInfo.insureInfo.chargePeriod[i].showContent
            })
            //缴费期间下标为i;
            buyInfo.payIntervalIndex = i;
          }
        }
      } else {
        //在初始化时设置orderInfo
        buyInfo.payIntervalIndex = 0;
      }
      orderInfo.payInterval = productDetailInfo.insureInfo.chargePeriod[buyInfo.payIntervalIndex].ChargePeriod;
      orderInfo.payIntervalType = productDetailInfo.insureInfo.chargePeriod[buyInfo.payIntervalIndex].ChargePeriodUnit;
      console.log(orderInfo.payInterval + "缴费期间" + orderInfo.payIntervalType)
    } 
  },

  //变更交费期间
  chargePeriodChange: function (e) {
    console.log("选择交费期间index：" + e.detail.value);
    var chargePeriodIndex = e.detail.value;

    this.setData({
      chargePeriodDefault: productDetailInfo.insureInfo.chargePeriod[chargePeriodIndex].showChargeContent,
      chargePeriodIndex: chargePeriodIndex
    })

    //在变更时覆盖orderInfo
    console.log("选择缴费期间：" + productDetailInfo.insureInfo.chargePeriod[chargePeriodIndex].ChargePeriod);
    console.log("选择缴费期间类型：" + productDetailInfo.insureInfo.chargePeriod[chargePeriodIndex].ChargePeriodUnit);
    orderInfo.payInterval = productDetailInfo.insureInfo.chargePeriod[chargePeriodIndex].ChargePeriod;
    orderInfo.payIntervalType = productDetailInfo.insureInfo.chargePeriod[chargePeriodIndex].ChargePeriodUnit;
    buyInfo.payIntervalIndex = chargePeriodIndex; //应该没有用了

    //TODO 计算保费
    this.calInsurePlan();
  },

  //初始化生效日期渲染
  initCvalidate: function (){
    this.changeCvalidate(0);
  },

  //生效日期变更 
  changeCvalidate: function(index){
    console.log(index);

    //默认为次日生效
    var planCvalidateType = "1";
    //取itemCode的生效日期类型或保障计划生效日期类型
    if (productDetailInfo.safeguardPlansInfo.length > 1 &&
      productDetailInfo.safeguardPlansInfo[index].planCvalidateType != undefined &&
      productDetailInfo.safeguardPlansInfo[index].planCvalidateType != "") {
      //当safeguardPlansInfo长度大于1，且对应Index中的planCvalidateType不为空的时候
      planCvalidateType = productDetailInfo.safeguardPlansInfo[index].planCvalidateType;
    } else {
      //当safeguardPlansInfo长度等于1
      //判断对应Index中的planCvalidateType不为空
      if (productDetailInfo.safeguardPlansInfo[index].planCvalidateType &&
        productDetailInfo.safeguardPlansInfo[index].planCvalidateType != "") {
        planCvalidateType = productDetailInfo.safeguardPlansInfo[index].planCvalidateType;
      } else {
        //使用insureInfo中的cvalidDateType作为生效日期类型
        if (productDetailInfo.insureInfo.cvalidDateType){
          planCvalidateType = productDetailInfo.insureInfo.cvalidDateType;
        }
      }
    }
    buyInfo.cvalidateType = planCvalidateType;
    console.log("选择生效日期类型：" + buyInfo.cvalidateType);

    //次日生效
    if (planCvalidateType == "1") {
      //在当前时间上+1天
      var currDate = new Date(new Date().getTime() + 24 * 3600000);
      var month = currDate.getMonth() < 9 ? ('0' + (currDate.getMonth() + 1)) : (currDate.getMonth() + 1);
      var day = currDate.getDate() < 10 ? ('0' + currDate.getDate()) : currDate.getDate();
      var fomateCurrDate = currDate.getFullYear() + "-" + month + "-" + day;
      console.log(fomateCurrDate +"fomateCurrDate");
      this.setData({
        cvalidateStart: fomateCurrDate,
        cvalidateEnd: fomateCurrDate,
        cvalidateDefault: fomateCurrDate,
        cvalidateDisabled: true
      })
      orderInfo.cvalidDate = fomateCurrDate;
      console.log("选择生效日期：" + orderInfo.cvalidDate);
      //重置当前生效日期对应出生日期范围
      this.changeBirthdayPeriod();
    } else if (planCvalidateType == "3") {
      //当日生效
      //直接使用当天时间
      var currDate = new Date(new Date().getTime());
      var month = currDate.getMonth() < 9 ? ('0' + (currDate.getMonth() + 1)) : (currDate.getMonth() + 1);
      var day = currDate.getDate() < 10 ? ('0' + currDate.getDate()) : currDate.getDate();
      var fomateCurrDate = currDate.getFullYear() + "-" + month + "-" + day;
      this.setData({
        cvalidateStart: fomateCurrDate,
        cvalidateEnd: fomateCurrDate,
        cvalidateDefault: fomateCurrDate,
        cvalidateDisabled: true
      })
      orderInfo.cvalidDate = fomateCurrDate;
      console.log("选择生效日期：" + orderInfo.cvalidDate);
      //重置当前生效日期对应出生日期范围
      this.changeBirthdayPeriod();
    } else {
      //指定日期生效
      if (orderInfo.cvalidDate){
        if (new Date(productDetailInfo.insureInfo.cvalidDateRange.startDay).getTime() > new Date(orderInfo.cvalidDate).getTime() || new Date(orderInfo.cvalidDate).getTime() > new Date(productDetailInfo.insureInfo.cvalidDateRange.endDay).getTime()) {
          //生效日期有值并且不在可选范围内
          console.log("生效日期有值并且不在可选范围内");
          orderInfo.cvalidDate = productDetailInfo.insureInfo.cvalidDateRange.startDay;
          this.setData({
            cvalidateStart: productDetailInfo.insureInfo.cvalidDateRange.startDay,
            cvalidateEnd: productDetailInfo.insureInfo.cvalidDateRange.endDay,
            cvalidateDefault: productDetailInfo.insureInfo.cvalidDateRange.startDay
          })
        }else{
          //生效日期有值并且在可选范围内
          console.log("生效日期有值并且在可选范围内");
          this.setData({
            cvalidateStart: productDetailInfo.insureInfo.cvalidDateRange.startDay,
            cvalidateEnd: productDetailInfo.insureInfo.cvalidDateRange.endDay,
            cvalidateDefault: orderInfo.cvalidDate
          })
        }
      }else{
        console.log("生效日期没有值");
        orderInfo.cvalidDate = productDetailInfo.insureInfo.cvalidDateRange.startDay;
        this.setData({
          cvalidateStart: productDetailInfo.insureInfo.cvalidDateRange.startDay,
          cvalidateEnd: productDetailInfo.insureInfo.cvalidDateRange.endDay,
          cvalidateDefault: productDetailInfo.insureInfo.cvalidDateRange.startDay
        })
      }

      //重置当前生效日期对应出生日期范围
      this.changeBirthdayPeriod();
    }
  },

  //生效日期选择
  cvalidateChange: function (e) {
    console.log("选择生效日期： " + e.detail.value);
    this.setData({
      cvalidateDefault: e.detail.value
    })
    orderInfo.cvalidDate = e.detail.value;
    //重置当前生效日期对应出生日期范围
    this.changeBirthdayPeriod();
  },

  //初始化被保人性别渲染
  initSex:function(){
   console.log("性别渲染");
    if (productDetailInfo.insureInfo.sex != "0") {
      this.setData({
        sexShow: true,
      })

      if (!this.data.isLogin) { 
        console.log("未登录状态,默认先设置为1-男");
        buyInfo.sex = "1";
        this.setData({
          sex: "男"
        })
      }else{
        console.log("已登录状态");
        if (productDetailInfo.insureInfo.insuredType == "1") { 
          console.log("仅支持本人购买");
          insuredInfo.relationToAppnt = "00";
          buyInfo.relationToAppntLabel = "本人";
          insuredInfo.bnfLegalFlag = "1";

          //判断用户信息中性别是否有值
          var sex = null;
          //若customerInfo.sex就用
          console.log("customerInfo.sex: " + customerInfo.sex);
          if (customerInfo.sex != "" && customerInfo.sex != "0") {
            sex = customerInfo.sex;
          } else if (customerInfo.idNoSex != "" && customerInfo.idNoSex != "0") {
            //若customerInfo.idNoSex就用
            sex = customerInfo.sex;
          } else if (buyInfo.sex) {
          //若之前有选择过性别，就用之前选择的
            sex = buyInfo.sex;
          } else if (sex == null || sex == "") {
            console.log("都没有，默认设置为1-男，且可以变更");
            sex = "1";
            //性别可以选
            this.setData({
              sex: "男",
            })
          }  //如果都没有，默认设置为1-男，且可以变更；否则不能变更
            console.log("有，且不可以变更");
            //将1-男2-女转变为0-男1-女
            var sexLabel = ["男", "女"] ;
            if (sex == "2") {
              console.log("women女的！！！")
              sexLabel = ["女", "男"];
            }
            console.log(sexLabel);
            //性别不能选
            this.setData({
              sexSelect: sexLabel,
              sexDisable: true,
              sexMoreShow:true
            })
          
          buyInfo.sex = sex;     
        }else{
          console.log("否，不仅支持本人购买，还支持其他关系人购买");
          var haveSelf = false;
          for (var i = 0; i < productDetailInfo.insureInfo.relationToAppnt.length; i++) {
            if (productDetailInfo.insureInfo.relationToAppnt[i].value == "00") {
              haveSelf = true;
              break;
              //如果被保人与投保人关系中包含本人，则判断如果登录用户信息中性别有值，则使用登录用户信息中性别初始化页面
            }
          }

          if (!haveSelf) {
            console.log("被保人与投保人关系中不包含本人");
            //默认先设置为1-男
            buyInfo.sex = "1";
            this.setData({
              sexSelect: ["男", "女"]
            })
          } else {
            console.log("被保人与投保人关系中包含本人");
            //判断用户信息中性别是否有值
            var sex = null;
            //若customerInfo.sex就用
            console.log("customerInfo.sex: " + customerInfo.sex);
            if (customerInfo.sex != "" && customerInfo.sex != "0") {
              sex = customerInfo.sex;
            } else if (customerInfo.idNoSex != "" && customerInfo.idNoSex != "0") {
              //若customerInfo.idNoSex就用
              console.log("customerInfo.idNoSex: " + customerInfo.idNoSex);
              sex = customerInfo.idNoSex;
            } else if (buyInfo.sex) {
              //若之前有选择过性别，就用之前选择的
              console.log("buyInfo.sex: " + buyInfo.sex);
              sex = buyInfo.sex;
            } else if (sex == null || sex == "") {
              console.log("都没有，默认设置为1-男，且可以变更");
              sex = "1";
            
              //性别可以选
              this.setData({
                sexSelect: ["男", "女"],
              })
            } 
            //如果都没有，默认设置为1-男，且可以变更
              console.log("有，且不可以变更");
              //将1-男2-女转变为0-男1-女
              var sexLabel = ["男", "女"];
              if (sex == "2") {
                console.log("女的999");
                sexLabel = ["女", "男"];
              }
              //性别可以选
              this.setData({
                sexSelect: sexLabel,
              })
            }
          buyInfo.sex = sex;
        }
      }
    }
  },

  //变更被保人性别
  sexChange: function(e){
    console.log("选择性别: " + e.detail.value)
    this.setData({
      sexIndex: e.detail.value
    })

    //将0-男1-女转变为1-男2-女
    var sex = "1"; // 1-男
    if (e.detail.value == "1") { //1-女
      sex = "2"; //2-女
    }

    //变更时覆盖buyInfo
    buyInfo.sex = sex;
    console.log(buyInfo.sex);

    //TODO 计算保费
    this.calInsurePlan();
  },

  //初始化被保人出生日期
  initBirthday:function(){

    //判断是否展示出生日期录入
    if (productDetailInfo.insureInfo.insuredAgePeriod) {
      this.setData({
        birthdayShow: true
      })
    }
    if (this.data.isLogin) {
      customer.getCustomInfo({}).then((data) => {
        customerInfo = data;
        //获取用户积分信息
        console.log(customerInfo);
        customer.pointsValue({
          "isUserId": "1",
          "isAuthState": "1"
        }).then((data) => {
          availablePoint = data.availablePoint;
          console.log(availablePoint + "用户积分");
          console.log(data);
          this.initPointsDeduction();
          //重置保障计划
          this.setData({
            userPhoneLoginShow: false,
            imgCodeShow: false
          })
          // this.calInsurePlan();
          console.log("已登录状态");
          //判断insuredType是否仅支持本人投保
          if (productDetailInfo.insureInfo.insuredType == "1") {
            console.log("仅支持本人购买");
            //是，判断用户信息中出生日期是否有值，如果有值则使用用户信息中出生日期渲染页面
            var birthdayDefault = null;
            if (customerInfo.birthday != "") {
              console.log("customerInfo.birthday"+1);
              birthdayDefault = customerInfo.birthday;
            }else if (customerInfo.idNoBirthday != "") {
              console.log("customerInfo.birthday" + 2);
              birthdayDefault = customerInfo.idNoBirthday;
            }
            else if (buyInfo.birthday != "") {
              console.log("customerInfo.birthday" + 3);
              birthdayDefault = buyInfo.birthday;
            }
            if (birthdayDefault == null) {
              //取中间日期
              var time = new Date(buyInfo.insuredEndDate).getTime() - new Date(buyInfo.insuredBeginDate).getTime();
              var days = Math.floor(time / (24 * 3600 * 1000)) / 2;
              var midDate = new Date(new Date(buyInfo.insuredBeginDate).setDate(new Date(buyInfo.insuredBeginDate).getDate() + days));
              var month = midDate.getMonth() < 9 ? ('0' + (midDate.getMonth() + 1)) : (midDate.getMonth() + 1);
              var day = midDate.getDate() < 10 ? ('0' + midDate.getDate()) : midDate.getDate();
              birthdayDefault = midDate.getFullYear() + "-" + month + "-" + day;
            }
            this.setData({
              birthdayDefault: birthdayDefault,
              birthdayDisabled: true
            });
            buyInfo.birthday = birthdayDefault;
          } else if (productDetailInfo.insureInfo.insuredType == "2") {
            console.log("否，不仅支持本人购买，还支持其他关系人购买");
            //循环relationToAppnt
            //如果被保人与投保人关系中包含本人，则判断如果登录用户信息中出生日期有值，则使用登录用户信息中出生日期初始化页面
            var haveSelf = false;
            for (var i = 0; i < productDetailInfo.insureInfo.relationToAppnt.length; i++) {
              if (productDetailInfo.insureInfo.relationToAppnt[i].value == "00") {
                haveSelf = true;
                break;
              }
            }

            if (!haveSelf) {
              console.log("被保人与投保人关系中不包含本人");
              //取中间日期
              var time = new Date(buyInfo.insuredEndDate).getTime() - new Date(buyInfo.insuredBeginDate).getTime();
              var days = Math.floor(time / (24 * 3600 * 1000)) / 2;
              var midDate = new Date(new Date(buyInfo.insuredBeginDate).setDate(new Date(buyInfo.insuredBeginDate).getDate() + days));
              var month = midDate.getMonth() < 9 ? ('0' + (midDate.getMonth() + 1)) : (midDate.getMonth() + 1);
              var day = midDate.getDate() < 10 ? ('0' + midDate.getDate()) : midDate.getDate();
              var birthdayDefault = midDate.getFullYear() + "-" + month + "-" + day;

              this.setData({
                birthdayDefault: birthdayDefault
              });
              buyInfo.birthday = birthdayDefault;
            } else {
              console.log("被保人与投保人关系中包含本人");
              console.log(customerInfo.birthday);
              console.log(customerInfo.idNoBirthday);
              console.log(buyInfo.birthday);
              var birthdayDefault = null;
              if (customerInfo.birthday != "") {
                console.log(1)
                birthdayDefault = customerInfo.birthday;
              }else if (customerInfo.idNoBirthday != "") {
                console.log(2)
                birthdayDefault = customerInfo.idNoBirthday;
              } 
              else if (buyInfo.birthday != "" && buyInfo.birthday) {
                console.log(3)
                birthdayDefault = buyInfo.birthday;
              } else if (birthdayDefault == null || buyInfo.birthday == "" || buyInfo.birthday==undefined) {
                console.log(buyInfo.insuredEndDate);
                console.log(buyInfo.insuredBeginDate);
                //取中间日期
                var time = new Date(buyInfo.insuredEndDate).getTime() - new Date(buyInfo.insuredBeginDate).getTime();
                var days = Math.floor(time / (24 * 3600 * 1000)) / 2;
                var midDate = new Date(new Date(buyInfo.insuredBeginDate).setDate(new Date(buyInfo.insuredBeginDate).getDate() + days));
                var month = midDate.getMonth() < 9 ? ('0' + (midDate.getMonth() + 1)) : (midDate.getMonth() + 1);
                var day = midDate.getDate() < 10 ? ('0' + midDate.getDate()) : midDate.getDate();
                birthdayDefault = midDate.getFullYear() + "-" + month + "-" + day;
                console.log(birthdayDefault)
              }
              console.log(birthdayDefault);
              this.setData({
                birthdayDefault: birthdayDefault
              });
              buyInfo.birthday = birthdayDefault;
            }
          }
          this.initSex();
          this.initPointsDeduction();
          this.calInsurePlan();
        })
      })
     
    } else{
      console.log("未登录状态,默认先设置为30岁");
      if (buyInfo.birthday && buyInfo.birthday!=' '){
        birthdayDefault: birthdayDefault = buyInfo.birthday       
      }else{
        var birthday = new Date(new Date().setYear(new Date().getYear() - 30))
        var month = birthday.getMonth() < 9 ? ('0' + (birthday.getMonth() + 1)) : (birthday.getMonth() + 1);
        var day = birthday.getDate() < 10 ? ('0' + birthday.getDate()) : birthday.getDate();
        var birthdayDefault = birthday.getFullYear() + "-" + month + "-" + day;
      }
      this.setData({
        birthdayDefault: birthdayDefault
      });
      buyInfo.birthday = birthdayDefault
      console.log(birthdayDefault);
    }
    console.log("测试666"+birthdayDefault);
    // buyInfo.birthday = birthdayDefault;
    console.log(buyInfo.birthday);
    this.calInsurePlan();
  },

  //调整被保人出生日期范围
  changeBirthdayPeriod: function(){
    console.log("调整被保人出生日期范围");
    var currDate = new Date(new Date().getTime());
    var month = currDate.getMonth() < 9 ? ('0' + (currDate.getMonth() + 1)) : (currDate.getMonth() + 1);
    var day = currDate.getDate() < 10 ? ('0' + currDate.getDate()) : currDate.getDate();
    var fomateCurrDate = currDate.getFullYear() + "-" + month + "-" + day;
    var startDay = "";
    var endDay = fomateCurrDate;
    console.log("endDay: " + endDay);

    console.log(productDetailInfo.insureInfo.insuredAgePeriod);
    if (productDetailInfo.insureInfo.insuredAgePeriod) {
      console.log("有被保人年龄范围");
      //投保起始年龄
      var beginParm_birth = productDetailInfo.insureInfo.insuredAgePeriod.beginBirth;
      // 投保结束年龄
      var endParm_birth = productDetailInfo.insureInfo.insuredAgePeriod.endBirth;
      //投保起始年龄单位
      var beginParmUnit_birth = productDetailInfo.insureInfo.insuredAgePeriod.beginBirthUnit;
      //投保结束年龄单位
      var endParmUnit_birth = productDetailInfo.insureInfo.insuredAgePeriod.endBirthUnit;
       var originDate = orderInfo.cvalidDate; //根据哪天开始算
      
      if (buyInfo.cvalidateType == "3"){
        originDate = new Date();
      }
      console.log("originDate: " + originDate);

      // 设置最小年龄限制
      var beginDate = new Date();
      if ("D" == beginParmUnit_birth) {
        beginDate = new Date(originDate).setDate(new Date(originDate).getDate() - parseInt(beginParm_birth));
      } else if ("Y" == beginParmUnit_birth) {
        beginDate = new Date(originDate).setFullYear((new Date(originDate).getFullYear() - parseInt(beginParm_birth))); 
      }
      beginDate = new Date(beginDate);
      console.log("beginDate: " + beginDate);
      // 设置最大年龄限制
      var endDate = new Date();
      if ("D" == endParmUnit_birth) {
        endDate = new Date(originDate).setDate(new Date(originDate).getDate() - parseInt(endParm_birth) - parseInt('1'));
      } else if ("Y" == endParmUnit_birth) {
        endDate = new Date(originDate).setFullYear((new Date(originDate).getFullYear() - parseInt(endParm_birth) - parseInt ('1'))); 
        console.log(endDate);
         endDate = new Date(endDate).setDate(new Date(endDate).getDate());
        console.log(endDate);
      }
      endDate = new Date(endDate);
      console.log("endDate: " + endDate);

      //最小年龄设为生日结束时间
      var emonth = beginDate.getMonth() < 9 ? ('0' + (beginDate.getMonth() + 1)) : (beginDate.getMonth() + 1);
      var eday = beginDate.getDate() < 10 ? ('0' + beginDate.getDate()) : beginDate.getDate();
      endDay = beginDate.getFullYear() + "-" + emonth + "-" + eday;
      
      //最大年龄设为生日开始时间
      var smonth = endDate.getMonth() < 9 ? ('0' + (endDate.getMonth() + 1)) : (endDate.getMonth() + 1);
      var sday = endDate.getDate() < 10 ? ('0' + endDate.getDate()) : endDate.getDate();
      startDay = endDate.getFullYear() + "-" + smonth + "-" + sday;
      console.log(startDay);
    }else{
      console.log("没有被保人年龄范围");
      var endDate = new Date(new Date().setYear(new Date().getYear() - 65))
      var month = endDate.getMonth() < 9 ? ('0' + (endDate.getMonth() + 1)) : (endDate.getMonth() + 1);
      var day = endDate.getDate() < 10 ? ('0' + endDate.getDate()) : endDate.getDate();
      startDay = endDate.getFullYear() + "-" + month + "-" + day;
    }

    console.log("endDay: " + endDay);
    console.log("startDay: " + startDay);
    buyInfo.insuredBeginDate = startDay;
    buyInfo.insuredEndDate = endDay;
    this.setData({
      birthdayStart: startDay,
      birthdayEnd: endDay,
    })
  },

  //被保人生日选择
  changeBirthday: function (e) {
    console.log("被保人出生日期变更： " + e.detail.value);
    this.setData({
      birthdayDefault: e.detail.value
    })
    buyInfo.birthday = e.detail.value;

    //TODO 计算保费
    this.calInsurePlan();
  },

  //初始化积分抵扣渲染
  initPointsDeduction:function(){
    var that = this;
    console.log(availablePoint+"初始化积分");
    var rate = parseFloat ( parseInt(productDetailInfo.pointsInfo.rate)/100);
    console.log(rate);
    var maxPrice = productDetailInfo.pointsInfo.maxPrice;
    //积分抵扣信息
    buyInfo.availablePoint = availablePoint;
    buyInfo.minPoint = productDetailInfo.pointsInfo.minPoint;
    buyInfo.minPrice = productDetailInfo.pointsInfo.minPrice;
    buyInfo.rate = productDetailInfo.pointsInfo.rate;
    buyInfo.maxPrice = productDetailInfo.pointsInfo.maxPrice;
  
    var isPoint = false;
    //如果pointsInfo中的isPoint=1并且可抵扣的最大金额和比例不同时为空，
    // 则展示积分抵扣这一行，isPoint = true
    console.log(buyInfo.rate);
    console.log(buyInfo.maxPrice);
    if (productDetailInfo.pointsInfo.isPoint == "1") {
      if (orderInfo.exchangeIntegral) {
        if ((buyInfo.rate != '' && buyInfo.rate != null) && (buyInfo.maxPrice != '' && buyInfo.maxPrice != null)) {
          console.log("测试积分抵扣666")
          isPoint = true;
          that.setData({
            pointsDeductionShow: true,
            switchOpen: false,
          })
          that.calPoint();
        }
      } else {
        that.setData({
          pointsDeductionShow: true,
          pointChecked: false
        })
      }  
    } else {//积分抵扣隐藏
      that.setData({
        pointsDeductionShow: false
      })
    }
    if (isPoint) {
      if (buyInfo.isOpen){
        var payMoney = orderInfo.orderAmount - buyInfo.exchangeMoney;
        that.setData({
          price: parseFloat(buyInfo.payMoney).toFixed(2)
        });
        buyInfo.isOpen = true;
      }
    } else {
      buyInfo.isOpen = false;
    } 
  },

  //积分抵扣开关
  switch1Change: function (e) {
    console.log('switch1 发生 change 事件，携带值为', e.detail.value);
    if (!this.data.isLogin) {
      console.log("没有登录呀")
      this.setData({
        switchOpen: true,
        pointChecked: false,
      })
    } else {
      this.setData({
        switchOpen: false
      })
      console.log(orderInfo.orderAmount + "++" + buyInfo.minPrice);
      if (orderInfo.orderAmount == '-1' || parseInt(orderInfo.orderAmount) < parseInt(buyInfo.minPrice)) {
        this.errTip('保费满' + buyInfo.minPrice + '元可用');
        this.setData({
          pointChecked: false
        })
      } else {
        if (e.detail.value) {
          //积分计算
           buyInfo.isOpen = e.detail.value;
          console.log("积分计算");
          this.calPoint();
          if (this.data.pointChecked){
            // orderInfo.exchangeIntegral = parseFloat(buyInfo.exchangeMoney * 100).toFixed(0);
            console.log(buyInfo.exchangeMoney +"buyInfo.exchangeMoney ");
            console.log(orderInfo.exchangeIntegral + "  orderInfo.exchangeIntegral ");
          }
        } else {
          orderInfo.exchangeIntegral = "";
          this.setData({
            price: parseFloat(orderInfo.orderAmount).toFixed(2),
            pointText: ""
          })
        }
      }
    }
  },

  //积分抵扣计算方法
  calPoint:function () {
    var availablePoint = buyInfo.availablePoint;

    var minPoint = buyInfo.minPoint;
    var minPrice = buyInfo.minPrice;
    var rate = buyInfo.rate;
    var maxPrice = buyInfo.maxPrice;
            
    var exchangeIntegral;
    var exchangeMoney;
    var payMoney;
    var orderAmount = orderInfo.orderAmount;
    if(orderAmount == '-1') {
      this.setData({
        switchOpen: true,
      })
    }else if(orderAmount != '') {
      if (orderAmount < minPrice) {
        this.setData({
          pointChecked:false,
          switchOpen:true,
          pointText: '保费满' + minPrice + '元可用'
        })
        buyInfo.payMoney = orderInfo.orderAmount;
        return;
      }
      //计算最高可抵扣金额exchangeMoney，兑换可用积分exchangeIntegral
      var point = availablePoint > minPoint ? availablePoint : minPoint;
      //var availablePrice = parseInt(point/100);
      var availablePrice = point / 100;

      var ratePrice = null;
      if (rate != '' && rate != null) {
      
        ratePrice = parseFloat( rate * orderAmount).toFixed(2);
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

      console.log(exchangeIntegral, availablePrice, ratePrice, maxPrice, rate);

      if (availablePoint < minPoint) {
        this.setData({
          pointChecked: false,
          switchOpen: true,
          pointText: '共' + availablePoint + '积分，满' + minPoint + '积分可用'
        })
        buyInfo.payMoney = orderInfo.orderAmount;
      } else {
        //解除不满足条件的影响
        var availablePointStr = availablePoint >= 100000 ? (availablePoint / 10000) + '万' : availablePoint;
        this.setData({
          switchOpen: false,
        })
        if (!this.data.pointChecked) {//开关打开
            var payMoney = orderInfo.orderAmount - exchangeMoney;
            this.setData({
              price: parseFloat(payMoney).toFixed(2),
              pointText: '共' + availablePointStr + '积分,可用' + exchangeIntegral + '积分,抵' + parseFloat(exchangeMoney).toFixed(2) + '元'
            })
            buyInfo.payMoney = payMoney;
            buyInfo.isOpen = true;
          } else {
            buyInfo.payMoney = orderInfo.orderAmount;
            buyInfo.isOpen = false;
            console.log('满足条件点击关，orderAmount' + orderAmount);
            this.setData({
              price: parseFloat(orderInfo.orderAmount).toFixed(2),
              pointText: '共' + availablePointStr + '积分,可用' + exchangeIntegral + '积分,抵' + parseFloat(exchangeMoney).toFixed(2) + '元'
            })
          }
    
        payMoney = orderAmount - exchangeMoney;
        buyInfo.payMoney = payMoney;
        orderInfo.exchangeIntegral = parseFloat((orderInfo.orderAmount - buyInfo.payMoney) * 100)
        console.log('满足条件初始化，payMoney' + payMoney + 'orderAmount' + orderAmount + "exchangeMoney" + exchangeMoney);
        this.setData({
          price: parseFloat(payMoney).toFixed(2),
        })
      }
    }
  },
  //校验库存
  checkStockNum: function(index){
    var planName = productDetailInfo.safeguardPlansInfo[index].planName; //拿到选择的保障计划名称
    var mult = productDetailInfo.safeguardPlansInfo[index].stockNum;//购买份数
    if (productDetailInfo.insureInfo.isSale != "0"){
      if (planName == "") {
        //没配保障计划
        var stockNum = productDetailInfo.safeguardPlansInfo[0].stockNum;
        if (stockNum != null && stockNum != "" && (parseInt(stockNum) < parseInt(mult))) {
          console.log("测试666")
          //TODO 库存不足
          this.setData({
            saleStatus: "已售罄",
            saleStatusBgColor: "grayColor"
          })
        } else {
          //TODO 有剩余库存
          if (orderInfo.orderAmount != 0) {
            this.setData({
              saleStatus: "立即投保",
            })
          } else {
            this.setData({
              saleStatus: "免费领取",
            })
          }
        }
      } else {
        //多个保障计划
        for (var i = 0; i < productDetailInfo.safeguardPlansInfo.length; i++) {
          if (planName == productDetailInfo.safeguardPlansInfo[i].planName) {
            var stockNum = productDetailInfo.safeguardPlansInfo[i].stockNum;
            if (stockNum != null && stockNum != "" && (parseInt(stockNum) < parseInt(mult))) {
              this.setData({
                saleStatus: "已售罄",
                saleStatusBgColor: "grayColor"
              })
            } else {
              if (orderInfo.orderAmount != 0) {
                this.setData({
                  saleStatus: "立即投保"
                })
              } else {
                this.setData({
                  saleStatus: "免费领取"
                })
              }
            }
          }
        }
      }
    }else{
      this.setData({
        saleStatus: "已售罄",
        saleStatusBgColor: "grayColor"
      })
    }
  },

  //重置保障计划
  calInsurePlan: function () {
    console.log("重置保障计划");
    console.log(buyInfo.birthday);
    this.setOrderInfo();
    this.setShowInfo();
    // 年龄
    console.log(buyInfo.birthday);
    var age = this.getAge(buyInfo.birthday);

    //TODO 获取TAB计划名称
    var planName = orderInfo.productName;  

    //TODO 把所有信息console出来
    console.log("计划名称:" + planName + "," + "保障期间：" + orderInfo.insurePeriod + "," + "保障期间单位" + orderInfo.insurePeriodType + "," + "年龄" + age + "," + "性别" + buyInfo.sex + "," + "缴费期间" + orderInfo.payInterval+","+ "缴费期间单位" + orderInfo.payIntervalType)

    if (orderInfo.cvalidDate != "" &&buyInfo.sex != "" &&(buyInfo.birthday != "" |productDetailInfo.insureInfo.insuredAgeRange.length == 0)) {

      if (this.checkInsurdBirth()) {
        console.log("试算保费");
        var price = this.calPrem(planName, orderInfo.insurePeriod, orderInfo.insurePeriodType, age, buyInfo.sex, orderInfo.payInterval, orderInfo.payIntervalType);
        console.log("保费试算：" + price);

        if (price == "") {//如果试算保费为空，则price取当前选中产品的价钱，如果所选产品价钱的为空，则取insureInfo.price;
          price = productDetailInfo.safeguardPlansInfo[buyInfo.planIndex].planMoney;
          if (price == "") {
            price = productDetailInfo.insureInfo.price;
            console.log("保费试算：" + price);
            if (price == "") {//如果试算保费为空，则price取当前选中产品的价钱，如果所选产品价钱的为空，则取insureInfo.price;
              price = productDetailInfo.safeguardPlansInfo[buyInfo.planIndex].planMoney;
              if (price == "") {
                price = productDetailInfo.insureInfo.price;
              }
              price = parseInt(orderInfo.mult) * parseInt(price);
            }
          }
          orderInfo.orderAmount = parseFloat(price).toFixed(2);
        }else if (price == "--"||price==null) {//不能购买
          buyInfo.price = "--";
          buyInfo.orderAmount   = true;
           orderInfo.orderAmount="--";
          console.log("不能够购买");
        }else{
          buyInfo.orderAmount=false;
          price = parseFloat(orderInfo.mult * price).toFixed(2);
          orderInfo.orderAmount = price;
        }
      }else{
        var maxMult = productDetailInfo.insureInfo.maxMult;
        var number = orderInfo.mult;
        if (number > maxMult) {//超过最大购买份数
          number = maxMult;
          orderInfo.mult = number;
  
          this.errTip("超过最大购买份数");
        }
      
        var price = productDetailInfo.safeguardPlansInfo[buyInfo.planIndex].planMoney;
        if (price == "") {
          price = productDetailInfo.insureInfo.price;
        }
        price = price * orderInfo.mult;
        orderInfo.orderAmount = parseFloat(price).toFixed(2); 
      }  
    }else{
      var number = orderInfo.mult;
      var maxMult = productDetailInfo.insureInfo.maxMult;
      if (parseInt(number) > maxMult) {
        number = maxMult;
        //$.alertMessage("超过最大购买份数")
        this.errTip("超过最大购买份数");
      } 
    
      this.setData({
        mult: number
      })
      orderInfo.mult = number;

      var price = productDetailInfo.safeguardPlansInfo[buyInfo.planIndex].planMoney;
      if (price == "") {
        price = productDetailInfo.insureInfo.price;
      }
      price = price * orderInfo.mult;
      orderInfo.orderAmount = parseFloat(price).toFixed(2); 
    }

    if (orderInfo.orderAmount == 0) {
      this.setData({
        SaleStatus: "免费领取",
        price: orderInfo.orderAmount
        
      })
    } else {
      this.setData({
        SaleStatus: "立即投保",
        price: orderInfo.orderAmount
    
      })
    }
    this.setData({
      price: orderInfo.orderAmount
    })
  },

  setOrderInfo: function () {
    // 保险期间
    var insurePeriodIndex = this.data.insurePeriodIndex;
    console.log(insurePeriodIndex+"保险期间下标")
    // 保险期间单位
    if (productDetailInfo.insureInfo.insurePeriod.length > 0) {
      orderInfo.insurePeriod = productDetailInfo.insureInfo.insurePeriod[insurePeriodIndex].insurePeriod;
      orderInfo.insurePeriodType = productDetailInfo.insureInfo.insurePeriod[insurePeriodIndex].insurePeriodUnit;
    }
    console.log(orderInfo)

    // 缴费期间
    var chargePeriodIndex = buyInfo.payIntervalIndex;
    console.log(buyInfo.payIntervalIndex+"缴费期间的克拉斯");

    // 缴费期间单位
    if (productDetailInfo.insureInfo.chargePeriod.length > 0) {
      var payIntervalType = productDetailInfo.insureInfo.chargePeriod[chargePeriodIndex].ChargePeriodUnit
      orderInfo.payInterval = productDetailInfo.insureInfo.chargePeriod[chargePeriodIndex].ChargePeriod;
      orderInfo.payIntervalType = productDetailInfo.insureInfo.chargePeriod[chargePeriodIndex].ChargePeriodUnit;
    } else {
      this.setData({
        chargePeriodDisabled: true
      })
    }
  },

  setShowInfo: function () {
    if (productDetailInfo.insureInfo.insuredType == "1") {
      // 只支持本人投保
      insuredInfo.relationToAppnt = "00";
      buyInfo.relationToAppntLabel = "本人";
      insuredInfo.bnfLegalFlag = "1";
    }
    buyInfo.informContent = productDetailInfo.informContent;
    console.log(buyInfo.informContent);
  },

  //计算年龄
  getAge: function (birthDate) {
    console.log("年龄计算");
    console.log(birthDate);
    if (birthDate == undefined) {
      return "";//返回空
    }else{
      var cvalidate = ""; // yyyy-mm-dd;
      var insuredAgeType = productDetailInfo.insureInfo.insuredAgeType; // 指定日期生效

      if (insuredAgeType == "0") {
        cvalidate = this.data.cvalidateDefault;
      } else {
        // 格式化生效时间
        var currDate = new Date(new Date().getTime());
        var month = currDate.getMonth() < 9 ? ('0' + (currDate.getMonth() + 1)) : (currDate.getMonth() + 1);
        var day = currDate.getDate() < 10 ? ('0' + currDate.getDate()) : currDate.getDate();
        cvalidate = currDate.getFullYear() + "-" + month + "-" + day;
      }
      console.log(cvalidate+"指定日期生效")
      var insuredAgeType = buyInfo.cvalidateType; //TODO 获取生效日期类型
      // var cvalidate = orderInfo.cvalidDate; //TODO 获取生效日期
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
      console.log("周岁年龄：" + returnAge);
      return returnAge;//返回周岁年龄
    } 
  },

  //校验被保人出生日期
  checkInsurdBirth: function () {
    console.log("校验年龄范围")
    var startDay = buyInfo.insuredBeginDate;
    var endDay = buyInfo.insuredEndDate;
    console.log("校验生日计算生日开始时间：" + startDay);
    console.log("校验生日计算生日结束时间：" + endDay);
    console.log("buyInfo.birthday" + buyInfo.birthday);
    if (new Date(endDay).getTime() >= new Date(buyInfo.birthday).getTime() && new Date(buyInfo.birthday).getTime() >= new Date(startDay).getTime()) {
      return true;
    } else {
      console.log("请确认被保险人年龄在可保范围内");
      return false;
    }
  },

  //计算保费
  calPrem: function (planName, insurePeriod, insurePeriodUnit, age, sex, payInterval, payIntervalType) {
    console.log("开始计算保费");
    var that = this
    console.log("计划名：" + planName + "，保险期间：" + insurePeriod + "，保险期间单位：" + insurePeriodUnit + "，年龄：" + age + "，性别：" + sex + "，缴费期间：" + payInterval + "，缴费期间单位：" + payIntervalType);

    // 格式化性别
    if (sex == '1') {
      sex = '男';
    } else if (sex == '2') {
      sex = '女';
    } else if (sex == '0') {
      sex = '不详';
    }

    // 格式化保险期间
    if (insurePeriodUnit == "M") {
      insurePeriod = insurePeriod + "月";
      console.log(insurePeriod)
    } else if (insurePeriodUnit == "D") {
      insurePeriod = insurePeriod + "天";
      console.log(insurePeriod)
    } else if (insurePeriodUnit == "Y") {
      insurePeriod = insurePeriod + "年";
      console.log(insurePeriod)
    } else if (insurePeriodUnit == "A") {
      insurePeriod = insurePeriod + "岁";
      console.log(insurePeriod)
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
      for (var i = 0; i < saleMapper.length; i++) {
        if (planName == undefined || saleMapper[i].protectPlan.replace(/\ +/g, "") == "" || saleMapper[i].protectPlan == planName) {   // 产品编码是计算保费的一个标识  所以不能为空
          if (sex == undefined || saleMapper[i].sex.replace(/\ +/g, "") == "" || saleMapper[i].sex == sex) {
            if (payInterval == undefined || saleMapper[i].chargePeriod.replace(/\ +/g, "") == "" || saleMapper[i].chargePeriod == payInterval) {
              if (insurePeriod == undefined || saleMapper[i].insurePeriod.replace(/\ +/g, "") == "" || saleMapper[i].insurePeriod == insurePeriod) {           
                // value含有key=age  属性，同时这个值不为空时，进行年龄范围的筛选
                if (insurePeriod == saleMapper[i].insurePeriod || saleMapper[i].insurePeriod=="") {
             
                  var k = i;
                  if (saleMapper[k].insuredAge && saleMapper[i].insuredAge != "" && saleMapper[k].insuredAge != "") {
                    var checkMin = "";
                    var checkMax = "";
                    
                    var ageUnit = age.substring(age.length - 1); // 获取用户年龄单位 D/Y
                 
                    var ageVal = age.substring(0, age.length - 1); // 获取用户年龄
                  
                    // var ageMapper = value['insuredAge'];  // 获取配置中的年龄范围
                    var ageMapper = saleMapper[k].insuredAge
                    var ageMapperArry = ageMapper.split("-"); //eg: [60D,17Y]
                   
                    // 18Y的情况
                    if (ageMapperArry.length == 1) {
                      var beginUnit = ageMapperArry[0].toString().substring(ageMapperArry[0].length - 1);  // 获取单位 eg:Y
                      var beginVal = ageMapperArry[0].toString().substring(0, ageMapperArry[0].length - 1);  // 获取单位 eg:60
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
                        if (j == 0) {
                          var beginUnit = ageMapperArry[0].toString().substring(ageMapperArry[0].length - 1);  // 获取单位 eg:Y
                          var beginVal = ageMapperArry[0].toString().substring(0, ageMapperArry[0].length - 1);  // 获取单位 eg:60
                          if (beginUnit == "天") {
                            beginUnit = "D";
                          } else if (beginUnit == "年") {
                            beginUnit = "Y";
                          }

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
                          var endUnit = ageMapperArry[j].toString().substring(ageMapperArry[j].length - 1);  // 获取单位                               
                          var endVal = ageMapperArry[j].toString().substring(0, ageMapperArry[j].length - 1);  // 获取单位  eg: D/Y                                
              
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
                   
                    var mult = orderInfo.mult;
                    console.log(mult)
                    if (parseInt(saleMapper[k].mult) < parseInt(mult)) {
                      that.setData({
                        mult: mult
                      })
                      // isAllow(parseInt(saleMapper[k].mult));
                      if (saleMapper[k].amt == undefined || saleMapper[k].amt == "") {
                          amt = "--";
                        } else {
                          amt = saleMapper[k].amt;
                        }
                    } else if (parseInt(saleMapper[k].mult) > parseInt(mult)) {
                      that.setData({
                        mult: saleMapper[k].mult
                      })

                      if (saleMapper[k].amt == undefined || saleMapper[k].amt == "") {
                        amt = "--";
                      } else {
                        amt = saleMapper[k].amt;
                      }
                    } else {
                      amt = saleMapper[k].amt
                      buyInfo.price = amt;
                    }
                      //isAllow(parseInt(saleMapper[k].mult));   
                  }
                }
              }
            }
          }
        }
      }
      buyInfo.price = amt
      console.log("保费" + amt)
      return amt;
    } else {
        return ""
    }
  },

  //初始化阅读勾选
  initReadTickInfo: function () {
    if (productDetailInfo.product_reading_desc == "") {
      this.setData({
        clauseBoxShow: false
      })
    }else{
      var str = productDetailInfo.product_reading_desc;
      var reg = /([^\+\-\*\/\(\</navigator>]+)$/g;
      var arr =  str.match(reg);
      this.setData({
        tickInfoText:arr,
        tickInfo: productDetailInfo.product_clause
      })
      this.setData({
        clauseBoxShow:true
      })
    }
  },

  //阅读勾选
  checkboxChange: function (e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value);
    if (e.detail.value.length==1){
      this.setData({
        checked: true
      })
    }else{
      this.setData({
        checked:false
      })
    }
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
              if(data.result=="0"){
                that.setData({
                  UserPhoneValue: data.phoneNum,
                  getPhoneNumberBtn: true,
                  UserPhoneValueShow: true
                })
                if (app.globalData.userInfo != "" && app.globalData.userInfo) {
                  that.setData({
                    phoneNum: app.globalData.userInfo,
                    noLoginNoPhone: true,
                    noLoginPhone: false
                  })
                }
                orderInfo.appntMobile = data.phoneNum
              }else{
                that.setData({
                  getPhoneNumberBtn: true,
                  UserPhoneValueShow: false
                })
              }
            })
          }else{
            that.setData({
              getPhoneNumberBtn: true,
              UserPhoneValueShow: false
            })
          }
        }else{
            that.setData({
              getPhoneNumberBtn:true,
              UserPhoneValueShow: false
            })
        }
      },
    })
    this.setData({
      showView: true
    })
  },

  //获取用户手机号码
  getUserPhoneNum:function(e){
    console.log(e.detail.value);
    var that = this;
    var appentPhoneNum = e.detail.value;
    console.log(appentPhoneNum);
    
    //验证手机号
    var sMobile = this.checkMobile(appentPhoneNum);
    if (!sMobile) {
      orderInfo.appntMobile = ' ';
    } else {
      orderInfo.appntMobile = appentPhoneNum;
    }
  },


  //用户手机号验证
  checkMobile: function (sMobile) {
    if (!(/^1[34578]\d{9}$/.test(sMobile))) {
      return false;
    } else {
      return true;
    }
  }, 

  //获取手机验证短信验证码输入值
  smsinput: function (e) {
    console.log(e.detail.value)
    this.setData({
      smsNum: e.detail.value,
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
  getImage: function () {
    console.log('发送图形验证码');
    var loginToken = wx.getStorageSync('loginToken');
    customer.graphSend({ loginToken: loginToken }).then((data) => {
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
      } else {
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
    var mobile = orderInfo.appntMobile;
    var graph = this.data.graphCode;
    var graphId = this.data.graphId;
    console.log(mobile + "手机号");
    var that = this;
    var regMobile = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    // 获取验证码时，手机号验证失败
    if (!regMobile.test(mobile)) {
      if (mobile == ' '||mobile==undefined) {
        this.errTip('请输入手机号');
      } 
      return false;
    } else {
      // 获取验证码时，手机号验证成功,调用发送短信验证码接口，根据返回值判断是否显示图形验证码
      // 请求发送短信验证码
      if (this.data.isSend) {
        console.log(this.data.isSend)
        that.setData({
           isSend: false
        })
        var third = wx.getStorageSync('third');
        // 请求发送短信验证码
        customer.smsSend({ operateType: 'regandlogin', mobile: mobile, graphId: graphId, graphCode: graph, thirdToken: third, system: 'hr', type: 'wxa' }).then((data) => {
        console.log(data)
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
          console.log(999)
          that.getImage();
          that.waitSend(60);
        }else if (data.result == '1') {
        // 发送失败
        that.setData({
          show: true
        })
        that.setData({
          isSend: true
        })
        wx.showModal({
          title: '提示',
          confirmColor: "#f3b256",
          content: data.resultMessage
        })
        } else if (data.result == '2'){
            this.setData({
              imgCodeShow:true
            })
        }
        else {
          that.setData({
            isSend: true
          })
          wx.showModal({
            title: '提示',
            confirmColor: "#f3b256",
            content: data.resultMessage
          })
        }
      })
      }
    }
  },

  //验证码倒计时
  waitSend: function (i) {
    // if (this.data.buttonDisable){
    //   return false;
    // }
    console.log(i);
    this.setData({
      grayactive: true
    })
    var that = this;
    var intervalId = setInterval(function () {
      i--;
      that.setData({
        getCodeNum: "重新获取(" + i + ")",
        buttonDisable: true,
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
      }
    }, 1000)
  },

  // 登录验证事件
  formSubmit: function () {
    var that = this;
    var graph = this.data.graphCode;//图形验证码值
    console.log(orderInfo.appntMobile);
    console.log(this.data.smsNum);
    console.log(this.data.smsId);

    // 表单验证通过，进行快捷登录
    var third = wx.getStorageSync('third');    
    // 快捷登录
    console.log("电话号码" + orderInfo.appntMobile);
    console.log("短信验证码ID" + that.data.smsId);
    console.log("短信验证码" + that.data.smsNum);
    console.log("图形验证码" + that.data.graphCode);
    console.log("图形验证码ID" + that.data.graphId);
    console.log("thirdToken" + third);
    customer.quickLogin({ mobile: orderInfo.appntMobile, smsId: that.data.smsId, smsCode: that.data.smsNum, graphCode: graph, graphId: that.data.graphId, thirdToken: third, system: 'hr', type: 'wxa' }).then((data) => {
    console.log(data);
    // 登录成功
      if (data.result == "0") {
        wx.setStorageSync('loginToken', data.loginToken);
        wx.setStorageSync('lognimgToken', data.token);
        wx.setStorageSync('regSystemType', data.regSystemType)
        console.log("登录成功啦啦啦");
        that.setData({
          hrAccountLogin:true,
          switchOpen: false,
          isLogin : true
        })
        wx.setStorageSync("token",data.token);
        console.log(that.data.hrAccountLogin);
        wx.setStorage({
          key: 'hrAccountLogin',
          data: that.data.hrAccountLogin,
        })
      
        that.setData({
          userPhoneLoginShow:false,
          imgCodeShow: false
        })
       
        that.reCheckLogin();
      } else if (data.result == "7") {
        that.setData({
          imgCodeShow: true
        })
        wx.showModal({
          title: '提示',
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
          confirmColor: "#f3b256",
          content: data.resultMessage
        })
        that.setData({
          showView: false
        })
        // 登录失败显示登录弹窗
        that.setData({
          loginSelected: true
        })
      }
    })
  },

  //核保
  doUnderWrite:function(){
    //TODO
    console.log("核保验证");
    var arr = [];
    arr.push(insuredInfo);
    hrp.underwriting({
      "orderInfo": orderInfo,
      "insuredInfo": arr,
      "system": "",
      "type": "",
    }).then((data) => {
      console.log(data);
      buyInfo.doUnderWriteResult = data.underWriteMsg;
      if (data.result==1){
        return false
      }else{
        return true
      }
    })
  },

  //条款弹层
  clauseTap: function () {
    this.setData({
      TickInfomodel: true,
      ReadTickInfoShow: true
    })
  },

  //取消条款弹层
  abolish: function () {
    this.setData({
      TickInfomodel: false,
      ReadTickInfoShow:false
    })
  },

  //立即投保
  immediatelyInsure:function(){
    var that  = this;
    pageUtil.checkLogin().then((data) => {
      console.log(data);
      console.log(data.isLogin);
      if (data.isLogin) {
        this.setData({
          isLogin: true
        })
      } else {
        this.setData({
          userPhoneLoginShow: true
        })

      }
    })
   //如果没有登录，或者库存不足，或者核保没有通过 都不能跳转到投保信息确认页面
    if (productDetailInfo.insureInfo.isSale != "0"){
      if (!this.data.isLogin) {
        console.log("么有登录！！！");
        this.setData({
          userPhoneLoginShow: true
        })
        this.formSubmit();
      }else{
        if (!this.data.checked){
          this.errTip("请勾选阅读条款") 
        }else{
          //如果核保通过直接跳转到支付页面，
          customer.getCustomInfo({
            isUserId: 1,
            idAuthState: 1
          }).then((data) => {
            customerInfo = data;
            customer.pointsValue({
              "isUserId": "1",
              "isAuthState": "1"
            }).then((data) => {
              console.log("核保")
              console.log(data);
              availablePoint = data.availablePoint;
            })  
          })
        console.log(customerInfo);
        console.log("用户信息查询");
        console.log(productDetailInfo.insureInfo.insuredType == "1");
        if (customerInfo.idNoStar  &&  customerInfo.idNoStar){
          if (productDetailInfo.insureInfo.insuredType == "1"){
            this.setData({
              loadingHidden: false,
              ModelShow:false
            }) 
            var arr = [];
            arr.push(insuredInfo);
           hrp.underwriting({
              "orderInfo": orderInfo,
              "insuredInfo": arr,
              "system": "",
              "type": "",
            }).then((data) => {
            console.log(data);
            buyInfo.doUnderWriteResult = data.underWriteMsg;
            if (data.underWriteStatus=="0"){
              this.setData({
                loadingHidden: true,
                ModelShow: true
              }) 
                 buyInfo.resultdoUnderWrite = true
              }else{
              this.setData({
                loadingHidden: true,
                ModelShow: true
              }) 
               buyInfo.resultdoUnderWrite = false
              }
            console.log(buyInfo.resultdoUnderWrite)
            if (buyInfo.resultdoUnderWrite == false) {
              this.errTip(buyInfo.doUnderWriteResult);
            } else {
              if (buyInfo.orderAmount || buyInfo.orderAmount == "-1") {
                this.errTip("当前选择项不支持投保");
              }else{
                wx.navigateTo({
                  url: '../payAndSign/payAndSign?applicationNo=' + data.applicationNo,
                })
              }
            }
           })
          } else {
            if (buyInfo.orderAmount || buyInfo.orderAmount == "-1") {
              this.errTip("当前选择项不支持投保");
            }else{
              wx.navigateTo({
                url: '../insure/insure',
              })
             }
            }
        } else {
          if (buyInfo.orderAmount || buyInfo.orderAmount == "-1") {
            this.errTip("当前选择项不支持投保");
          }else{
            wx.navigateTo({
              url: '../insure/insure',
            })
          }
         
        }
        }  
      }
    }
  },  

  //登录情况时重新渲染投保人信息
  reCheckLogin:function(){
    this.initBirthday();
    var result = this.doUnderWrite();
    
    if (!this.data.checked) {
      this.errTip("请勾选阅读条款")
    }  else{
      if (!result) {
        if (buyInfo.orderAmount || buyInfo.orderAmount == "-1") {
          this.errTip("当前选择项不支持投保");
        }else{
          wx.navigateTo({
            url: '../insure/insure',
          })
        }
      }else {
        if (buyInfo.orderAmount || buyInfo.orderAmount == "-1") {
          this.errTip("当前选择项不支持投保");
        }else{
          wx.navigateTo({
            url: '../payAndSign/payAndSign',
          })
        } 
      }
    }
  },
  //错误提示
  errTip: function(text){
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