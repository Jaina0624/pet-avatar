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
    // 获取系统信息
    this.getSystemInfo();
  },

  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    if (token) {
      this.globalData.token = token;
      this.globalData.isLogin = true;
    }
  },

  getSystemInfo() {
    const winfo = wx.getWindowInfo();
    const dinfo = wx.getDeviceInfo();
    const sinfo = wx.getAppBaseInfo();
    this.globalData.systemInfo = {
      windowWidth: winfo.windowWidth,
      windowHeight: winfo.windowHeight,
      pixelRatio: winfo.pixelRatio,
      platform: dinfo.platform,
      brand: dinfo.brand,
      model: dinfo.model,
      SDKVersion: sinfo.SDKVersion,
      webglSupported: sinfo.SDKVersion >= '2.9.0'
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
