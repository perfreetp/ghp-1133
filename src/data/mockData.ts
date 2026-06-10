import type {
  User,
  Store,
  DisplayStandard,
  InspectionTask,
  RectificationOrder,
  ReplenishmentSuggestion,
  StoreScore,
  Shelf,
  HeatmapZone,
  InspectionItem,
  PhotoRecord,
  IssueRecord,
} from '../types';

export const mockUsers: User[] = [
  {
    id: 'U001',
    username: 'zhangjian',
    name: '张健',
    role: 'supervisor',
    phone: '13800138001',
    email: 'zhangjian@retail.com',
    region: '上海浦东区',
    createdAt: '2024-01-15 09:00:00',
    lastLoginAt: '2026-06-10 08:30:00',
    status: 'active',
  },
  {
    id: 'U002',
    username: 'liming',
    name: '李明',
    role: 'supervisor',
    phone: '13800138002',
    email: 'liming@retail.com',
    region: '上海浦西区',
    createdAt: '2024-02-20 10:00:00',
    lastLoginAt: '2026-06-09 17:45:00',
    status: 'active',
  },
  {
    id: 'U003',
    username: 'wangfang',
    name: '王芳',
    role: 'storeManager',
    phone: '13900139001',
    email: 'wangfang@retail.com',
    storeId: 'S001',
    createdAt: '2024-03-01 09:00:00',
    lastLoginAt: '2026-06-10 07:50:00',
    status: 'active',
  },
  {
    id: 'U004',
    username: 'chenwei',
    name: '陈伟',
    role: 'storeManager',
    phone: '13900139002',
    email: 'chenwei@retail.com',
    storeId: 'S002',
    createdAt: '2024-03-05 09:00:00',
    lastLoginAt: '2026-06-09 20:15:00',
    status: 'active',
  },
  {
    id: 'U005',
    username: 'liuyang',
    name: '刘洋',
    role: 'storeManager',
    phone: '13900139003',
    email: 'liuyang@retail.com',
    storeId: 'S003',
    createdAt: '2024-03-10 09:00:00',
    lastLoginAt: '2026-06-10 08:10:00',
    status: 'active',
  },
  {
    id: 'U006',
    username: 'zhaohua',
    name: '赵华',
    role: 'storeManager',
    phone: '13900139004',
    email: 'zhaohua@retail.com',
    storeId: 'S004',
    createdAt: '2024-03-15 09:00:00',
    lastLoginAt: '2026-06-08 19:30:00',
    status: 'active',
  },
  {
    id: 'U007',
    username: 'sunli',
    name: '孙丽',
    role: 'storeManager',
    phone: '13900139005',
    email: 'sunli@retail.com',
    storeId: 'S005',
    createdAt: '2024-03-20 09:00:00',
    lastLoginAt: '2026-06-10 06:45:00',
    status: 'active',
  },
];

const generateShelves = (storeId: string): Shelf[] => {
  const baseShelves = [
    { name: '饮料主货架', code: 'A01', type: 'shelf' as const, category: 'drinks' as const },
    { name: '饮料端架', code: 'A02', type: 'endCap' as const, category: 'drinks' as const },
    { name: '零食主货架', code: 'B01', type: 'shelf' as const, category: 'snacks' as const },
    { name: '零食端架', code: 'B02', type: 'endCap' as const, category: 'snacks' as const },
    { name: '日用品货架', code: 'C01', type: 'shelf' as const, category: 'daily' as const },
    { name: '鲜食冷柜', code: 'D01', type: 'shelf' as const, category: 'fresh' as const },
    { name: '冷冻冰柜', code: 'E01', type: 'shelf' as const, category: 'frozen' as const },
    { name: '收银台货架', code: 'F01', type: 'checkout' as const, category: 'snacks' as const },
    { name: '促销堆头1', code: 'G01', type: 'promotion' as const, category: 'drinks' as const },
    { name: '促销堆头2', code: 'G02', type: 'promotion' as const, category: 'snacks' as const },
  ];

  const positions = [
    { x: 50, y: 50, r: 0 }, { x: 180, y: 50, r: 0 },
    { x: 50, y: 180, r: 0 }, { x: 180, y: 180, r: 90 },
    { x: 310, y: 50, r: 0 }, { x: 310, y: 180, r: 0 },
    { x: 440, y: 50, r: 0 }, { x: 440, y: 280, r: 0 },
    { x: 100, y: 350, r: 0 }, { x: 280, y: 350, r: 0 },
  ];

  const seed = parseInt(storeId.replace('S', ''));
  return baseShelves.map((s, idx) => {
    const capacity = 60 + Math.floor(Math.random() * 60);
    const fillVariance = (seed * 13 + idx * 7) % 100;
    const currentFill = Math.max(0, Math.min(capacity, capacity - fillVariance));
    return {
      id: `${storeId}-SH${idx + 1}`,
      storeId,
      name: s.name,
      code: `${storeId}-${s.code}`,
      type: s.type,
      floor: 1,
      layers: 4 + (idx % 3),
      width: 120 + (idx % 2) * 40,
      height: 180 + (idx % 3) * 20,
      positionX: positions[idx].x,
      positionY: positions[idx].y,
      rotation: positions[idx].r,
      category: s.category,
      capacity,
      currentFill,
      status: currentFill / capacity > 0.8 ? 'normal' : currentFill / capacity > 0.4 ? 'partial' : 'empty',
    };
  });
};

