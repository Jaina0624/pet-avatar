// 积分中心
const app = getApp();

// 演示积分流水
const MOCK_TRANSACTIONS = [
  { id: 'tx1', type: 'earn', amount: 10, description: '每日签到', source: 'checkin', created_at: '2026-06-26 10:30' },
  { id: 'tx2', type: 'earn', amount: 20, description: '分享小程序给好友', source: 'share', created_at: '2026-06-25 15:20' },
  { id: 'tx3', type: 'earn', amount: 50, description: '完善宠物档案', source: 'profile', created_at: '2026-06-24 14:00' },
  { id: 'tx4', type: 'spend', amount: 80, description: '兑换小帽子装扮', source: 'exchange', created_at: '2026-06-22 11:30' },
  { id: 'tx5', type: 'earn', amount: 100, description: '定制订单完成奖励', source: 'order', created_at: '2026-06-20 09:15' }
];

Page({
  data: {
    balance: 280,
    totalEarned: 180,
    streak: 3,
    todayChecked: false,
    weekDays: [
      { day: '周一', points: 10, checked: true, isToday: false },
      { day: '周二', points: 10, checked: true, isToday: false },
      { day: '周三', points: 15, checked: true, isToday: false },
      { day: '周四', points: 10, checked: false, isToday: true },
      { day: '周五', points: 10, checked: false, isToday: false },
      { day: '周六', points: 20, checked: false, isToday: false },
      { day: '周日', points: 20, checked: false, isToday: false }
    ],
    pointRules: [
      { icon: '📅', name: '每日签到', desc: '每天签到领积分', points: 10, action: 'checkin' },
      { icon: '⏱️', name: '在线时长', desc: '浏览小程序每满5分钟', points: 5, action: 'online' },
      { icon: '📤', name: '分享好友', desc: '分享小程序给好友', points: 20, action: 'share' },
      { icon: '🐾', name: '完善档案', desc: '完整填写宠物信息', points: 50, action: 'profile' },
      { icon: '👗', name: '下单奖励', desc: '每完成一笔定制订单', points: 100, action: 'order' },
      { icon: '⭐', name: '晒单评价', desc: '收货后晒图评价', points: 30, action: 'review' }
    ],
    exchangeItems: [
      { id: 1, name: '蝴蝶结装扮', image: '/assets/icons/bow.png', points: 50 },
      { id: 2, name: '小帽子', image: '/assets/icons/hat.png', points: 80 },
      { id: 3, name: '宠物零食', image: '/assets/icons/snack.png', points: 200 },
      { id: 4, name: '10元优惠券', image: '/assets/icons/coupon.png', points: 500 }
    ],
    transactions: []
  },

  onLoad() {
    this.loadPointsData();
  },

  loadPointsData() {
    // 先用演示数据
    this.setData({ transactions: MOCK_TRANSACTIONS });

    // 尝试从后端加载
    wx.request({
      url: `${app.globalData.baseUrl}/api/points/summary`,
      header: { Authorization: `Bearer ${app.globalData.token}` },
      timeout: 3000,
      success: (res) => {
        if (res.data && res.data.code === 0) {
          const data = res.data.data;
          this.setData({
            balance: data.balance,
            totalEarned: data.total_earned,
            streak: data.streak,
            todayChecked: data.today_checked,
            transactions: data.transactions || MOCK_TRANSACTIONS
          });
          this.updateWeekDays(data.checkin_days || []);
        }
      },
      fail: () => {}
    });
  },

  // 更新签到格子
  updateWeekDays(checkedDays) {
    const days = this.data.weekDays;
    const today = new Date().getDay();
    const todayIndex = today === 0 ? 6 : today - 1;

    days.forEach((day, index) => {
      day.checked = checkedDays.includes(index);
      day.isToday = index === todayIndex;
    });
    this.setData({ weekDays: days });
  },

  // 签到（离线模式用本地状态）
  doCheckin() {
    if (this.data.todayChecked) return;

    // 本地签到
    wx.showToast({ title: '签到成功！+10积分', icon: 'success' });
    this.setData({
      todayChecked: true,
      streak: this.data.streak + 1,
      balance: this.data.balance + 10
    });

    // 更新签到格子
    const days = this.data.weekDays;
    const today = new Date().getDay();
    const todayIndex = today === 0 ? 6 : today - 1;
    days[todayIndex].checked = true;
    this.setData({ weekDays: days });

    // 尝试服务端签到
    wx.request({
      url: `${app.globalData.baseUrl}/api/points/checkin`,
      method: 'POST',
      header: { Authorization: `Bearer ${app.globalData.token}` },
      timeout: 3000,
      success: (res) => {
        if (res.data && res.data.code === 0) {
          wx.showToast({ title: `签到成功！+${res.data.data.points}积分，连续${res.data.data.streak}天`, icon: 'success' });
        }
      },
      fail: () => {}
    });
  },

  // 积分兑换（离线模式演示）
  exchange(e) {
    const item = e.currentTarget.dataset.item;
    if (this.data.balance < item.points) {
      wx.showToast({ title: '积分不足', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认兑换',
      content: `确定用 ${item.points} 积分兑换「${item.name}」吗？`,
      success: (res) => {
        if (res.confirm) {
          // 本地兑换
          wx.showToast({ title: `兑换「${item.name}」成功！`, icon: 'success' });
          this.setData({
            balance: this.data.balance - item.points,
            totalEarned: this.data.totalEarned
          });

          // 尝试服务端兑换
          wx.request({
            url: `${app.globalData.baseUrl}/api/points/exchange`,
            method: 'POST',
            header: { Authorization: `Bearer ${app.globalData.token}` },
            data: { item_id: item.id, points: item.points },
            timeout: 3000,
            success: (res) => {
              if (res.data && res.data.code === 0) {
                this.loadPointsData();
              }
            },
            fail: () => {}
          });
        }
      }
    });
  }
});
