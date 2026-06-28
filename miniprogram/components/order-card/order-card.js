// 订单卡片组件
Component({
  properties: {
    order: { type: Object, value: {} }
  },

  computed: {
    statusLabel() {
      const map = {
        pending: '待付款',
        paid: '已付款',
        producing: '制作中',
        shipping: '已发货',
        delivered: '已签收',
        cancelled: '已取消',
        completed: '已完成'
      };
      return map[this.data.order.status] || '未知';
    }
  },

  data: {
    statusLabel: ''
  },

  observers: {
    'order.status': function(status) {
      const map = {
        pending: '待付款',
        paid: '已付款',
        producing: '制作中',
        shipping: '已发货',
        delivered: '已签收',
        cancelled: '已取消',
        completed: '已完成'
      };
      this.setData({ statusLabel: map[status] || '未知' });
    }
  },

  methods: {
    onPay() {
      this.triggerEvent('pay', { id: this.data.order.id });
    },
    onCancel() {
      this.triggerEvent('cancel', { id: this.data.order.id });
    },
    onTrack() {
      this.triggerEvent('track', { id: this.data.order.id });
    },
    onReview() {
      this.triggerEvent('review', { id: this.data.order.id });
    }
  }
});
