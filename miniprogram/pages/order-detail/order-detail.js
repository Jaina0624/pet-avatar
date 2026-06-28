// 订单详情页面
const app = getApp();

Page({
  data: {
    needPay: false,
    orderInfo: {
      order_no: 'PA20260626001',
      pet_name: '奶糖',
      style_name: '经典背心款',
      fabric_name: '樱花粉',
      total_price: 99,
      status: 'producing'
    },
    statusIcon: '📦',
    statusLabel: '制作中',
    infoList: [],
    progressSteps: []
  },

  onLoad(options) {
    const mockOrders = {
      'mock-order': { order_no: 'PA20260626001', pet_name: '奶糖', style_name: '经典背心款', fabric_name: '樱花粉', total_price: 99, status: 'producing' },
      'order-1': { order_no: 'PA20260626001', pet_name: '奶糖', style_name: '经典背心款', fabric_name: '樱花粉', total_price: 99, status: 'producing' },
      'order-2': { order_no: 'PA20260625002', pet_name: '毛毛', style_name: '甜美连体衣', fabric_name: '蓝白条纹', total_price: 154, status: 'paid' },
      'order-3': { order_no: 'PA20260620003', pet_name: '奶糖', style_name: '运动四脚套', fabric_name: '爪印图案', total_price: 179, status: 'delivered' }
    };

    let order = mockOrders[options.id] || mockOrders['mock-order'];
    const needPay = options.needPay === 'true' || order.status === 'paid';

    this.setData({ orderInfo: order, needPay });

    const statusMap = {
      pending: { icon: '⏳', label: '等待付款' },
      paid: { icon: '✅', label: '已付款' },
      producing: { icon: '📦', label: '正在制作中...' },
      shipping: { icon: '🚚', label: '已发货' },
      delivered: { icon: '🎉', label: '已签收' }
    };
    const s = statusMap[order.status] || statusMap.producing;
    this.setData({ statusIcon: s.icon, statusLabel: s.label });

    this.setData({ infoList: [
      { label: '订单编号', value: order.order_no },
      { label: '宠物', value: order.pet_name },
      { label: '款式', value: order.style_name },
      { label: '布料', value: order.fabric_name },
      { label: '金额', value: `¥${order.total_price}` }
    ]});

    this.setData({ progressSteps: [
      { label: '已确认', time: '2026-06-26 10:00', done: true },
      { label: '打版裁剪', time: '2026-06-27 14:00', done: order.status !== 'paid' },
      { label: '缝制质检', time: '', done: false },
      { label: '已发货', time: '', done: false },
      { label: '已签收', time: '', done: false }
    ]});
  },

  doPay() {
    wx.showToast({ title: '演示模式：支付成功！', icon: 'success' });
    setTimeout(() => {
      wx.redirectTo({ url: '/pages/my/my' });
    }, 1500);
  }
});
