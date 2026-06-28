// 云函数：3D模型生成
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const { petId, photos } = event;
  
  try {
    // 调用Tripo API生成3D模型
    const response = await cloud.openapi.cloudbase.request({
      url: 'https://api.tripo3d.ai/api/v1/image-to-model',
      method: 'POST',
      data: {
        image_url: photos[0],
        model_type: 'glb',
        texture: true,
        animal_specific: true
      }
    });

    return { code: 0, data: response.data };
  } catch (err) {
    return { code: -1, msg: err.message };
  }
};
