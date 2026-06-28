// 工具函数库

/**
 * 请求封装
 */
function request(url, options = {}) {
  const app = getApp();
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.baseUrl}${url}`,
      header: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${app.globalData.token}`
      },
      ...options,
      success: (res) => {
        if (res.data.code === 0) {
          resolve(res.data.data);
        } else if (res.data.code === 401) {
          // token过期，重新登录
          app.wxLogin().then(() => {
            request(url, options).then(resolve).catch(reject);
          });
        } else {
          reject(res.data);
        }
      },
      fail: reject
    });
  });
}

/**
 * 格式化价格
 */
function formatPrice(price) {
  return parseFloat(price).toFixed(2);
}

/**
 * 时间格式化
 */
function formatTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
  if (diff < 604800000) return Math.floor(diff / 86400000) + '天前';
  
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 体型档位映射
 */
function getSizeTierLabel(tier) {
  const map = {
    cat: '猫咪档',
    s_dog: '小型犬档',
    m_dog: '中型犬档',
    l_dog: '大型犬档'
  };
  return map[tier] || '未知';
}

/**
 * 订单状态映射
 */
function getOrderStatusLabel(status) {
  const map = {
    pending: '待付款',
    paid: '已付款',
    producing: '制作中',
    shipping: '已发货',
    delivered: '已签收',
    cancelled: '已取消',
    completed: '已完成'
  };
  return map[status] || '未知';
}

/**
 * 防抖
 */
function debounce(fn, delay = 300) {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * 节流
 */
function throttle(fn, delay = 300) {
  let last = 0;
  return function(...args) {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn.apply(this, args);
    }
  };
}

module.exports = {
  request,
  formatPrice,
  formatTime,
  getSizeTierLabel,
  getOrderStatusLabel,
  debounce,
  throttle
};