const generateHeatmapData = (storeId: string): HeatmapZone[] => {
  const zones = [
    { name: '入口区域', type: 'high' as const },
    { name: '饮料区', type: 'medium' as const },
    { name: '零食区', type: 'high' as const },
    { name: '收银台区', type: 'high' as const },
    { name: '鲜食区', type: 'medium' as const },
    { name: '日用品区', type: 'low' as const },
    { name: '冷冻区', type: 'low' as const },
    { name: '促销区', type: 'high' as const },
  ];

  const positions = [
    { x: 20, y: 20, w: 80, h: 60 },
    { x: 30, y: 40, w: 120, h: 80 },
    { x: 30, y: 170, w: 120, h: 80 },
    { x: 420, y: 260, w: 100, h: 80 },
    { x: 290, y: 40, w: 120, h: 80 },
    { x: 290, y: 170, w: 120, h: 80 },
    { x: 420, y: 40, w: 100, h: 80 },
    { x: 80, y: 330, w: 240, h: 60 },
  ];

  const seed = parseInt(storeId.replace('S', ''));
  return zones.map((z, idx) => {
    const base = z.type === 'high' ? 800 : z.type === 'medium' ? 500 : 250;
    return {
      id: `${storeId}-HZ${idx + 1}`,
      storeId,
      name: z.name,
      type: z.type,
      positionX: positions[idx].x,
      positionY: positions[idx].y,
      width: positions[idx].w,
      height: positions[idx].h,
      avgFootTraffic: base + ((seed * 17 + idx * 23) % 200),
      peakFootTraffic: Math.floor(base * 1.8 + ((seed * 31 + idx * 19) % 300)),
      conversionRate: +(0.25 + ((seed * 7 + idx * 11) % 30) / 100).toFixed(3),
      timePeriod: 'all',
    };
  });
};

const storeBaseData = [
  { id: 'S001', name: '陆家嘴旗舰店', code: 'SH-LJZ-001', address: '浦东新区陆家嘴环路1000号', district: '浦东新区', area: 180, storeType: 'flagship' as const, latitude: 31.2397, longitude: 121.4998, managerId: 'U003', managerName: '王芳', supervisorId: 'U001', supervisorName: '张健', openDate: '2022-06-18', avgScore: 92, status: 'normal' as const },
  { id: 'S002', name: '人民广场中心店', code: 'SH-RMGC-002', address: '黄浦区南京东路200号', district: '黄浦区', area: 150, storeType: 'standard' as const, latitude: 31.2304, longitude: 121.4737, managerId: 'U004', managerName: '陈伟', supervisorId: 'U001', supervisorName: '张健', openDate: '2022-08-05', avgScore: 88, status: 'normal' as const },
  { id: 'S003', name: '徐家汇商圈店', code: 'SH-XJH-003', address: '徐汇区衡山路900号', district: '徐汇区', area: 120, storeType: 'standard' as const, latitude: 31.1952, longitude: 121.4375, managerId: 'U005', managerName: '刘洋', supervisorId: 'U001', supervisorName: '张健', openDate: '2023-01-12', avgScore: 85, status: 'warning' as const },
  { id: 'S004', name: '静安寺精品店', code: 'SH-JAS-004', address: '静安区南京西路1788号', district: '静安区', area: 100, storeType: 'standard' as const, latitude: 31.2253, longitude: 121.4482, managerId: 'U006', managerName: '赵华', supervisorId: 'U002', supervisorName: '李明', openDate: '2023-03-20', avgScore: 78, status: 'warning' as const },
  { id: 'S005', name: '五角场社区店', code: 'SH-WJC-005', address: '杨浦区邯郸路600号', district: '杨浦区', area: 80, storeType: 'community' as const, latitude: 31.2984, longitude: 121.5131, managerId: 'U007', managerName: '孙丽', supervisorId: 'U002', supervisorName: '李明', openDate: '2023-05-08', avgScore: 90, status: 'normal' as const },
  { id: 'S006', name: '虹桥火车站店', code: 'SH-HQ-006', address: '闵行区申虹路1500号', district: '闵行区', area: 140, storeType: 'standard' as const, latitude: 31.1945, longitude: 121.3201, managerId: 'U003', managerName: '王芳', supervisorId: 'U002', supervisorName: '李明', openDate: '2023-07-15', avgScore: 72, status: 'critical' as const },
  { id: 'S007', name: '中山公园店', code: 'SH-ZS-007', address: '长宁区长宁路1018号', district: '长宁区', area: 110, storeType: 'standard' as const, latitude: 31.2205, longitude: 121.4187, managerId: 'U004', managerName: '陈伟', supervisorId: 'U002', supervisorName: '李明', openDate: '2023-09-01', avgScore: 86, status: 'normal' as const },
  { id: 'S008', name: '普陀光新店', code: 'SH-PT-008', address: '普陀区中山北路1855号', district: '普陀区', area: 90, storeType: 'community' as const, latitude: 31.2508, longitude: 121.4365, managerId: 'U005', managerName: '刘洋', supervisorId: 'U001', supervisorName: '张健', openDate: '2023-10-22', avgScore: 81, status: 'warning' as const },
  { id: 'S009', name: '虹口足球场店', code: 'SH-HK-009', address: '虹口区东江湾路444号', district: '虹口区', area: 95, storeType: 'standard' as const, latitude: 31.2689, longitude: 121.4814, managerId: 'U006', managerName: '赵华', supervisorId: 'U001', supervisorName: '张健', openDate: '2024-01-05', avgScore: 94, status: 'normal' as const },
  { id: 'S010', name: '宝山万达店', code: 'SH-BS-010', address: '宝山区一二八纪念路878号', district: '宝山区', area: 85, storeType: 'community' as const, latitude: 31.3978, longitude: 121.4875, managerId: 'U007', managerName: '孙丽', supervisorId: 'U002', supervisorName: '李明', openDate: '2024-02-18', avgScore: 75, status: 'critical' as const },
];

