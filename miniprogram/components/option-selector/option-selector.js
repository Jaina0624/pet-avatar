// 选项选择器组件
Component({
  properties: {
    title: { type: String, value: '' },
    options: { type: Array, value: [] },
    selected: { type: String, value: '' }
  },

  methods: {
    onSelect(e) {
      const { id } = e.currentTarget.dataset;
      this.triggerEvent('change', { value: id });
    }
  }
});
