// 价格计算器组件
Component({
  properties: {
    basePrice: { type: Number, value: 0 },
    sizeSurcharge: { type: Number, value: 0 },
    options: { type: Object, value: {} }
  },

  data: {
    priceDetails: [],
    total: 0
  },

  observers: {
    'basePrice, sizeSurcharge, options': function() {
      this.calculate();
    }
  },

  methods: {
    calculate() {
      const { basePrice, sizeSurcharge } = this.properties;
      let details = [];
      let total = basePrice;

      details.push({ label: '基础价格', price: basePrice });

      if (sizeSurcharge > 0) {
        details.push({ label: '尺寸加价', price: sizeSurcharge });
        total += sizeSurcharge;
      }

      // 选项加价由父组件传入的 options 中的值决定
      // 这里 options 已被解析为包含 surcharge 的信息
      const optionsSurcharge = this.properties.options._surcharge || 0;
      if (optionsSurcharge > 0) {
        details.push({ label: '选项加价', price: optionsSurcharge });
        total += optionsSurcharge;
      }

      this.setData({ priceDetails: details, total });
      this.triggerEvent('totalchange', { total });
    }
  }
});