export const mockStores: Store[] = storeBaseData.map((s, idx) => ({
  ...s,
  city: '上海市',
  phone: `021-6${1000000 + idx * 137}`,
  openingTime: '06:00',
  closingTime: '23:00',
  shelves: generateShelves(s.id),
  heatmapData: generateHeatmapData(s.id),
  lastInspectionAt: `2026-06-${String(1 + (idx % 8)).padStart(2, '0')} ${String(9 + idx).padStart(2, '0')}:${String(30 + idx * 5).padStart(2, '0')}:00`,
  createdAt: s.openDate + ' 10:00:00',
}));

const categoryNames: Record<string, string> = {
  drinks: '饮料',
  snacks: '零食',
  daily: '日用品',
  fresh: '鲜食',
  frozen: '冷冻食品',
  others: '其他',
};

const standardsData = [
  { cat: 'drinks', sub: '碳酸饮料', name: '碳酸饮料主货架陈列标准', sku: 24, facing: 3, layers: 4 },
  { cat: 'drinks', sub: '碳酸饮料', name: '可乐品牌专区陈列规范', sku: 8, facing: 4, layers: 3 },
  { cat: 'drinks', sub: '果汁饮料', name: '果汁饮料分类陈列标准', sku: 18, facing: 2, layers: 4 },
  { cat: 'drinks', sub: '茶饮', name: '茶饮系列陈列规范', sku: 16, facing: 3, layers: 3 },
  { cat: 'drinks', sub: '咖啡饮料', name: '即饮咖啡陈列标准', sku: 12, facing: 3, layers: 3 },
  { cat: 'drinks', sub: '功能饮料', name: '功能饮料端架促销陈列', sku: 8, facing: 4, layers: 2 },
  { cat: 'drinks', sub: '矿泉水', name: '瓶装矿泉水堆头陈列', sku: 10, facing: 6, layers: 5 },
  { cat: 'drinks', sub: '乳制品', name: '低温奶冷柜陈列规范', sku: 14, facing: 2, layers: 3, temp: '2-6°C' },
  { cat: 'snacks', sub: '饼干糕点', name: '饼干糕点分类陈列标准', sku: 28, facing: 2, layers: 5 },
  { cat: 'snacks', sub: '膨化食品', name: '膨化食品陈列规范', sku: 22, facing: 3, layers: 4 },
  { cat: 'snacks', sub: '糖果巧克力', name: '糖果巧克力专区标准', sku: 20, facing: 2, layers: 4 },
  { cat: 'snacks', sub: '坚果炒货', name: '坚果炒货陈列标准', sku: 16, facing: 2, layers: 3 },
  { cat: 'snacks', sub: '肉干肉脯', name: '肉干肉脯端架规范', sku: 12, facing: 2, layers: 3 },
  { cat: 'snacks', sub: '果冻布丁', name: '果冻布丁陈列规范', sku: 14, facing: 2, layers: 3 },
  { cat: 'snacks', sub: '即食面', name: '方便面陈列标准', sku: 18, facing: 3, layers: 4 },
  { cat: 'daily', sub: '个人洗护', name: '洗发水沐浴露陈列', sku: 20, facing: 2, layers: 4 },
  { cat: 'daily', sub: '口腔护理', name: '牙膏牙刷陈列规范', sku: 16, facing: 2, layers: 3 },
  { cat: 'daily', sub: '纸品湿巾', name: '卫生纸品堆头标准', sku: 14, facing: 3, layers: 5 },
  { cat: 'daily', sub: '家居清洁', name: '清洁剂陈列标准', sku: 12, facing: 2, layers: 3 },
  { cat: 'daily', sub: '洗衣用品', name: '洗衣液陈列规范', sku: 10, facing: 2, layers: 3 },
  { cat: 'fresh', sub: '三明治', name: '三明治冷柜陈列标准', sku: 10, facing: 2, layers: 2, temp: '0-4°C', fresh: '当日' },
  { cat: 'fresh', sub: '便当饭团', name: '便当饭团陈列规范', sku: 12, facing: 2, layers: 2, temp: '0-4°C', fresh: '当日' },
  { cat: 'fresh', sub: '寿司', name: '鲜食寿司陈列标准', sku: 8, facing: 2, layers: 2, temp: '0-4°C', fresh: '当日' },
  { cat: 'fresh', sub: '沙拉', name: '轻食沙拉陈列规范', sku: 8, facing: 2, layers: 2, temp: '0-4°C', fresh: '当日' },
  { cat: 'fresh', sub: '面包烘焙', name: '面包糕点陈列标准', sku: 14, facing: 2, layers: 3, fresh: '3日内' },
  { cat: 'frozen', sub: '冷冻水饺', name: '冷冻水饺陈列规范', sku: 14, facing: 2, layers: 3, temp: '-18°C以下' },
  { cat: 'frozen', sub: '冷冻汤圆', name: '冷冻汤圆陈列标准', sku: 10, facing: 2, layers: 3, temp: '-18°C以下' },
  { cat: 'frozen', sub: '冰淇淋', name: '冰淇淋冰柜陈列', sku: 18, facing: 2, layers: 4, temp: '-22°C以下' },
  { cat: 'frozen', sub: '冷冻肉制品', name: '冷冻肉制品陈列规范', sku: 12, facing: 2, layers: 3, temp: '-18°C以下' },
  { cat: 'frozen', sub: '冷冻面点', name: '冷冻面点陈列标准', sku: 10, facing: 2, layers: 3, temp: '-18°C以下' },
];

