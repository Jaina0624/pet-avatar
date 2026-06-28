// 首页逻辑
const app = getApp();

Page({
  data: {
    pets: [],
    hotStyles: [
      {
        id: 1,
        name: '经典背心款',
        image: '/assets/images/style-vest.png',
        basePrice: 89,
        tag: '热销'
      },
      {
        id: 2,
        name: '甜美连体衣',
        image: '/assets/images/style-onesie.png',
        basePrice: 129,
        tag: '新品'
      },
      {
        id: 3,
        name: '运动四脚套',
        image: '/assets/images/style-sport.png',
        basePrice: 159,
        tag: ''
      },
      {
        id: 4,
        name: '轻量雨衣款',
        image: '/assets/images/style-raincoat.png',
        basePrice: 139,
        tag: '防水'
      }
    ],
    todayCheckedIn: false
  },

  onLoad() {
    this.loadPets();
    this.checkCheckinStatus();
  },

  onShow() {
    // 每次显示页面时刷新宠物列表
    this.loadPets();
  },

  // 加载宠物列表
  async loadPets() {
    if (!app.globalData.isLogin) {
      try {
        await app.wxLogin();
      } catch (err) {
        console.error('登录失败', err);
        return;
      }
    }

    wx.request({
      url: `${app.globalData.baseUrl}/api/pets`,
      header: { Authorization: `Bearer ${app.globalData.token}` },
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({ pets: res.data.data });
        }
      }
    });
  },

  // 检查今日签到状态
  checkCheckinStatus() {
    if (!app.globalData.token) return;
    
    wx.request({
      url: `${app.globalData.baseUrl}/api/points/checkin-status`,
      header: { Authorization: `Bearer ${app.globalData.token}` },
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({ todayCheckedIn: res.data.data.checkedIn });
        }
      }
    });
  },

  // 每日签到
  doCheckin() {
    if (!app.globalData.isLogin) {
      app.wxLogin().then(() => this.doCheckin());
      return;
    }

    wx.request({
      url: `${app.globalData.baseUrl}/api/points/checkin`,
      method: 'POST',
      header: { Authorization: `Bearer ${app.globalData.token}` },
      success: (res) => {
        if (res.data.code === 0) {
          const { points, streak } = res.data.data;
          wx.showToast({
            title: `签到成功 +${points}积分！连续${streak}天`,
            icon: 'success'
          });
          this.setData({ todayCheckedIn: true });
        }
      }
    });
  },

  // 页面跳转
  goToPetProfile() {
    wx.navigateTo({ url: '/pages/pet-profile/pet-profile' });
  },
  goToModelPreview() {
    wx.navigateTo({ url: '/pages/model-preview/model-preview' });
  },
  goToCustomOrder() {
    wx.navigateTo({ url: '/pages/custom-order/custom-order' });
  },
  goToPoints() {
    wx.navigateTo({ url: '/pages/points/points' });
  },
  onPetTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/pet-profile/pet-profile?id=${id}` });
  },
  onStyleTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/custom-order/custom-order?styleId=${id}` });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadPets();
    this.checkCheckinStatus();
    wx.stopPullDownRefresh();
  }
});
