// 我的页面
const app = getApp();

Page({
  data: {
    userInfo: null,
    pointsBalance: 0,
    pets: [],
    orders: [],
    orderTab: 'all',
    filteredOrders: []
  },

  onShow() {
    if (app.globalData.isLogin) {
      this.setData({ userInfo: app.globalData.userInfo });
      this.loadData();
    } else {
      app.wxLogin().then((userInfo) => {
        this.setData({ userInfo });
        this.loadData();
      });
    }
  },

  loadData() {
    this.loadPets();
    this.loadPoints();
    this.loadOrders();
  },

  loadPets() {
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

  loadPoints() {
    wx.request({
      url: `${app.globalData.baseUrl}/api/points/balance`,
      header: { Authorization: `Bearer ${app.globalData.token}` },
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({ pointsBalance: res.data.data.balance });
        }
      }
    });
  },

  loadOrders() {
    wx.request({
      url: `${app.globalData.baseUrl}/api/orders`,
      header: { Authorization: `Bearer ${app.globalData.token}` },
      success: (res) => {
        if (res.data.code === 0) {
          const orders = res.data.data;
          this.setData({ orders });
          this.filterOrders();
        }
      }
    });
  },

  switchOrderTab(e) {
    this.setData({ orderTab: e.currentTarget.dataset.tab });
    this.filterOrders();
  },

  filterOrders() {
    const { orders, orderTab } = this.data;
    let filtered = orders;
    if (orderTab !== 'all') {
      filtered = orders.filter(o => o.status === orderTab);
    }
    this.setData({ filteredOrders: filtered });
  },

  // 页面跳转
  goToPetProfile() {
    wx.navigateTo({ url: '/pages/pet-profile/pet-profile' });
  },
  goToPoints() {
    wx.navigateTo({ url: '/pages/points/points' });
  },
  goToCustom() {
    wx.navigateTo({ url: '/pages/custom-order/custom-order' });
  },
  viewPet(e) {
    wx.navigateTo({ url: `/pages/pet-profile/pet-profile?id=${e.currentTarget.dataset.id}` });
  },
  viewOrder(e) {
    wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${e.currentTarget.dataset.id}` });
  },
  viewAllOrders() {
    this.setData({ orderTab: 'all' });
    this.filterOrders();
  },
  showDownload() {
    wx.showModal({
      title: '下载电子桌宠',
      content: '请用电脑浏览器访问 petavatar.cn/download 下载桌面版',
      showCancel: false,
      confirmText: '知道了'
    });
  }
});