export const mockStandards: DisplayStandard[] = standardsData.map((s, idx) => ({
  id: `STD${String(idx + 1).padStart(3, '0')}`,
  code: `DS-${s.cat.toUpperCase()}-${String(idx + 1).padStart(3, '0')}`,
  name: s.name,
  category: s.cat as any,
  categoryName: categoryNames[s.cat],
  subCategory: s.sub,
  shelfType: s.cat === 'fresh' || s.cat === 'frozen' ? '冷柜' : idx % 3 === 0 ? '端架' : '主货架',
  position: idx % 5 === 0 ? '黄金视线层' : idx % 3 === 0 ? '上层' : idx % 2 === 0 ? '中层' : '底层',
  skuCount: s.sku,
  facingsPerSku: s.facing,
  layersRequired: s.layers,
  priceTagRequired: true,
  promotionTagRequired: idx % 4 === 0,
  freshnessLevel: s.fresh,
  temperatureRequired: s.temp,
  description: `本标准适用于${categoryNames[s.cat]}品类中${s.sub}的门店陈列管理，要求SKU数量${s.sku}个，每SKU${s.facing}个排面，占用${s.layers}层货架${s.temp ? `，温度要求${s.temp}` : ''}。所有商品需对齐陈列前沿，价签与商品一一对应，${s.fresh ? `鲜度要求：${s.fresh}。` : ''}`,
  weight: 8 + (idx % 5),
  createdAt: '2025-01-15 10:00:00',
  updatedAt: `2026-0${(idx % 6) + 1}-15 14:00:00`,
  createdBy: 'U001',
  enabled: idx !== 25,
}));

const issueTypeNames: Record<string, string> = {
  outOfStock: '缺货',
  misplaced: '错位',
  priceTag: '价签问题',
  promotion: '促销问题',
  cleanliness: '卫生问题',
  others: '其他',
};

const priorityNames: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
};

const rectificationStatusNames: Record<string, string> = {
  pending: '待整改',
  inProgress: '整改中',
  submitted: '待复查',
  approved: '复查通过',
  rejected: '复查驳回',
  completed: '已完成',
};

const replenishmentStatusNames: Record<string, string> = {
  pending: '待处理',
  ordered: '已下单',
  shipped: '配送中',
  received: '已到货',
  completed: '已完成',
  cancelled: '已取消',
};

