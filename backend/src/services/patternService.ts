// 宠物版型制图服务 - 基于FreeSewing核心算法实现
// 本文件实现宠物服装参数化制版引擎

interface PetMeasurements {
  neck: number;      // 颈围 cm
  chest: number;     // 胸围 cm
  backLength: number; // 背长 cm
  waist?: number;    // 腰围 cm
  sizeTier: string;  // 体型档位
}

interface PatternPart {
  name: string;
  paths: PatternPath[];
  points: PatternPoint[];
}

interface PatternPoint {
  x: number;
  y: number;
  label?: string;
}

interface PatternPath {
  points: number[][];  // [[x,y], [x,y], ...]
  closed: boolean;
  type: 'outline' | 'grainline' | 'foldline' | 'seamallowance' | 'annotation';
}

// 体型档位 ease 系数
const EASE_FACTORS: Record<string, number> = {
  cat: 1.05,
  s_dog: 1.08,
  m_dog: 1.10,
  l_dog: 1.12
};

/**
 * 生成宠物背心款裁剪图纸
 * 基于真实宠物尺寸参数化计算裁片几何
 */
function draftVestPattern(m: PetMeasurements): PatternPart[] {
  const ease = EASE_FACTORS[m.sizeTier] || 1.08;
  
  // 核心计算
  const bodyWidth = (m.chest * ease) / 2;        // 身体半宽（单片）
  const bodyLength = m.backLength * 1.15;          // 衣长（含余量）
  const neckHole = m.neck / (2 * Math.PI) * ease;  // 领口半径
  const legHole = 8;  // 前腿开口半径 cm
  const seamAllowance = 1;  // 缝份 cm

  const parts: PatternPart[] = [];

  // ===== 前片 (Front Body) =====
  const frontPoints: PatternPoint[] = [
    { x: 0, y: 0, label: '领口中点' },
    { x: neckHole, y: 0, label: '领口右' },
    { x: bodyWidth, y: bodyLength * 0.3, label: '右腋下' },
    { x: bodyWidth, y: bodyLength * 0.7, label: '右腰' },
    { x: bodyWidth - 2, y: bodyLength, label: '右下摆' },
    { x: 0, y: bodyLength, label: '下摆中点' },
    { x: -neckHole, y: 0, label: '领口左' },
    { x: -bodyWidth, y: bodyLength * 0.3, label: '左腋下' },
    { x: -bodyWidth, y: bodyLength * 0.7, label: '左腰' },
    { x: -(bodyWidth - 2), y: bodyLength, label: '左下摆' },
  ];

  const frontOutline: PatternPath = {
    points: [
      [0, -neckHole],
      [neckHole, 0],
      [bodyWidth, bodyLength * 0.3],
      [bodyWidth, bodyLength * 0.7],
      [bodyWidth - 2, bodyLength],
      [0, bodyLength],
      [-(bodyWidth - 2), bodyLength],
      [-bodyWidth, bodyLength * 0.7],
      [-bodyWidth, bodyLength * 0.3],
      [-neckHole, 0],
    ],
    closed: true,
    type: 'outline'
  };

  // 缝份线
  const frontSeamAllowance: PatternPath = {
    points: frontOutline.points.map(([x, y]) => {
      // 向外偏移 seamAllowance
      const dist = Math.sqrt(x * x + y * y) || 1;
      const scale = (dist + seamAllowance) / dist;
      return [x * scale, y * scale];
    }),
    closed: true,
    type: 'seamallowance'
  };

  // 纱向线
  const frontGrainline: PatternPath = {
    points: [[0, bodyLength * 0.2], [0, bodyLength * 0.8]],
    closed: false,
    type: 'grainline'
  };

  parts.push({
    name: '前片',
    paths: [frontOutline, frontSeamAllowance, frontGrainline],
    points: frontPoints
  });

  // ===== 后片 (Back Body) =====
  // 后片与前片类似，但领口略高
  const backNeckHole = neckHole * 0.85;
  const backOutline: PatternPath = {
    points: [
      [0, -backNeckHole],
      [backNeckHole, 0],
      [bodyWidth, bodyLength * 0.3],
      [bodyWidth, bodyLength * 0.7],
      [bodyWidth - 2, bodyLength],
      [0, bodyLength],
      [-(bodyWidth - 2), bodyLength],
      [-bodyWidth, bodyLength * 0.7],
      [-bodyWidth, bodyLength * 0.3],
      [-backNeckHole, 0],
    ],
    closed: true,
    type: 'outline'
  };

  const backGrainline: PatternPath = {
    points: [[0, bodyLength * 0.2], [0, bodyLength * 0.8]],
    closed: false,
    type: 'grainline'
  };

  parts.push({
    name: '后片',
    paths: [backOutline, backGrainline],
    points: frontPoints.map(p => ({ ...p }))
  });

  // ===== 前腿开口 (Leg Holes) =====
  const legCenterX = bodyWidth * 0.6;
  const legCenterY = bodyLength * 0.25;
  const legCircle: PatternPath = {
    points: generateCirclePoints(legCenterX, legCenterY, legHole, 24),
    closed: true,
    type: 'outline'
  };

  // 添加到前片
  parts[0].paths.push(legCircle);
  parts[0].paths.push({
    points: generateCirclePoints(-legCenterX, legCenterY, legHole, 24),
    closed: true,
    type: 'outline'
  });

  return parts;
}

