// 云函数：订单状态变更通知
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const { userId, orderNo, status, statusLabel } = event;

  try {
    // 发送订阅消息
    const result = await cloud.openapi.subscribeMessage.send({
      touser: userId, // 实际应为用户的openid
      templateId: 'your-template-id',
      page: `/pages/order-detail/order-detail?id=${event.orderId}`,
      data: {
        thing1: { value: orderNo },
        phrase2: { value: statusLabel },
        time3: { value: new Date().toLocaleString() }
      }
    });

    return { code: 0, data: result };
  } catch (err) {
    return { code: -1, msg: err.message };
  }
};
