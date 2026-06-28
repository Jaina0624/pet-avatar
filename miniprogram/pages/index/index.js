// 首页逻辑
const app = getApp();

// 演示宠物数据（离线模式用）
const MOCK_PETS = [
  {
    id: 'mock-1',
    name: '奶糖',
    species: 'cat',
    breed: '英短',
    neck_cm: 24,
    chest_cm: 34,
    back_length_cm: 30,
    waist_cm: 22,
    size_tier: 'cat',
    photos: ['/assets/images/style-vest.png'],
    model_3d_url: '',
    model_status: 'pending'
  },
  {
    id: 'mock-2',
    name: '毛毛',
    species: 'dog',
    breed: '柯基',
    neck_cm: 36,
    chest_cm: 52,
    back_length_cm: 38,
    size_tier: 'm_dog',
    photos: ['/assets/images/style-onesie.png'],
    model_3d_url: '',
    model_status: 'completed'
  }
];

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
    this.loadPets();
  },

  // 加载宠物列表（API失败时用Mock数据）
  async loadPets() {
    // 如果后端未部署，直接用Mock数据
    this.setData({ pets: MOCK_PETS });
    
    // 尝试从后端加载（失败也不影响）
    wx.request({
      url: `${app.globalData.baseUrl}/api/pets`,
      header: { Authorization: `Bearer ${app.globalData.token}` },
      timeout: 3000,
      success: (res) => {
        if (res.data && res.data.code === 0 && res.data.data && res.data.data.length > 0) {
          this.setData({ pets: res.data.data });
        }
      },
      fail: () => {
        console.log('后端未部署，使用演示数据');
      }
    });
  },

  // 检查今日签到状态
  checkCheckinStatus() {
    const checked = wx.getStorageSync('todayCheckedIn');
    this.setData({ todayCheckedIn: !!checked });
    
    wx.request({
      url: `${app.globalData.baseUrl}/api/points/checkin-status`,
      header: { Authorization: `Bearer ${app.globalData.token}` },
      timeout: 3000,
      success: (res) => {
        if (res.data && res.data.code === 0) {
          this.setData({ todayCheckedIn: res.data.data.checkedIn });
        }
      },
      fail: () => {}
    });
  },

  // 每日签到（离线模式用本地存储）
  doCheckin() {
    if (this.data.todayCheckedIn) return;

    wx.showToast({ title: '签到成功 +10积分！', icon: 'success' });
    this.setData({ todayCheckedIn: true });
    wx.setStorageSync('todayCheckedIn', true);

    // 尝试服务端签到
    wx.request({
      url: `${app.globalData.baseUrl}/api/points/checkin`,
      method: 'POST',
      header: { Authorization: `Bearer ${app.globalData.token}` },
      timeout: 3000,
      success: (res) => {
        if (res.data && res.data.code === 0) {
          const { points, streak } = res.data.data;
          wx.showToast({ title: `签到成功 +${points}积分！连续${streak}天`, icon: 'success' });
        }
      },
      fail: () => {}
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
    wx.stopPullDownRefresh();
  }
});