/**
 * 生成圆形路径点
 */
function generateCirclePoints(cx: number, cy: number, r: number, segments: number): number[][] {
  const points: number[][] = [];
  for (let i = 0; i < segments; i++) {
    const angle = (2 * Math.PI * i) / segments;
    points.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  return points;
}

/**
 * 将PatternPart转为SVG字符串
 */
function partsToSVG(parts: PatternPart[], measurements: PetMeasurements): string {
  const padding = 40;
  const scale = 3; // px per cm
  let maxX = 0, maxY = 0;
  
  // 计算画布大小
  for (const part of parts) {
    for (const path of part.paths) {
      for (const [x, y] of path.points) {
        maxX = Math.max(maxX, Math.abs(x) * scale + padding * 2);
        maxY = Math.max(maxY, Math.abs(y) * scale + padding * 2);
      }
    }
  }

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${maxX * 2} ${maxY}" width="100%" height="100%">`;
  svg += `<style>
    .outline { fill: #FFF5F5; stroke: #FF6B6B; stroke-width: 2; }
    .seamallowance { fill: none; stroke: #FFB3B3; stroke-width: 1; stroke-dasharray: 4,4; }
    .grainline { fill: none; stroke: #636E72; stroke-width: 1; stroke-dasharray: 8,4; }
    .annotation { fill: none; stroke: #B2BEC3; stroke-width: 0.5; }
    .label { font-family: sans-serif; font-size: 10px; fill: #636E72; }
    .title { font-family: sans-serif; font-size: 14px; font-weight: bold; fill: #2D3436; }
  </style>`;

  // 绘制每个裁片
  let offsetX = padding;
  for (const part of parts) {
    svg += `<g transform="translate(${offsetX}, ${padding})">`;
    
    // 标题
    svg += `<text class="title" x="${0}" y="-15">${part.name}</text>`;
    
    // 路径
    for (const path of part.paths) {
      const d = path.points.map((p, i) => {
        const cmd = i === 0 ? 'M' : 'L';
        return `${cmd} ${p[0] * scale},${p[1] * scale}`;
      }).join(' ') + (path.closed ? ' Z' : '');
      
      svg += `<path class="${path.type}" d="${d}" />`;
    }

    // 标注点
    for (const point of part.points) {
      if (point.label) {
        svg += `<text class="label" x="${point.x * scale + 5}" y="${point.y * scale - 5}">${point.label}</text>`;
      }
    }

    svg += '</g>';
    offsetX += maxX;
  }

  // 尺寸信息
  svg += `<text class="label" x="${padding}" y="${maxY - 15}">`;
  svg += `颈围:${measurements.neck}cm | 胸围:${measurements.chest}cm | 背长:${measurements.backLength}cm | 体型:${measurements.sizeTier}`;
  svg += '</text>';

  svg += '</svg>';
  return svg;
}

/**
 * 主入口：根据尺寸和款式生成裁剪图SVG
 */
export async function generatePattern(
  measurements: PetMeasurements,
  styleId: number
): Promise<string> {
  let parts: PatternPart[];

  switch (styleId) {
    case 1: // 经典背心款
      parts = draftVestPattern(measurements);
      break;
    case 2: // 连体衣
      parts = draftVestPattern(measurements); // TODO: 实现连体衣版型
      break;
    case 3: // 四脚套
      parts = draftVestPattern(measurements); // TODO: 实现四脚套版型
      break;
    default:
      parts = draftVestPattern(measurements);
  }

  return partsToSVG(parts, measurements);
}

/**
 * 为订单生成裁剪图纸
 */
export async function draftPattern(order: any): Promise<void> {
  // TODO: 从订单中提取宠物尺寸和款式
  const measurements: PetMeasurements = {
    neck: 28,
    chest: 45,
    backLength: 35,
    sizeTier: 'm_dog'
  };

  const svg = await generatePattern(measurements, 1);
  
  // TODO: 上传SVG到COS并更新订单
  console.log('裁剪图纸已生成', svg.length, 'bytes');
}
