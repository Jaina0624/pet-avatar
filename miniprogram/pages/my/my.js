// 我的页面
const app = getApp();

// 演示数据（离线模式）
const MOCK_USER = { id: 'demo-user', nickName: '铲屎官小美', avatarUrl: '' };
const MOCK_PETS = [
  { id: 'mock-1', name: '奶糖', photos: ['/assets/images/style-vest.png'] },
  { id: 'mock-2', name: '毛毛', photos: ['/assets/images/style-onesie.png'] }
];
const MOCK_ORDERS = [
  { id: 'order-1', order_no: 'PA20260626001', style_name: '经典背心款', pet_name: '奶糖', fabric_name: '樱花粉', total_price: 99, status: 'producing', preview_image: '/assets/images/style-vest.png' },
  { id: 'order-2', order_no: 'PA20260625002', style_name: '甜美连体衣', pet_name: '毛毛', fabric_name: '蓝白条纹', total_price: 154, status: 'paid', preview_image: '/assets/images/style-onesie.png' },
  { id: 'order-3', order_no: 'PA20260620003', style_name: '运动四脚套', pet_name: '奶糖', fabric_name: '爪印图案', total_price: 179, status: 'delivered', preview_image: '/assets/images/style-sport.png' }
];

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
    this.setData({
      userInfo: MOCK_USER,
      pets: MOCK_PETS,
      pointsBalance: 280,
      orders: MOCK_ORDERS
    });
    this.filterOrders();
  },

  loadData() {
    this.loadOrders();
  },

  loadOrders() {
    this.setData({ orders: MOCK_ORDERS });
    this.filterOrders();
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

  goToPetProfile() { wx.navigateTo({ url: '/pages/pet-profile/pet-profile' }); },
  goToPoints() { wx.navigateTo({ url: '/pages/points/points' }); },
  goToCustom() { wx.navigateTo({ url: '/pages/custom-order/custom-order' }); },
  viewPet(e) { wx.navigateTo({ url: `/pages/pet-profile/pet-profile?id=${e.currentTarget.dataset.id}` }); },
  viewOrder(e) { wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${e.currentTarget.dataset.id}` }); },
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