const generateItems = (taskId: string, storeId: string, count: number, taskStatus: string): InspectionItem[] => {
  const items: InspectionItem[] = [];
  const seed = parseInt(storeId.replace('S', ''));
  for (let i = 0; i < count; i++) {
    const standard = mockStandards[(seed + i) % mockStandards.length];
    const shelf = mockStores.find(s => s.id === storeId)?.shelves[i % 10];
    const statusRand = (seed * 13 + i * 7) % 100;
    let itemStatus: InspectionItem['status'];
    if (taskStatus === 'pending') {
      itemStatus = 'pending';
    } else if (taskStatus === 'inProgress') {
      itemStatus = i < Math.floor(count * 0.6) ? (statusRand > 30 ? 'pass' : 'fail') : 'pending';
    } else {
      itemStatus = statusRand > 25 ? 'pass' : 'fail';
    }
    const maxScore = 10;
    const photoRecords: PhotoRecord[] = itemStatus !== 'pending' ? [
      {
        id: `${taskId}-PH${i}-1`,
        itemId: `${taskId}-IT${i + 1}`,
        taskId,
        url: `https://picsum.photos/seed/${taskId}${i}a/400/300`,
        thumbnail: `https://picsum.photos/seed/${taskId}${i}a/120/90`,
        uploadedAt: `2026-06-05 1${i % 3}:${String(20 + i).padStart(2, '0')}:00`,
        uploadedBy: mockStores.find(s => s.id === storeId)?.managerId || 'U003',
        marks: [],
      },
    ] : [];
    const issueRecords: IssueRecord[] = [];
    if (itemStatus === 'fail') {
      const issueTypes = ['outOfStock', 'misplaced', 'priceTag', 'cleanliness'];
      const it = issueTypes[(seed + i) % issueTypes.length];
      const priorities: any = ['medium', 'high', 'low'];
      const pri = priorities[(seed + i * 3) % 3];
      issueRecords.push({
        id: `${taskId}-IS${i + 1}`,
        itemId: `${taskId}-IT${i + 1}`,
        taskId,
        type: it as any,
        typeName: issueTypeNames[it],
        priority: pri,
        priorityName: priorityNames[pri],
        description: `${issueTypeNames[it]}问题：${standard.name}执行不符合标准，${it === 'outOfStock' ? '商品缺货严重' : it === 'misplaced' ? '商品位置摆放错误' : it === 'priceTag' ? '价签缺失或与商品不匹配' : '货架区域清洁不到位'}。`,
        skuName: it === 'outOfStock' ? `${standard.subCategory}商品A` : undefined,
        shelfId: shelf?.id,
        shelfName: shelf?.name,
        createdAt: `2026-06-05 1${i % 3}:${String(25 + i).padStart(2, '0')}:00`,
        createdBy: mockStores.find(s => s.id === storeId)?.managerId || 'U003',
        resolved: false,
      });
    }
    items.push({
      id: `${taskId}-IT${i + 1}`,
      taskId,
      standardId: standard.id,
      standardName: standard.name,
      standardCode: standard.code,
      category: standard.category,
      categoryName: standard.categoryName,
      shelfId: shelf?.id,
      shelfName: shelf?.name,
      sortOrder: i + 1,
      weight: standard.weight,
      status: itemStatus,
      photoRecords,
      issueRecords,
      score: itemStatus === 'pass' ? maxScore : itemStatus === 'fail' ? Math.floor(maxScore * 0.3) : undefined,
      maxScore,
      checkedAt: itemStatus !== 'pending' ? `2026-06-05 1${i % 3}:${String(30 + i).padStart(2, '0')}:00` : undefined,
      checkedBy: itemStatus !== 'pending' ? mockStores.find(s => s.id === storeId)?.managerId : undefined,
    });
  }
  return items;
};

const taskNames = [
  { name: '6月例行巡检', type: 'routine' as const },
  { name: '端午节专项检查', type: 'special' as const },
  { name: '季度审计巡检', type: 'audit' as const },
  { name: '夏季冷饮陈列专项', type: 'special' as const },
  { name: '6月第二周例行', type: 'routine' as const },
  { name: '鲜食品质专项检查', type: 'special' as const },
  { name: '整改复查任务', type: 'audit' as const },
  { name: '促销活动效果检查', type: 'special' as const },
  { name: '6月第三周例行', type: 'routine' as const },
  { name: '店长月度考核', type: 'audit' as const },
  { name: '端午后恢复检查', type: 'special' as const },
  { name: '卫生安全专项', type: 'special' as const },
  { name: '价签合规检查', type: 'audit' as const },
  { name: '零食区陈列优化', type: 'special' as const },
  { name: '6月第四周例行', type: 'routine' as const },
];

const taskStatuses: any = ['completed', 'completed', 'inProgress', 'pending', 'completed', 'inProgress', 'completed', 'pending', 'completed', 'completed', 'inProgress', 'pending', 'completed', 'inProgress', 'pending'];

export const mockTasks: InspectionTask[] = taskNames.map((t, idx) => {
  const store = mockStores[idx % mockStores.length];
  const itemCount = 10 + (idx % 5) * 2;
  const status = taskStatuses[idx];
  const items = generateItems(`TASK${String(idx + 1).padStart(3, '0')}`, store.id, itemCount, status);
  const completedItems = items.filter(i => i.status !== 'pending').length;
  const passItems = items.filter(i => i.status === 'pass').length;
  const failItems = items.filter(i => i.status === 'fail').length;
  const totalWeight = items.reduce((s, i) => s + i.weight, 0);
  const scoreWeight = items.filter(i => i.score !== undefined).reduce((s, i) => s + (i.score || 0) * i.weight, 0);
  const overallScore = completedItems === itemCount ? Math.floor(scoreWeight / totalWeight * 10) / 10 * 10 : undefined;
  const priorities: any = ['medium', 'high', 'medium', 'low', 'high', 'urgent', 'medium', 'high', 'medium', 'low', 'high', 'urgent', 'medium', 'high', 'low'];
  return {
    id: `TASK${String(idx + 1).padStart(3, '0')}`,
    code: `IT-202606-${String(idx + 1).padStart(3, '0')}`,
    name: `${t.name}-${store.name}`,
    storeId: store.id,
    storeName: store.name,
    type: t.type,
    status,
    priority: priorities[idx],
    createdBy: idx % 2 === 0 ? 'U001' : 'U002',
    createdByName: idx % 2 === 0 ? '张健' : '李明',
    assignedTo: store.managerId,
    assignedToName: store.managerName,
    items,
    totalItems: itemCount,
    completedItems,
    passItems,
    failItems,
    overallScore,
    maxScore: 100,
    startDate: `2026-06-${String(1 + (idx % 8)).padStart(2, '0')} 08:00:00`,
    dueDate: `2026-06-${String(5 + (idx % 5)).padStart(2, '0')} 20:00:00`,
    completedAt: status === 'completed' ? `2026-06-${String(4 + (idx % 5)).padStart(2, '0')} 1${idx % 3}:30:00` : undefined,
    createdAt: `2026-06-${String(1 + (idx % 3)).padStart(2, '0')} 09:${String(10 + idx * 3).padStart(2, '0')}:00`,
    remark: idx % 4 === 0 ? '请重点关注鲜食品类的陈列规范和保质期管理。' : undefined,
  };
});

