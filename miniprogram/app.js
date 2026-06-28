// PetAvatar 小程序入口文件
App({
  globalData: {
    userInfo: null,
    token: null,
    baseUrl: 'https://api.petavatar.cn',
    cosUrl: 'https://cos.petavatar.cn',
    isLogin: false
  },

  onLaunch() {
    // 检查登录状态
    this.checkLoginStatus();
    // 获取系统信息
    this.getSystemInfo();
  },

  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    if (token) {
      this.globalData.token = token;
      this.globalData.isLogin = true;
      this.getUserInfo();
    }
  },

  getUserInfo() {
    wx.request({
      url: `${this.globalData.baseUrl}/api/user/profile`,
      header: { Authorization: `Bearer ${this.globalData.token}` },
      success: (res) => {
        if (res.data.code === 0) {
          this.globalData.userInfo = res.data.data;
        }
      }
    });
  },

  getSystemInfo() {
    const info = wx.getSystemInfoSync();
    this.globalData.systemInfo = {
      windowWidth: info.windowWidth,
      windowHeight: info.windowHeight,
      pixelRatio: info.pixelRatio,
      platform: info.platform,
      brand: info.brand,
      model: info.model,
      SDKVersion: info.SDKVersion,
      // 判断是否支持Skyline
      skylineSupported: info.renderer === 'skyline',
      // 判断是否支持WebGL
      webglSupported: info.SDKVersion >= '2.9.0'
    };
  },

  // 微信登录
  wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            wx.request({
              url: `${this.globalData.baseUrl}/api/auth/login`,
              method: 'POST',
              data: { code: res.code },
              success: (response) => {
                if (response.data.code === 0) {
                  const { token, userInfo } = response.data.data;
                  this.globalData.token = token;
                  this.globalData.userInfo = userInfo;
                  this.globalData.isLogin = true;
                  wx.setStorageSync('token', token);
                  resolve(userInfo);
                } else {
                  reject(response.data);
                }
              },
              fail: reject
            });
          } else {
            reject(res);
          }
        },
        fail: reject
      });
    });
  }
});
