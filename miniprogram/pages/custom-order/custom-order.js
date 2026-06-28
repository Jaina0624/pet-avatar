// 服装定制页面
const app = getApp();

Page({
  data: {
    customStep: 1,
    pets: [],
    selectedPet: null,

    // 款式
    styles: [
      { id: 1, name: '经典背心款', image: '/assets/images/style-vest.png', basePrice: 89, description: '百搭基础款，适合日常穿着' },
      { id: 2, name: '甜美连体衣', image: '/assets/images/style-onesie.png', basePrice: 129, description: '可爱连体设计，包裹性更好' },
      { id: 3, name: '运动四脚套', image: '/assets/images/style-sport.png', basePrice: 159, description: '四腿独立套筒，运动更自由' },
      { id: 4, name: '轻量雨衣款', image: '/assets/images/style-raincoat.png', basePrice: 139, description: '防水面料，雨天出行必备' }
    ],
    selectedStyle: null,

    // 布料
    fabricCategory: 'solid',
    fabricCategories: [
      { key: 'solid', label: '纯色系列' },
      { key: 'stripe', label: '条纹格子' },
      { key: 'floral', label: '碎花波点' },
      { key: 'cartoon', label: '卡通图案' },
      { key: 'holiday', label: '节日主题' }
    ],
    allFabrics: [
      // 纯色
      { id: 1, name: '樱花粉', thumb: '/assets/textures/solid-pink.png', category: 'solid', surcharge: 0 },
      { id: 2, name: '天空蓝', thumb: '/assets/textures/solid-blue.png', category: 'solid', surcharge: 0 },
      { id: 3, name: '薄荷绿', thumb: '/assets/textures/solid-green.png', category: 'solid', surcharge: 0 },
      { id: 4, name: '奶油白', thumb: '/assets/textures/solid-white.png', category: 'solid', surcharge: 0 },
      { id: 5, name: '经典黑', thumb: '/assets/textures/solid-black.png', category: 'solid', surcharge: 0 },
      // 条纹格子
      { id: 6, name: '蓝白条纹', thumb: '/assets/textures/stripe-blue.png', category: 'stripe', surcharge: 15 },
      { id: 7, name: '红黑格子', thumb: '/assets/textures/plaid-red.png', category: 'stripe', surcharge: 15 },
      { id: 8, name: '粉白细条', thumb: '/assets/textures/stripe-pink.png', category: 'stripe', surcharge: 15 },
      // 碎花
      { id: 9, name: '小雏菊', thumb: '/assets/textures/floral-daisy.png', category: 'floral', surcharge: 15 },
      { id: 10, name: '樱花粉点', thumb: '/assets/textures/polka-pink.png', category: 'floral', surcharge: 15 },
      { id: 11, name: '玫瑰碎花', thumb: '/assets/textures/floral-rose.png', category: 'floral', surcharge: 20 },
      // 卡通
      { id: 12, name: '爪印图案', thumb: '/assets/textures/paw-print.png', category: 'cartoon', surcharge: 20 },
      { id: 13, name: '骨头图案', thumb: '/assets/textures/bone-pattern.png', category: 'cartoon', surcharge: 20 },
      { id: 14, name: '小鱼图案', thumb: '/assets/textures/fish-pattern.png', category: 'cartoon', surcharge: 20 },
      // 节日
      { id: 15, name: '圣诞雪花', thumb: '/assets/textures/xmas-snow.png', category: 'holiday', surcharge: 25 },
      { id: 16, name: '新年红色', thumb: '/assets/textures/cny-red.png', category: 'holiday', surcharge: 25 }
    ],
    filteredFabrics: [],
    selectedFabric: null,

    // 定制选项
    collarOptions: [
      { id: 'round', name: '圆领', surcharge: 0, default: true },
      { id: 'vneck', name: 'V领', surcharge: 10 },
      { id: 'stand', name: '立领', surcharge: 15 },
      { id: 'bow', name: '蝴蝶结领', surcharge: 20 }
    ],
    laceOptions: [
      { id: 'none', name: '无花边', surcharge: 0, default: true },
      { id: 'lace', name: '蕾丝花边', surcharge: 15 },
      { id: 'ruffle', name: '荷叶边', surcharge: 20 }
    ],
    cuffOptions: [
      { id: 'normal', name: '常规袖口', surcharge: 0, default: true },
      { id: 'ribbed', name: '螺纹收口', surcharge: 10 },
      { id: 'folded', name: '翻边袖口', surcharge: 15 }
    ],
    zipperOptions: [
      { id: 'velcro', name: '魔术贴', surcharge: 0, default: true },
      { id: 'zipper', name: '树脂拉链', surcharge: 10 },
      { id: 'buckle', name: '金属卡扣', surcharge: 20 }
    ],
    decorationOptions: [
      { id: 'none', name: '无装饰', surcharge: 0, default: true },
      { id: 'embroidery', name: '刺绣名字', surcharge: 30 },
      { id: 'sequin', name: '亮片珠饰', surcharge: 25 },
      { id: 'reflective', name: '反光条', surcharge: 15 }
    ],
    selectedOptions: {
      collar: 'round',
      lace: 'none',
      cuff: 'normal',
      zipper: 'velcro',
      decoration: 'none'
    },
    selectedOptionsList: [],

    // 价格
    sizeSurcharge: 0,
    totalPrice: 0,
    remark: ''
  },

  onLoad(options) {
    if (options.styleId) {
      const style = this.data.styles.find(s => s.id === parseInt(options.styleId));
      if (style) {
        this.setData({ selectedStyle: style, customStep: 2 });
      }
    }
    this.loadPets();
    this.filterFabrics();
  },

  loadPets() {
    // 演示数据
    const mockPets = [
      { id: 'mock-cat', name: '奶糖', species: 'cat', breed: '英短', neck_cm: 24, chest_cm: 34, back_length_cm: 30, waist_cm: 22, size_tier: 'cat', photos: ['/assets/images/style-vest.png'] },
      { id: 'mock-dog', name: '毛毛', species: 'dog', breed: '柯基', neck_cm: 36, chest_cm: 52, back_length_cm: 38, size_tier: 'm_dog', photos: ['/assets/images/style-onesie.png'] }
    ];
    this.setData({ pets: mockPets });

    wx.request({
      url: `${app.globalData.baseUrl}/api/pets`,
      header: { Authorization: `Bearer ${app.globalData.token}` },
      timeout: 3000,
      success: (res) => {
        if (res.data && res.data.code === 0 && res.data.data && res.data.data.length > 0) {
          this.setData({ pets: res.data.data });
        }
      },
      fail: () => {}
    });
  },

  // 步骤导航
  goStep(e) {
    const step = parseInt(e.currentTarget.dataset.step);
    if (step < this.data.customStep) {
      this.setData({ customStep: step });
    }
  },

  nextStep() {
    this.setData({ customStep: this.data.customStep + 1 });
  },
  prevStep() {
    if (this.data.customStep > 1) {
      this.setData({ customStep: this.data.customStep - 1 });
    }
  },

  // 选择宠物
  selectPet(e) {
    const pet = e.currentTarget.dataset.pet;
    this.setData({ selectedPet: pet });
    // 计算尺寸加价
    const tierSurcharge = { cat: 0, s_dog: 0, m_dog: 10, l_dog: 20 };
    this.setData({ sizeSurcharge: tierSurcharge[pet.size_tier] || 0 });
  },

  // 选择款式
  selectStyle(e) {
    this.setData({ selectedStyle: e.currentTarget.dataset.style });
  },

  // 布料筛选
  switchFabricCategory(e) {
    this.setData({ fabricCategory: e.currentTarget.dataset.key });
    this.filterFabrics();
  },

  filterFabrics() {
    const filtered = this.data.allFabrics.filter(f => f.category === this.data.fabricCategory);
    this.setData({ filteredFabrics: filtered });
  },

  // 选择布料
  selectFabric(e) {
    const fabric = e.currentTarget.dataset.fabric;
    this.setData({ selectedFabric: fabric });
    // TODO: 触发3D预览纹理更新
    this.updateFabricPreview(fabric);
  },

  updateFabricPreview(fabric) {
    // 更新3D模型上的布料纹理
    // 通过postMessage与3D渲染层通信
  },

  // 选项变更
  onOptionChange(e) {
    const { category } = e.currentTarget.dataset;
    const { value } = e.detail;
    this.setData({ [`selectedOptions.${category}`]: value });
    this.updateSelectedOptionsList();
    this.calculateTotal();
  },

  updateSelectedOptionsList() {
    const optionsMap = {
      collar: { options: this.data.collarOptions, label: '衣领' },
      lace: { options: this.data.laceOptions, label: '花边' },
      cuff: { options: this.data.cuffOptions, label: '袖口' },
      zipper: { options: this.data.zipperOptions, label: '拉链' },
      decoration: { options: this.data.decorationOptions, label: '装饰' }
    };

    const list = Object.entries(this.data.selectedOptions)
      .filter(([key, val]) => {
        const opt = optionsMap[key].options.find(o => o.id === val);
        return opt && opt.surcharge > 0;
      })
      .map(([key, val]) => {
        const config = optionsMap[key];
        const opt = config.options.find(o => o.id === val);
        return {
          category: key,
          label: config.label,
          name: opt.name,
          surcharge: opt.surcharge
        };
      });

    this.setData({ selectedOptionsList: list });
  },

  // 计算总价
  calculateTotal() {
    const { selectedStyle, selectedFabric, selectedOptions, sizeSurcharge } = this.data;
    if (!selectedStyle) return;

    let total = selectedStyle.basePrice;
    total += sizeSurcharge;
    total += (selectedFabric?.surcharge || 0);

    const allOptions = [
      ...this.data.collarOptions,
      ...this.data.laceOptions,
      ...this.data.cuffOptions,
      ...this.data.zipperOptions,
      ...this.data.decorationOptions
    ];

    Object.values(selectedOptions).forEach(optId => {
      const opt = allOptions.find(o => o.id === optId);
      if (opt) total += opt.surcharge;
    });

    this.setData({ totalPrice: total });
  },

  onTotalChange(e) {
    this.setData({ totalPrice: e.detail.total });
  },

  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

  // 提交订单（API失败时演示跳转）
  submitOrder() {
    if (!this.data.selectedPet || !this.data.selectedStyle) {
      wx.showToast({ title: '请完成所有选择', icon: 'none' });
      return;
    }

    const orderData = {
      pet_profile_id: this.data.selectedPet.id,
      style_id: this.data.selectedStyle.id,
      fabric_id: this.data.selectedFabric?.id,
      options: this.data.selectedOptions,
      total_price: this.data.totalPrice,
      remark: this.data.remark
    };

    wx.showLoading({ title: '提交中...' });

    wx.request({
      url: `${app.globalData.baseUrl}/api/orders`,
      method: 'POST',
      header: { Authorization: `Bearer ${app.globalData.token}` },
      data: orderData,
      timeout: 3000,
      success: (res) => {
        wx.hideLoading();
        if (res.data && res.data.code === 0) {
          wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${res.data.data.id}&needPay=true` });
        } else {
          wx.showToast({ title: res.data?.msg || '下单失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.hideLoading();
        // 离线模式：演示成功
        wx.showToast({ title: '演示模式：订单已提交 ✓', icon: 'success' });
        wx.setStorageSync('mockOrder', orderData);
        setTimeout(() => {
          wx.navigateTo({ url: '/pages/order-detail/order-detail?id=mock-order&needPay=true' });
        }, 1000);
      }
    });
  },

  goToPetProfile() {
    wx.navigateTo({ url: '/pages/pet-profile/pet-profile' });
  }
});