const issueDescriptionMap: Record<string, string> = {
  outOfStock: '货架商品大面积缺货，部分热销SKU断货超过2天，请立即补货。',
  misplaced: '商品陈列位置与标准不符，跨品类混放严重，顾客难以查找。',
  priceTag: '价签缺失、破损或与商品不对应，存在价格误导风险。',
  promotion: '促销活动牌摆放位置错误，促销信息未及时更新，部分促销商品未标价。',
  cleanliness: '货架底部积灰严重，冷柜玻璃有明显污渍，影响购物体验。',
  others: '其他不符合陈列规范的问题，请店长现场检查并整改。',
};

const rectificationStatuses: any = ['completed', 'approved', 'inProgress', 'pending', 'completed', 'submitted', 'rejected', 'completed', 'inProgress', 'pending', 'approved', 'completed', 'submitted', 'inProgress', 'completed', 'rejected', 'pending', 'completed', 'approved', 'inProgress'];

const issueTypesArr = ['outOfStock', 'misplaced', 'priceTag', 'promotion', 'cleanliness', 'others'];
const prioritiesArr: any = ['low', 'medium', 'high', 'urgent'];

export const mockRectificationOrders: RectificationOrder[] = Array.from({ length: 20 }, (_, idx) => {
  const store = mockStores[idx % mockStores.length];
  const task = mockTasks[idx % mockTasks.length];
  const it = issueTypesArr[idx % issueTypesArr.length];
  const pri = prioritiesArr[(idx * 3) % 4];
  const status = rectificationStatuses[idx];
  const issueId = `ISSUE${String(idx + 1).padStart(4, '0')}`;
  const daysFromNow = Math.max(1, 10 - idx);
  const feedbacks = [
    '已完成整改，所有缺货商品已补充到位，货架陈列已按标准执行。',
    '商品已重新归类摆放，价签已全部更换完毕，请复查。',
    '正在紧急联系供应商补货，预计2天内到货，已临时调整周边商品陈列。',
    undefined,
  ];
  const rejectReasons = [undefined, undefined, '整改照片不清晰，缺货问题未完全解决，请重新整改后提交。', undefined];
  return {
    id: `RECT${String(idx + 1).padStart(4, '0')}`,
    code: `RO-2026-${String(idx + 1).padStart(4, '0')}`,
    taskId: task.id,
    taskCode: task.code,
    storeId: store.id,
    storeName: store.name,
    issueId,
    issueType: it as any,
    issueTypeName: issueTypeNames[it],
    priority: pri,
    priorityName: priorityNames[pri],
    status,
    statusName: rectificationStatusNames[status],
    description: issueDescriptionMap[it],
    imageUrls: [
      `https://picsum.photos/seed/rect${idx}a/600/400`,
      `https://picsum.photos/seed/rect${idx}b/600/400`,
    ],
    assignedTo: store.managerId,
    assignedToName: store.managerName,
    supervisedBy: idx % 2 === 0 ? 'U001' : 'U002',
    supervisedByName: idx % 2 === 0 ? '张健' : '李明',
    deadline: `2026-06-${String(Math.min(30, 12 + idx)).padStart(2, '0')} 20:00:00`,
    createdAt: `2026-06-${String(1 + (idx % 6)).padStart(2, '0')} ${String(10 + idx).padStart(2, '0')}:${String(15 + idx * 2).padStart(2, '0')}:00`,
    startedAt: status !== 'pending' ? `2026-06-${String(2 + (idx % 6)).padStart(2, '0')} 09:00:00` : undefined,
    submittedAt: (status === 'submitted' || status === 'approved' || status === 'rejected' || status === 'completed') ? `2026-06-${String(4 + (idx % 5)).padStart(2, '0')} 1${idx % 4}:30:00` : undefined,
    reviewedAt: (status === 'approved' || status === 'rejected' || status === 'completed') ? `2026-06-${String(5 + (idx % 4)).padStart(2, '0')} 10:${String(10 + idx).padStart(2, '0')}:00` : undefined,
    completedAt: status === 'completed' ? `2026-06-${String(5 + (idx % 4)).padStart(2, '0')} 10:${String(30 + idx).padStart(2, '0')}:00` : undefined,
    feedback: status !== 'pending' ? feedbacks[idx % 4] : undefined,
    feedbackImages: (status !== 'pending' && status !== 'inProgress') ? [
      `https://picsum.photos/seed/rectfb${idx}a/600/400`,
      `https://picsum.photos/seed/rectfb${idx}b/600/400`,
    ] : undefined,
    reviewOpinion: (status === 'approved' || status === 'completed') ? '整改到位，符合标准要求，通过复查。' : (status === 'rejected' ? '整改不彻底，需重新处理' : undefined),
    rejectReason: status === 'rejected' ? rejectReasons[idx % 4] : undefined,
    reviewTimes: status === 'rejected' ? 2 : status === 'approved' || status === 'completed' || status === 'submitted' ? 1 : 0,
  };
});

