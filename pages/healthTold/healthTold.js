
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },
  /**
  * 生命周期函数--监听页面加载
  */
  onLoad: function (options) {
    console.log(options);
   this.setData({
     href: 'https://weixin.huaruisales.com/h5/safeguard/insure/contentDetail.html?itemCode=' +options.item+'&instaceCode=HR_GUARANTEE_SALE&propertyCode=introduction&type=page'
    //  href: 'https://weixin.huaruisales.com/h5/safeguard/insure/contentDetail.html'
    //  href: ' https://weixin.huaruisales.com/resources/HRWX_HRP_PS5048/PS5048_jkgz.html'
   })
  },
})