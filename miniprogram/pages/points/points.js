// 积分中心
const app = getApp();

Page({
  data: {
    balance: 0,
    totalEarned: 0,
    streak: 0,
    todayChecked: false,
    weekDays: [
      { day: '周一', points: 10, checked: false, isToday: false },
      { day: '周二', points: 10, checked: false, isToday: false },
      { day: '周三', points: 15, checked: false, isToday: false },
      { day: '周四', points: 10, checked: false, isToday: false },
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
    if (!app.globalData.token) return;

    wx.request({
      url: `${app.globalData.baseUrl}/api/points/summary`,
      header: { Authorization: `Bearer ${app.globalData.token}` },
      success: (res) => {
        if (res.data.code === 0) {
          const data = res.data.data;
          this.setData({
            balance: data.balance,
            totalEarned: data.total_earned,
            streak: data.streak,
            todayChecked: data.today_checked,
            transactions: data.transactions || []
          });
          this.updateWeekDays(data.checkin_days || []);
        }
      }
    });
  },

  // 更新签到格子
  updateWeekDays(checkedDays) {
    const days = this.data.weekDays;
    const today = new Date().getDay(); // 0=周日
    const todayIndex = today === 0 ? 6 : today - 1;

    days.forEach((day, index) => {
      day.checked = checkedDays.includes(index);
      day.isToday = index === todayIndex;
    });

    this.setData({ weekDays: days });
  },

  // 签到
  doCheckin() {
    if (this.data.todayChecked) return;

    wx.request({
      url: `${app.globalData.baseUrl}/api/points/checkin`,
      method: 'POST',
      header: { Authorization: `Bearer ${app.globalData.token}` },
      success: (res) => {
        if (res.data.code === 0) {
          const { points, streak } = res.data.data;
          wx.showToast({ title: `签到成功！+${points}积分`, icon: 'success' });
          this.setData({
            todayChecked: true,
            streak: streak,
            balance: this.data.balance + points
          });
          // 刷新签到格子
          this.loadPointsData();
        }
      }
    });
  },

  // 积分兑换
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
          wx.request({
            url: `${app.globalData.baseUrl}/api/points/exchange`,
            method: 'POST',
            header: { Authorization: `Bearer ${app.globalData.token}` },
            data: { item_id: item.id, points: item.points },
            success: (res) => {
              if (res.data.code === 0) {
                wx.showToast({ title: '兑换成功！', icon: 'success' });
                this.loadPointsData();
              }
            }
          });
        }
      }
    });
  }
});
