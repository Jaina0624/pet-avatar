// 云函数：版型图纸生成
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// 简易版SVG生成（云函数中运行）
function generateSVG(measurements) {
  const { neck, chest, backLength, sizeTier } = measurements;
  const ease = { cat: 1.05, s_dog: 1.08, m_dog: 1.10, l_dog: 1.12 }[sizeTier] || 1.08;
  
  const bodyWidth = (chest * ease) / 2;
  const bodyLength = backLength * 1.15;
  const scale = 3;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500">
    <style>
      .outline { fill: #FFF5F5; stroke: #FF6B6B; stroke-width: 2; }
      .grainline { fill: none; stroke: #636E72; stroke-width: 1; stroke-dasharray: 8,4; }
      .label { font-family: sans-serif; font-size: 11px; fill: #636E72; }
    </style>
    <text class="label" x="20" y="20">宠物服装裁剪图 - 背心款</text>
    <text class="label" x="20" y="38">颈围:${neck}cm 胸围:${chest}cm 背长:${backLength}cm</text>
    <path class="outline" d="M 200,100 L ${200 + bodyWidth * scale},${100 + bodyLength * 0.3 * scale} L ${200 + bodyWidth * scale},${100 + bodyLength * 0.7 * scale} L ${200 + (bodyWidth-2) * scale},${100 + bodyLength * scale} L 200,${100 + bodyLength * scale} L ${200 - (bodyWidth-2) * scale},${100 + bodyLength * scale} L ${200 - bodyWidth * scale},${100 + bodyLength * 0.7 * scale} L ${200 - bodyWidth * scale},${100 + bodyLength * 0.3 * scale} Z" />
    <path class="grainline" d="M 200,${100 + bodyLength * 0.2 * scale} L 200,${100 + bodyLength * 0.8 * scale}" />
  </svg>`;
}

exports.main = async (event) => {
  const { measurements, styleId } = event;
  const svg = generateSVG(measurements);
  
  // 上传到云存储
  const result = await cloud.uploadFile({
    cloudPath: `patterns/${Date.now()}.svg`,
    fileContent: svg
  });

  return {
    code: 0,
    data: {
      svgUrl: result.fileID,
      svgContent: svg
    }
  };
};
