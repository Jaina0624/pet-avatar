// 3D模型预览页面
const app = getApp();

// 演示宠物数据（离线模式）
const MOCK_PET = {
  name: '奶糖',
  breed: '英短',
  photos: ['/assets/images/style-vest.png'],
  size_tier: 'cat',
  model_3d_url: ''
};

Page({
  data: {
    loading: true,
    modelUrl: '',
    petInfo: null,
    animating: true,
    arSupported: false,
    dressItems: [
      { id: 1, name: '蝴蝶结', icon: '/assets/icons/bow.png', price: 50, equipped: false },
      { id: 2, name: '小帽子', icon: '/assets/icons/hat.png', price: 80, equipped: false },
      { id: 3, name: '围巾', icon: '/assets/icons/scarf.png', price: 60, equipped: false },
      { id: 4, name: '小眼镜', icon: '/assets/icons/glasses.png', price: 100, equipped: false },
      { id: 5, name: '天使翅膀', icon: '/assets/icons/wings.png', price: 200, equipped: false },
      { id: 6, name: '领结', icon: '/assets/icons/bowtie.png', price: 0, equipped: false }
    ]
  },

  // 3D渲染器引用
  _renderer: null,
  _model: null,

  onLoad() {
    this.checkARSupport();
    this.loadLatestPet();
  },

  onUnload() {
    if (this._renderer) {
      this._renderer.dispose();
      this._renderer = null;
    }
  },

  checkARSupport() {
    const { SDKVersion } = wx.getSystemInfoSync();
    const supported = this.compareVersion(SDKVersion, '2.20.0') >= 0;
    this.setData({ arSupported: supported });
  },

  compareVersion(v1, v2) {
    const arr1 = v1.split('.');
    const arr2 = v2.split('.');
    for (let i = 0; i < Math.max(arr1.length, arr2.length); i++) {
      const a = parseInt(arr1[i]) || 0;
      const b = parseInt(arr2[i]) || 0;
      if (a > b) return 1;
      if (a < b) return -1;
    }
    return 0;
  },

  // 加载最近的宠物（API失败时用演示数据）
  loadLatestPet() {
    // 先用演示数据展示
    const pet = MOCK_PET;
    this.setData({
      petInfo: {
        name: pet.name,
        breed: pet.breed,
        avatar: pet.photos[0],
        sizeTierLabel: this.getSizeTierLabel(pet.size_tier)
      },
      modelUrl: '',
      loading: false
    });

    // 尝试从后端加载
    wx.request({
      url: `${app.globalData.baseUrl}/api/pets/latest`,
      header: { Authorization: `Bearer ${app.globalData.token}` },
      timeout: 3000,
      success: (res) => {
        if (res.data && res.data.code === 0 && res.data.data) {
          const pet = res.data.data;
          this.setData({
            petInfo: {
              name: pet.name,
              breed: pet.breed,
              avatar: pet.photos?.[0] || '',
              sizeTierLabel: this.getSizeTierLabel(pet.size_tier)
            }
          });
          if (pet.model_3d_url) {
            this.setData({ modelUrl: pet.model_3d_url });
            this.init3DViewer(pet.model_3d_url);
          }
        }
      },
      fail: () => {
        console.log('后端未部署，使用演示数据');
      }
    });
  },

  getSizeTierLabel(tier) {
    const map = { cat: '猫咪档', s_dog: '小型犬档', m_dog: '中型犬档', l_dog: '大型犬档' };
    return map[tier] || '未知';
  },

  // 初始化3D查看器（离线模式提示安装threejs-miniprogram）
  async init3DViewer(modelUrl) {
    try {
      // 动态加载threejs-miniprogram（需先 npm install）
      const THREE = require('../../utils/three.js');
      const { GLTFLoader } = require('../../utils/GLTFLoader.js');
      
      const canvas = wx.createOffscreenCanvas({ type: 'webgl', width: 750, height: 750 });
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
      renderer.setSize(750, 750);
      renderer.setPixelRatio(app.globalData.systemInfo?.pixelRatio || 2);
      
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.set(0, 0.8, 3);
      
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
      directionalLight.position.set(1, 2, 3);
      scene.add(directionalLight);
      
      const loader = new GLTFLoader();
      const gltf = await loader.loadAsync(modelUrl);
      this._model = gltf.scene;
      scene.add(this._model);
      
      const animate = () => {
        if (this.data.animating && this._model) this._model.rotation.y += 0.005;
        renderer.render(scene, camera);
        if (this._running) canvas.requestAnimationFrame(animate);
      };
      
      this._renderer = { renderer, scene, camera, animate, canvas, dispose: () => {
        this._running = false;
        renderer.dispose();
      }};
      
      this._running = true;
      this._renderer.animate();
      this.setData({ loading: false });
      
    } catch (err) {
      console.error('3D模块未安装:', err.message);
      this.setData({ loading: false });
      // 不弹toast，让页面显示空状态提示即可
    }
  },

  // 触摸交互
  onTouchStart(e) {
    this._touchStart = e.touches[0];
  },
  onTouchMove(e) {
    if (!this._touchStart || !this._model) return;
    const touch = e.touches[0];
    const dx = touch.clientX - this._touchStart.clientX;
    const dy = touch.clientY - this._touchStart.clientY;
    this._model.rotation.y += dx * 0.01;
    this._model.rotation.x += dy * 0.01;
    this._touchStart = touch;
  },
  onTouchEnd() {
    this._touchStart = null;
  },

  resetView() {
    if (this._model) this._model.rotation.set(0, 0, 0);
  },

  toggleAnimation() {
    this.setData({ animating: !this.data.animating });
  },

  takeSnapshot() {
    if (this._renderer) {
      wx.canvasToTempFilePath({
        canvas: this._renderer.canvas,
        success: (res) => {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => wx.showToast({ title: '已保存到相册', icon: 'success' })
          });
        }
      });
    } else {
      wx.showToast({ title: '暂无3D模型可截图', icon: 'none' });
    }
  },

  toggleAR() {
    wx.showToast({ title: 'AR功能开发中', icon: 'none' });
  },

  toggleDress(e) {
    const { id } = e.currentTarget.dataset;
    const items = this.data.dressItems.map(item => {
      if (item.id === id) return { ...item, equipped: !item.equipped };
      return item;
    });
    this.setData({ dressItems: items });
  },

  downloadDesktopPet() {
    wx.showModal({
      title: '下载电子桌宠',
      content: '请用电脑浏览器访问 petavatar.cn/download 下载桌面版，登录后即可同步您的宠物形象',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  goToPetProfile() {
    wx.navigateTo({ url: '/pages/pet-profile/pet-profile' });
  }
});
