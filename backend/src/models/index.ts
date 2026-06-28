// 数据库模型定义 (Prisma Schema)
// 实际使用时需配合 prisma/schema.prisma

export interface User {
  id: string;
  openid: string;
  unionid?: string;
  nickName: string;
  avatarUrl: string;
  phone?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PetProfile {
  id: string;
  user_id: string;
  name: string;
  species: 'cat' | 'dog';
  breed: string;
  gender?: 'male' | 'female';
  age?: number;
  neck_cm: number;
  chest_cm: number;
  back_length_cm: number;
  waist_cm?: number;
  size_tier: string;
  photos: string[];
  model_3d_url?: string;
  model_status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: Date;
  updated_at: Date;
}

export interface CustomOrder {
  id: string;
  order_no: string;
  user_id: string;
  pet_profile_id: string;
  style_id: string;
  fabric_id?: string;
  options_json: Record<string, string>;
  pattern_svg_url?: string;
  preview_image_url?: string;
  base_price: number;
  size_surcharge: number;
  options_surcharge: number;
  total_price: number;
  status: 'pending' | 'paid' | 'producing' | 'shipping' | 'delivered' | 'cancelled' | 'completed';
  remark?: string;
  tracking_number?: string;
  logistics_info?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface PointsAccount {
  id: string;
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  created_at: Date;
  updated_at: Date;
}

export interface PointsTransaction {
  id: string;
  account_id: string;
  user_id: string;
  amount: number;
  type: 'earn' | 'spend';
  source: string;
  description: string;
  created_at: Date;
}

export interface CheckinRecord {
  id: string;
  user_id: string;
  checkin_date: string;
  streak: number;
  points_earned: number;
  created_at: Date;
}

export interface StyleDesign {
  id: string;
  name: string;
  description: string;
  image_url: string;
  base_price: number;
  model_3d_url?: string;
  pattern_design_id: string;
  is_active: boolean;
  created_at: Date;
}

export interface Fabric {
  id: string;
  name: string;
  category: string;
  thumb_url: string;
  texture_url: string;
  surcharge: number;
  is_active: boolean;
}