const replenishmentSKUs = [
  { cat: 'drinks', sub: '碳酸饮料', name: '可口可乐330ml', brand: '可口可乐', spec: '330ml/罐', unit: '箱', capacity: 48 },
  { cat: 'drinks', sub: '碳酸饮料', name: '百事可乐500ml', brand: '百事', spec: '500ml/瓶', unit: '箱', capacity: 24 },
  { cat: 'drinks', sub: '果汁饮料', name: '美汁源果粒橙450ml', brand: '美汁源', spec: '450ml/瓶', unit: '箱', capacity: 24 },
  { cat: 'drinks', sub: '茶饮', name: '东方树叶乌龙茶500ml', brand: '农夫山泉', spec: '500ml/瓶', unit: '箱', capacity: 24 },
  { cat: 'drinks', sub: '咖啡饮料', name: '雀巢咖啡丝滑拿铁268ml', brand: '雀巢', spec: '268ml/瓶', unit: '箱', capacity: 15 },
  { cat: 'drinks', sub: '功能饮料', name: '红牛维生素功能饮料250ml', brand: '红牛', spec: '250ml/罐', unit: '箱', capacity: 24 },
  { cat: 'drinks', sub: '矿泉水', name: '农夫山泉550ml', brand: '农夫山泉', spec: '550ml/瓶', unit: '箱', capacity: 28 },
  { cat: 'drinks', sub: '乳制品', name: '光明新鲜屋纯牛奶950ml', brand: '光明', spec: '950ml/盒', unit: '箱', capacity: 12 },
  { cat: 'snacks', sub: '饼干糕点', name: '奥利奥原味夹心饼干116g', brand: '奥利奥', spec: '116g/包', unit: '箱', capacity: 30 },
  { cat: 'snacks', sub: '膨化食品', name: '乐事原味薯片75g', brand: '乐事', spec: '75g/包', unit: '箱', capacity: 24 },
  { cat: 'snacks', sub: '糖果巧克力', name: '德芙牛奶巧克力43g', brand: '德芙', spec: '43g/条', unit: '箱', capacity: 48 },
  { cat: 'snacks', sub: '坚果炒货', name: '三只松鼠每日坚果750g', brand: '三只松鼠', spec: '750g/箱', unit: '箱', capacity: 8 },
  { cat: 'snacks', sub: '肉干肉脯', name: '良品铺子猪肉脯100g', brand: '良品铺子', spec: '100g/包', unit: '箱', capacity: 40 },
  { cat: 'snacks', sub: '果冻布丁', name: '喜之郎果冻360g', brand: '喜之郎', spec: '360g/包', unit: '箱', capacity: 24 },
  { cat: 'snacks', sub: '即食面', name: '康师傅红烧牛肉面5连包', brand: '康师傅', spec: '5连包/组', unit: '箱', capacity: 12 },
  { cat: 'daily', sub: '个人洗护', name: '海飞丝洗发水750ml', brand: '海飞丝', spec: '750ml/瓶', unit: '箱', capacity: 12 },
  { cat: 'daily', sub: '口腔护理', name: '云南白药牙膏180g', brand: '云南白药', spec: '180g/支', unit: '箱', capacity: 24 },
  { cat: 'daily', sub: '纸品湿巾', name: '维达抽纸3层120抽', brand: '维达', spec: '120抽/包', unit: '箱', capacity: 24 },
  { cat: 'daily', sub: '家居清洁', name: '蓝月亮洗衣液3kg', brand: '蓝月亮', spec: '3kg/瓶', unit: '箱', capacity: 8 },
  { cat: 'fresh', sub: '三明治', name: '全家火腿蛋三明治', brand: '全家', spec: '150g/个', unit: '箱', capacity: 20 },
  { cat: 'fresh', sub: '便当饭团', name: '奥尔良鸡腿便当', brand: '全家', spec: '350g/盒', unit: '箱', capacity: 16 },
  { cat: 'fresh', sub: '寿司', name: '三文鱼寿司拼盘', brand: '全家', spec: '180g/盒', unit: '箱', capacity: 12 },
  { cat: 'fresh', sub: '面包烘焙', name: '曼可顿全麦面包400g', brand: '曼可顿', spec: '400g/袋', unit: '箱', capacity: 15 },
  { cat: 'frozen', sub: '冷冻水饺', name: '思念三鲜水饺1kg', brand: '思念', spec: '1kg/袋', unit: '箱', capacity: 10 },
  { cat: 'frozen', sub: '冰淇淋', name: '和路雪梦龙冰淇淋64g', brand: '和路雪', spec: '64g/支', unit: '箱', capacity: 24 },
];

const replenishmentStatuses: any = ['pending', 'ordered', 'shipped', 'received', 'completed', 'cancelled'];

