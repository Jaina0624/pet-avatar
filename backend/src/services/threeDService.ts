// 3D模型生成服务
import axios from 'axios';
import { config } from '../config';

/**
 * 调用Tripo API生成3D模型
 * 支持单张/多张图片生成glb模型
 */
export async function generate3DModel(pet: {
  id: string;
  photos: string[];
  species: string;
  breed: string;
}): Promise<string | null> {
  try {
    console.log(`[3D生成] 开始为宠物 ${pet.id} 生成3D模型`);

    // 选择最佳照片（优先全身照）
    const imageUrl = pet.photos[0];
    if (!imageUrl) {
      console.error('[3D生成] 无可用照片');
      return null;
    }

    // 调用Tripo API
    const response = await axios.post(
      `${config.tripo.apiUrl}/api/v1/image-to-model`,
      {
        image_url: imageUrl,
        model_type: 'glb',
        texture: true,
        animal_specific: true  // 动物专用模式
      },
      {
        headers: {
          'Authorization': `Bearer ${config.tripo.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 120000
      }
    );

    if (response.data?.data?.model_url) {
      const modelUrl = response.data.data.model_url;
      console.log(`[3D生成] 成功: ${modelUrl}`);

      // TODO: 下载模型，进行后处理（减面/压缩/Draco）
      // TODO: 上传到COS
      // TODO: 更新宠物档案的 model_3d_url

      return modelUrl;
    }

    console.error('[3D生成] API返回无模型URL');
    return null;
  } catch (err: any) {
    console.error('[3D生成] 失败:', err.message);
    // TODO: 更新宠物档案状态为 failed
    return null;
  }
}

/**
 * 模型后处理（模拟）
 * 实际部署时需要：
 * 1. 下载glb
 * 2. 运行gltfpack减面
 * 3. Draco压缩
 * 4. 纹理降级到1024
 * 5. 上传到COS
 */
export async function postProcessModel(modelUrl: string, petId: string): Promise<string> {
  console.log(`[后处理] 开始处理宠物 ${petId} 的模型`);

  // TODO: 实际后处理流程
  // const glb = await download(modelUrl);
  // const optimized = await gltfpack(glb, { triangles: 50000 });
  // const dracoCompressed = await draco(optimized);
  // const cosUrl = await uploadToCOS(dracoCompressed);

  return modelUrl;
}
