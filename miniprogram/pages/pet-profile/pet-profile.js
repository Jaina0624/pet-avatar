// 宠物档案页面逻辑
const app = getApp();

// 品种数据
const BREED_DATA = {
  cat: ['英短', '美短', '布偶', '暹罗', '橘猫', '波斯', '加菲', '中华田园猫', '其他'],
  dog: {
    small: ['泰迪', '博美', '吉娃娃', '比熊', '约克夏', '雪纳瑞(迷你)', '其他小型犬'],
    medium: ['柯基', '柴犬', '法斗', '边牧', '哈士奇', '金毛(幼)', '其他中型犬'],
    large: ['金毛', '拉布拉多', '萨摩耶', '阿拉斯加', '德牧', '其他大型犬']
  }
};

// 体型档位匹配表
const SIZE_TIERS = [
  { key: 'cat', label: '猫咪档', neckRange: [15, 32], chestRange: [25, 42], backRange: [22, 38], ease: 1.05, desc: '适合大多数家猫' },
  { key: 's_dog', label: '小型犬档', neckRange: [18, 35], chestRange: [28, 48], backRange: [18, 32], ease: 1.08, desc: '泰迪/博美/吉娃娃等' },
  { key: 'm_dog', label: '中型犬档', neckRange: [28, 50], chestRange: [42, 65], backRange: [28, 48], ease: 1.10, desc: '柯基/柴犬/法斗等' },
  { key: 'l_dog', label: '大型犬档', neckRange: [38, 65], chestRange: [55, 90], backRange: [38, 65], ease: 1.12, desc: '金毛/拉布拉多等' }
];

Page({
  data: {
    isEdit: false,
    currentStep: 1,
    breedOptions: [],
    breedIndex: 0,
    form: {
      name: '',
      species: '',
      breed: '',
      gender: '',
      age: '',
      neck: '',
      chest: '',
      backLength: '',
      waist: ''
    },
    photos: {
      fullBody: '',
      frontFace: '',
      sideFace: ''
    },
    matchedTier: null,
    canSubmit: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ isEdit: true });
      this.loadPetProfile(options.id);
    }
  },

  // 加载已有宠物信息（纯演示）
  loadPetProfile(id) {
    console.log('演示模式：编辑宠物档案');
  },

  // 选择物种
  selectSpecies(e) {
    const species = e.currentTarget.dataset.species;
    this.setData({
      'form.species': species,
      'form.breed': '',
      breedIndex: 0
    });
    this.updateBreedOptions();
    this.matchSizeTier();
  },

  // 更新品种选项
  updateBreedOptions() {
    const { species } = this.data.form;
    let options = [];
    if (species === 'cat') {
      options = BREED_DATA.cat;
    } else if (species === 'dog') {
      options = [...BREED_DATA.dog.small, ...BREED_DATA.dog.medium, ...BREED_DATA.dog.large];
    }
    this.setData({ breedOptions: options });
  },

  // 品种选择
  onBreedChange(e) {
    const index = e.detail.value;
    this.setData({
      breedIndex: index,
      'form.breed': this.data.breedOptions[index]
    });
    this.matchSizeTier();
  },

  // 选择性别
  selectGender(e) {
    this.setData({ 'form.gender': e.currentTarget.dataset.gender });
  },

  // 输入变化
  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    this.setData({ [`form.${field}`]: value });
    
    // 尺寸字段变化时重新匹配体型
    if (['neck', 'chest', 'backLength', 'waist'].includes(field)) {
      this.matchSizeTier();
    }
    // 任何时候输入变化都检查表单完整性
    this.checkFormValid();
  },

  // 体型档位匹配
  matchSizeTier() {
    const { neck, chest, backLength } = this.data.form;
    if (!neck || !chest || !backLength) return;

    const n = parseFloat(neck);
    const c = parseFloat(chest);
    const b = parseFloat(backLength);

    let matched = null;
    for (const tier of SIZE_TIERS) {
      if (
        n >= tier.neckRange[0] && n <= tier.neckRange[1] &&
        c >= tier.chestRange[0] && c <= tier.chestRange[1] &&
        b >= tier.backRange[0] && b <= tier.backRange[1]
      ) {
        matched = tier;
        break;
      }
    }

    // 如果没有精确匹配，取最接近的
    if (!matched) {
      let minDist = Infinity;
      for (const tier of SIZE_TIERS) {
        const dist = Math.abs(n - (tier.neckRange[0] + tier.neckRange[1]) / 2) +
                     Math.abs(c - (tier.chestRange[0] + tier.chestRange[1]) / 2) +
                     Math.abs(b - (tier.backRange[0] + tier.backRange[1]) / 2);
        if (dist < minDist) {
          minDist = dist;
          matched = tier;
        }
      }
    }

    this.setData({ matchedTier: matched });
  },

  // 上传照片
  uploadPhoto(e) {
    const { type } = e.currentTarget.dataset;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        // 上传到云存储
        this.uploadToCloud(tempFilePath, type);
      }
    });
  },

  // 上传到云存储（纯本地预览）
  uploadToCloud(filePath, type) {
    this.setData({ [`photos.${type}`]: filePath });
    wx.showToast({ title: '预览模式：已选图片', icon: 'none' });
    // 照片上传后检查表单完整性
    this.checkFormValid();
  },

  // 显示测量教程
  showMeasureGuide() {
    wx.showModal({
      title: '测量教程',
      content: '1. 颈围：软尺绕过颈部最粗处，留1指空间\n2. 胸围：测量前腿后方胸部最宽处\n3. 背长：从肩胛骨到尾巴根部的直线距离\n4. 腰围：腹部最细处（选填）\n\n💡 建议宠物站立时测量更准确',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 步骤导航
  nextStep() {
    if (this.data.currentStep === 1) {
      if (!this.data.form.name || !this.data.form.species || !this.data.form.breed) {
        wx.showToast({ title: '请填写必填信息', icon: 'none' });
        return;
      }
    }
    if (this.data.currentStep === 2) {
      if (!this.data.photos.fullBody) {
        wx.showToast({ title: '请至少上传全身照', icon: 'none' });
        return;
      }
    }
    this.setData({ currentStep: this.data.currentStep + 1 });
    // 进入最后一步时检查表单完整性
    if (this.data.currentStep === 3) {
      this.checkFormValid();
    }
  },

  prevStep() {
    if (this.data.currentStep > 1) {
      this.setData({ currentStep: this.data.currentStep - 1 });
    }
  },

  // 检查表单完整性
  checkFormValid() {
    const { name, species, breed, neck, chest, backLength } = this.data.form;
    const hasPhotos = !!this.data.photos.fullBody;
    this.setData({
      canSubmit: !!(name && species && breed && neck && chest && backLength && hasPhotos)
    });
  },

  // 提交宠物档案（纯演示）
  submitProfile() {
    if (!this.data.canSubmit) return;
    wx.showLoading({ title: '保存中...' });
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: '演示模式：宠物档案已保存 ✓', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    }, 800);
  },

  // 请求3D模型生成（纯演示）
  request3DGeneration(petId) {
    console.log('演示模式：3D生成请求已记录');
  }
});