export const mockReplenishments: ReplenishmentSuggestion[] = Array.from({ length: 40 }, (_, idx) => {
  const sku = replenishmentSKUs[idx % replenishmentSKUs.length];
  const store = mockStores[idx % mockStores.length];
  const seed = idx + 1;
  const currentStock = Math.floor(sku.capacity * ((seed * 7) % 40) / 100);
  const safeStock = Math.floor(sku.capacity * 0.3);
  const suggestedQty = Math.max(sku.capacity - currentStock, Math.floor(safeStock * 1.2));
  const outDays = Math.max(0, Math.floor((safeStock - currentStock) / Math.max(1, Math.floor(safeStock / 3))));
  const pri = outDays > 4 ? 'urgent' : outDays > 2 ? 'high' : outDays > 0 ? 'medium' : 'low';
  const status = replenishmentStatuses[seed % 6];
  return {
    id: `REP${String(idx + 1).padStart(5, '0')}`,
    code: `RS-202606${String(idx + 1).padStart(3, '0')}`,
    storeId: store.id,
    storeName: store.name,
    skuCode: `SKU${String(1000 + idx).padStart(5, '0')}`,
    skuName: sku.name,
    barcode: `690${String(10000000 + idx * 137).slice(0, 9)}`,
    category: sku.cat as any,
    categoryName: categoryNames[sku.cat],
    brand: sku.brand,
    spec: sku.spec,
    unit: sku.unit,
    standardCapacity: sku.capacity,
    currentStock,
    safeStock,
    suggestedQty,
    lastWeekSales: Math.floor(sku.capacity * 0.8 + (seed % 20)),
    lastMonthSales: Math.floor(sku.capacity * 3.2 + (seed * 3 % 50)),
    avgDailySales: +(sku.capacity * 0.11 + (seed % 5) * 0.3).toFixed(1),
    outOfStockDays: outDays,
    priority: pri,
    priorityName: priorityNames[pri],
    expectedDate: `2026-06-${String(Math.min(30, 12 + (idx % 10))).padStart(2, '0')}`,
    supplier: idx % 3 === 0 ? '上海统一配送中心' : idx % 3 === 1 ? '华东物流仓库' : '本地供应商联盟',
    status,
    statusName: replenishmentStatusNames[status],
    createdAt: `2026-06-${String(1 + (idx % 8)).padStart(2, '0')} ${String(8 + (idx % 10)).padStart(2, '0')}:${String(10 + idx * 2).padStart(2, '0')}:00`,
    processedAt: status !== 'pending' ? `2026-06-${String(2 + (idx % 6)).padStart(2, '0')} 1${idx % 4}:00:00` : undefined,
    processedBy: status !== 'pending' ? store.managerId : undefined,
    remark: pri === 'urgent' ? '热销商品，请优先处理！' : undefined,
  };
});

export const mockScores: StoreScore[] = (() => {
  const scores: StoreScore[] = [];
  const weekOffsets = [0, 7, 14, 21];
  const weekLabels = ['第23周', '第24周', '第25周', '第26周'];
  let scoreId = 1;

  mockStores.forEach((store, sIdx) => {
    const baseScore = store.avgScore;
    weekOffsets.forEach((offset, wIdx) => {
      const variance = ((sIdx * 7 + wIdx * 13) % 12) - 6;
      const overall = Math.min(100, Math.max(60, baseScore + variance));
      const displayV = ((sIdx * 3 + wIdx * 5) % 10);
      const stockV = ((sIdx * 5 + wIdx * 3) % 10);
      const priceV = ((sIdx * 2 + wIdx * 7) % 8);
      const promoV = ((sIdx * 4 + wIdx * 2) % 10);
      const cleanV = ((sIdx * 6 + wIdx * 4) % 8);
      const serviceV = ((sIdx * 1 + wIdx * 6) % 8);

      const startDate = new Date(2026, 4, 25 + offset);
      const endDate = new Date(2026, 4, 31 + offset);
      const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      scores.push({
        id: `SCORE${String(scoreId++).padStart(4, '0')}`,
        storeId: store.id,
        storeName: store.name,
        periodType: 'week',
        period: weekLabels[wIdx],
        startDate: fmt(startDate),
        endDate: fmt(endDate),
        overallScore: overall,
        maxScore: 100,
        rank: Math.floor(1 + ((sIdx * 10 + wIdx * 3) % 10)),
        totalStores: 10,
        displayScore: Math.min(30, Math.max(18, 25 - displayV)),
        displayMaxScore: 30,
        stockScore: Math.min(20, Math.max(10, 17 - stockV)),
        stockMaxScore: 20,
        priceTagScore: Math.min(15, Math.max(8, 13 - priceV)),
        priceTagMaxScore: 15,
        promotionScore: Math.min(15, Math.max(8, 13 - promoV)),
        promotionMaxScore: 15,
        cleanlinessScore: Math.min(10, Math.max(4, 9 - cleanV)),
        cleanlinessMaxScore: 10,
        serviceScore: Math.min(10, Math.max(5, 9 - serviceV)),
        serviceMaxScore: 10,
        inspectionCount: 2 + (wIdx % 2),
        issueCount: 5 + Math.floor((sIdx + wIdx) * 1.5) % 15,
        rectificationRate: +(0.75 + ((sIdx * 3 + wIdx * 5) % 25) / 100).toFixed(3),
        outOfStockRate: +(0.05 + ((sIdx * 5 + wIdx * 2) % 15) / 100).toFixed(3),
        createdAt: `${fmt(endDate)} 23:59:59`,
      });
    });
  });
  return scores;
})();
