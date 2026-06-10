import { create } from 'zustand';

export type UserRole = 'supervisor' | 'manager';

export type CategoryType = 'drinks' | 'snacks' | 'daily' | 'fresh' | 'frozen' | 'others';

export type IssueType = 'outOfStock' | 'misplaced' | 'priceTag' | 'promotion' | 'cleanliness' | 'others';

export type IssuePriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskType = 'weekly' | 'monthly' | 'temporary' | 'promotion';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

export type ItemStatus = 'pending' | 'pass' | 'fail' | 'na';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  phone: string;
  storeIds: string[];
  city: string;
}

export interface Shelf {
  id: string;
  name: string;
  type: 'shelf' | 'endcap' | 'promotion' | 'checkout';
  x: number;
  y: number;
  width: number;
  height: number;
  category?: string;
  levelCount: number;
}

export interface Store {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  district: string;
  lat: number;
  lng: number;
  status: 'normal' | 'warning' | 'critical';
  score: number;
  managerId: string;
  managerName: string;
  openDate: string;
  floorPlanUrl?: string;
  shelves: Shelf[];
}

export interface DisplayStandard {
  id: string;
  category: string;
  categoryName: string;
  subCategory?: string;
  name: string;
  description: string;
  shelfType: string;
  minSkuCount: number;
  maxSkuCount: number;
  facingRule: string;
  priceTagRule: string;
  promotionRule?: string;
  weight: number;
  enabled: boolean;
  updatedAt: string;
}

export interface PhotoMark {
  id: string;
  photoId: string;
  type: IssueType;
  x: number;
  y: number;
}

export interface PhotoRecord {
  id: string;
  itemId: string;
  taskId: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  marks: PhotoMark[];
}

export interface IssueRecord {
  id: string;
  itemId: string;
  taskId: string;
  type: IssueType;
  typeName: string;
  priority: IssuePriority;
  priorityName: string;
  description: string;
  skuName?: string;
  photoId?: string;
  createdAt: string;
  createdBy: string;
  resolved: boolean;
}

export interface InspectionItem {
  id: string;
  taskId: string;
  standardId: string;
  standardName: string;
  standardCode: string;
  category: CategoryType;
  categoryName: string;
  sortOrder: number;
  weight: number;
  status: ItemStatus;
  photoRecords: PhotoRecord[];
  issueRecords: IssueRecord[];
  score?: number;
  maxScore: number;
  checkedAt?: string;
  checkedBy?: string;
}

export interface InspectionTask {
  id: string;
  title: string;
  storeId: string;
  storeName: string;
  creatorId: string;
  creatorName: string;
  assigneeId: string;
  assigneeName: string;
  type: TaskType;
  status: TaskStatus;
  startTime: string;
  deadline: string;
  score?: number;
  itemCount: number;
  completedItems: number;
  passItems: number;
  failItems: number;
  items: InspectionItem[];
  createdAt: string;
}

export interface RectificationOrder {
  id: string;
  taskId: string;
  storeId: string;
  storeName: string;
  itemName: string;
  issueType: string;
  description: string;
  assigneeName: string;
  assignorName: string;
  deadline: string;
  status: 'pending' | 'processing' | 'reviewing' | 'passed' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

export interface ReplenishmentSuggestion {
  id: string;
  storeId: string;
  storeName: string;
  skuId: string;
  skuName: string;
  category: string;
  currentStock: number;
  safetyStock: number;
  suggestedQty: number;
  urgency: 'normal' | 'urgent' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  status: 'pending' | 'ordered' | 'shipped' | 'received' | 'completed' | 'cancelled';
  lastReplenishedAt: string;
}

export interface StoreScore {
  storeId: string;
  storeName: string;
  period: string;
  periodType: 'weekly' | 'monthly';
  totalScore: number;
  displayScore: number;
  stockScore: number;
  priceScore: number;
  promotionScore: number;
  rectificationScore: number;
  taskCount: number;
  rectificationRate: number;
  rank: number;
}

const mockUsers: User[] = [
  {
    id: 'u001',
    name: '张明远',
    role: 'supervisor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangmy',
    phone: '13800138001',
    storeIds: ['s001', 's002', 's003', 's004', 's005'],
    city: '上海市',
  },
  {
    id: 'u002',
    name: '李雪琴',
    role: 'manager',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lixq',
    phone: '13800138002',
    storeIds: ['s001'],
    city: '上海市',
  },
];

const generateShelves = (storeId: string): Shelf[] => {
  const baseShelves: Omit<Shelf, 'id'>[] = [
    { name: '饮料主货架 A1', type: 'shelf', x: 12, y: 40, width: 80, height: 22, category: 'drinks', levelCount: 5 },
    { name: '饮料主货架 A2', type: 'shelf', x: 12, y: 70, width: 80, height: 22, category: 'drinks', levelCount: 5 },
    { name: '饮料端架 A-端', type: 'endcap', x: 95, y: 40, width: 22, height: 52, category: 'drinks', levelCount: 6 },
    { name: '零食主货架 B1', type: 'shelf', x: 140, y: 40, width: 80, height: 22, category: 'snacks', levelCount: 5 },
    { name: '零食主货架 B2', type: 'shelf', x: 140, y: 70, width: 80, height: 22, category: 'snacks', levelCount: 5 },
    { name: '零食端架 B-端', type: 'endcap', x: 115, y: 70, width: 22, height: 22, category: 'snacks', levelCount: 4 },
    { name: '日用品货架 C1', type: 'shelf', x: 270, y: 40, width: 80, height: 22, category: 'daily', levelCount: 5 },
    { name: '日用品货架 C2', type: 'shelf', x: 270, y: 70, width: 80, height: 22, category: 'daily', levelCount: 5 },
    { name: '鲜食冷柜 D', type: 'shelf', x: 360, y: 20, width: 90, height: 60, category: 'fresh', levelCount: 4 },
    { name: '冷冻冰柜 E', type: 'shelf', x: 400, y: 90, width: 80, height: 50, category: 'frozen', levelCount: 3 },
    { name: '收银台货架 F', type: 'checkout', x: 440, y: 180, width: 70, height: 28, category: 'snacks', levelCount: 3 },
    { name: '促销堆头1 G1', type: 'promotion', x: 130, y: 170, width: 90, height: 40, category: 'drinks', levelCount: 2 },
    { name: '促销堆头2 G2', type: 'promotion', x: 260, y: 170, width: 90, height: 40, category: 'snacks', levelCount: 2 },
  ];
  const seed = storeId.charCodeAt(storeId.length - 1);
  return baseShelves.map((s, i) => ({
    ...s,
    id: `sh-${storeId}-${i + 1}`,
    x: s.x + (seed % 5) * 2,
    y: s.y + (seed % 3) * 3,
  }));
};

const mockStores: Store[] = [
  {
    id: 's001',
    name: '陆家嘴旗舰店',
    code: 'SH-LJZ-001',
    address: '浦东新区世纪大道100号',
    city: '上海市',
    district: '浦东新区',
    lat: 31.2397,
    lng: 121.4998,
    status: 'normal',
    score: 92,
    managerId: 'u002',
    managerName: '李雪琴',
    openDate: '2024-03-15',
    floorPlanUrl: '',
    shelves: generateShelves('s001'),
  },
  {
    id: 's002',
    name: '南京东路店',
    code: 'SH-NJD-002',
    address: '黄浦区南京东路300号',
    city: '上海市',
    district: '黄浦区',
    lat: 31.2354,
    lng: 121.4789,
    status: 'warning',
    score: 78,
    managerId: 'u003',
    managerName: '王建国',
    openDate: '2024-05-20',
    floorPlanUrl: '',
    shelves: generateShelves('s002'),
  },
  {
    id: 's003',
    name: '徐家汇店',
    code: 'SH-XJH-003',
    address: '徐汇区肇嘉浜路1000号',
    city: '上海市',
    district: '徐汇区',
    lat: 31.1967,
    lng: 121.4365,
    status: 'normal',
    score: 88,
    managerId: 'u004',
    managerName: '赵美丽',
    openDate: '2024-06-10',
    floorPlanUrl: '',
    shelves: generateShelves('s003'),
  },
  {
    id: 's004',
    name: '五角场店',
    code: 'SH-WJC-004',
    address: '杨浦区邯郸路600号',
    city: '上海市',
    district: '杨浦区',
    lat: 31.2984,
    lng: 121.5078,
    status: 'critical',
    score: 65,
    managerId: 'u005',
    managerName: '孙大伟',
    openDate: '2024-08-01',
    floorPlanUrl: '',
    shelves: generateShelves('s004'),
  },
  {
    id: 's005',
    name: '中山公园店',
    code: 'SH-ZSGY-005',
    address: '长宁区长宁路1018号',
    city: '上海市',
    district: '长宁区',
    lat: 31.2207,
    lng: 121.4206,
    status: 'normal',
    score: 85,
    managerId: 'u006',
    managerName: '周小花',
    openDate: '2024-09-15',
    floorPlanUrl: '',
    shelves: generateShelves('s005'),
  },
];

const mockStandards: DisplayStandard[] = [
  {
    id: 'ds001',
    category: 'drinks',
    categoryName: '饮料',
    subCategory: '碳酸饮料',
    name: '可乐货架陈列标准',
    description: '可乐系列产品需按品牌纵向陈列，标签朝外，保持产品线完整。同一品牌不同规格相邻摆放，罐装在上，瓶装在下。新品与促销品优先放置在黄金视线层。',
    shelfType: '主货架',
    minSkuCount: 8,
    maxSkuCount: 12,
    facingRule: '每SKU至少3个排面，罐装≥4排面',
    priceTagRule: '左下角放置价格标签，标签正对顾客，价签条码朝上',
    promotionRule: '促销品放置在端架醒目位置，配POP海报',
    weight: 10,
    enabled: true,
    updatedAt: '2026-06-05 14:30',
  },
  {
    id: 'ds002',
    category: 'drinks',
    categoryName: '饮料',
    subCategory: '茶饮',
    name: '茶饮系列陈列规范',
    description: '茶饮按品牌分区域陈列，统一品牌不同口味相邻摆放，无糖茶与传统茶分区管理。保持包装正面朝外，同排面高度一致。',
    shelfType: '主货架',
    minSkuCount: 12,
    maxSkuCount: 18,
    facingRule: '每SKU至少2个排面，热销品3个排面',
    priceTagRule: '每层下方粘贴价格条，与商品一一对应',
    weight: 9,
    enabled: true,
    updatedAt: '2026-06-03 10:15',
  },
  {
    id: 'ds003',
    category: 'drinks',
    categoryName: '饮料',
    subCategory: '果汁',
    name: '果汁饮料分类陈列标准',
    description: '果汁按品类（橙汁、苹果汁、混合果汁等）分区，常温与冷藏分开管理。100%纯果汁专区单独设置，大容量家庭装放底层。',
    shelfType: '主货架',
    minSkuCount: 10,
    maxSkuCount: 16,
    facingRule: '每SKU至少2个排面',
    priceTagRule: '价签左侧对齐，规格信息完整',
    weight: 8,
    enabled: true,
    updatedAt: '2026-06-01 09:00',
  },
  {
    id: 'ds004',
    category: 'drinks',
    categoryName: '饮料',
    subCategory: '咖啡',
    name: '即饮咖啡陈列标准',
    description: '咖啡按品牌陈列，即饮与速溶分区。玻璃瓶避光陈列，罐装与PET瓶装分区域。高端专区设置在收银台旁货架。',
    shelfType: '主货架',
    minSkuCount: 8,
    maxSkuCount: 14,
    facingRule: '每SKU至少2个排面，高端品3个排面',
    priceTagRule: '每个SKU独立价签，原价与促销价双标签',
    promotionRule: '新品上市配端架促销位+试饮',
    weight: 8,
    enabled: true,
    updatedAt: '2026-05-28 16:45',
  },
  {
    id: 'ds005',
    category: 'drinks',
    categoryName: '饮料',
    subCategory: '功能饮料',
    name: '功能饮料端架促销陈列',
    description: '功能饮料在端架黄金位置集中陈列，按品牌分区，大容量与经典款同区。运动型与能量型分开标识，配合运动主题装饰。',
    shelfType: '端架',
    minSkuCount: 6,
    maxSkuCount: 10,
    facingRule: '每SKU至少4个排面，保持视觉饱满',
    priceTagRule: '端架前方悬挂大尺寸价格牌',
    promotionRule: '配品牌立牌、促销爆炸贴，设运动主题陈列道具',
    weight: 9,
    enabled: true,
    updatedAt: '2026-06-02 11:20',
  },
  {
    id: 'ds006',
    category: 'drinks',
    categoryName: '饮料',
    subCategory: '矿泉水',
    name: '瓶装矿泉水堆头陈列',
    description: '矿泉水入口堆头集中陈列，按品牌分堆（农夫山泉、怡宝、百岁山等），整箱与单瓶组合陈列，夏季加大堆头面积30%。',
    shelfType: '堆头',
    minSkuCount: 6,
    maxSkuCount: 10,
    facingRule: '堆头高度≥1.2米，整箱打底，上层单瓶展示',
    priceTagRule: '堆头前方立大尺寸价格牌，整箱价与单瓶价同时标注',
    promotionRule: '夏季配冰桶，冷柜重点陈列',
    weight: 10,
    enabled: true,
    updatedAt: '2026-06-04 08:30',
  },
  {
    id: 'ds007',
    category: 'drinks',
    categoryName: '饮料',
    subCategory: '乳饮',
    name: '乳饮品冷柜陈列规范',
    description: '乳饮品统一放置冷藏柜，按品类分区分层：上层鲜奶，中层酸奶/乳酸菌，下层乳饮料。保质期前出后进，短保品前置。',
    shelfType: '冷柜',
    minSkuCount: 10,
    maxSkuCount: 16,
    facingRule: '每SKU至少2个排面，鲜奶类3个排面',
    priceTagRule: '每层贴价格条，生产日期标签醒目',
    promotionRule: '买赠活动需贴赠品标识，赠品与商品绑定',
    weight: 9,
    enabled: true,
    updatedAt: '2026-06-06 13:10',
  },
  {
    id: 'ds008',
    category: 'drinks',
    categoryName: '饮料',
    subCategory: '其他',
    name: '其他饮料补充陈列',
    description: '植物蛋白饮料、谷物饮料等其他品类集中在饮料区末端，按品牌归类，SKU不超过区域20%占比，避免分散注意力。',
    shelfType: '主货架',
    minSkuCount: 4,
    maxSkuCount: 8,
    facingRule: '每SKU至少2个排面',
    priceTagRule: '常规价签管理',
    weight: 5,
    enabled: false,
    updatedAt: '2026-05-15 15:00',
  },
  {
    id: 'ds009',
    category: 'snacks',
    categoryName: '零食',
    subCategory: '膨化食品',
    name: '薯片端架陈列标准',
    description: '薯片按口味横向陈列，新品在最上层，经典款在中层，大包装在底层。保持袋装竖直陈列，封口统一朝内，避免倒袋。',
    shelfType: '端架',
    minSkuCount: 6,
    maxSkuCount: 10,
    facingRule: '每SKU至少2个排面',
    priceTagRule: '每层前方放置价格条',
    weight: 8,
    enabled: true,
    updatedAt: '2026-05-30 14:20',
  },
  {
    id: 'ds010',
    category: 'snacks',
    categoryName: '零食',
    subCategory: '饼干糕点',
    name: '饼干糕点分类陈列标准',
    description: '饼干按品类分区：夹心饼干、苏打饼干、曲奇、威化等独立区域。品牌同区，不同规格垂直陈列，礼品装单独设置节日专区。',
    shelfType: '主货架',
    minSkuCount: 14,
    maxSkuCount: 20,
    facingRule: '每SKU至少2个排面，礼盒1个排面',
    priceTagRule: '统一左侧价签，礼盒配说明价签',
    weight: 8,
    enabled: true,
    updatedAt: '2026-06-02 10:00',
  },
  {
    id: 'ds011',
    category: 'snacks',
    categoryName: '零食',
    subCategory: '糖果巧克力',
    name: '糖果巧克力专区标准',
    description: '巧克力夏季冷柜保存，冬季常温专区陈列。按品牌分区域，国际品牌与国产品牌分区。散装糖果配独立容器与一次性铲勺。',
    shelfType: '主货架',
    minSkuCount: 12,
    maxSkuCount: 18,
    facingRule: '每SKU至少2个排面，条装3个排面',
    priceTagRule: '单颗/单条/盒装分别标价，散装标500g单价',
    promotionRule: '节日配礼品包装专区',
    weight: 8,
    enabled: true,
    updatedAt: '2026-05-25 09:30',
  },
  {
    id: 'ds012',
    category: 'snacks',
    categoryName: '零食',
    subCategory: '坚果炒货',
    name: '坚果炒货陈列标准',
    description: '坚果按品类分：袋装专区与散装专区。高端坚果（碧根果、夏威夷果等）设置精品区，每日坚果小包装放置收银台旁。',
    shelfType: '主货架',
    minSkuCount: 10,
    maxSkuCount: 16,
    facingRule: '每SKU至少2个排面，每日坚果3个排面',
    priceTagRule: '价签标注净含量，散装食品标注单价与保质期',
    weight: 7,
    enabled: true,
    updatedAt: '2026-06-01 16:40',
  },
  {
    id: 'ds013',
    category: 'daily',
    categoryName: '日用品',
    subCategory: '个人洗护',
    name: '洗发水沐浴露陈列',
    description: '个人洗护按品类分区：洗发水、护发素、沐浴露、身体乳。品牌同区，男士/女士/儿童分区管理。大瓶装放底层，旅行装上层。',
    shelfType: '主货架',
    minSkuCount: 12,
    maxSkuCount: 20,
    facingRule: '每SKU至少2个排面',
    priceTagRule: '瓶装背部粘贴隐形防盗标签，价签正面居中',
    weight: 7,
    enabled: true,
    updatedAt: '2026-05-20 11:50',
  },
  {
    id: 'ds014',
    category: 'daily',
    categoryName: '日用品',
    subCategory: '口腔护理',
    name: '牙膏牙刷陈列规范',
    description: '牙膏按功效分：美白、抗敏、中药、儿童。牙刷与牙膏相邻陈列，软毛/中毛/硬毛分区域，儿童牙刷独立挂钩专区。',
    shelfType: '主货架',
    minSkuCount: 10,
    maxSkuCount: 16,
    facingRule: '每SKU至少2个排面，牙刷挂装≥5支/排',
    priceTagRule: '组合装单独价签，注明套装内容',
    weight: 6,
    enabled: true,
    updatedAt: '2026-05-28 14:10',
  },
  {
    id: 'ds015',
    category: 'daily',
    categoryName: '日用品',
    subCategory: '纸品湿巾',
    name: '卫生纸品堆头标准',
    description: '卷纸、抽纸、湿巾分区域。卷纸入口堆头+货架陈列并行，抽纸主货架，湿巾常温+冷柜（夏季）双通道。按提/包/盒分类。',
    shelfType: '堆头+主货架',
    minSkuCount: 10,
    maxSkuCount: 16,
    facingRule: '堆头打底6提以上，货架每SKU2排面',
    priceTagRule: '堆头大价签，单包/整提双标价',
    promotionRule: '促销组合装设专区，配买赠标识',
    weight: 7,
    enabled: true,
    updatedAt: '2026-06-03 12:00',
  },
  {
    id: 'ds016',
    category: 'fresh',
    categoryName: '鲜食',
    subCategory: '三明治',
    name: '三明治冷柜陈列标准',
    description: '三明治统一冷藏冷柜（0-4°C），按口味分区域陈列，当日新品前置。保质期严格遵守，临期品单独标记并贴折扣标签。',
    shelfType: '冷柜',
    minSkuCount: 6,
    maxSkuCount: 10,
    facingRule: '每SKU至少2个排面，当日鲜品≥3排面',
    priceTagRule: '价签标注生产日期与保质期，临期品红色标注',
    promotionRule: '晚间临期折扣标识醒目，19:00后8折，21:00后5折',
    weight: 9,
    enabled: true,
    updatedAt: '2026-06-07 07:00',
  },
  {
    id: 'ds017',
    category: 'fresh',
    categoryName: '鲜食',
    subCategory: '便当饭团',
    name: '便当饭团陈列规范',
    description: '便当与饭团分区冷藏，按品类分：荤食便当、素食便当、饭团。口味标签朝外，温度监控0-4°C。微波加热区相邻设置。',
    shelfType: '冷柜',
    minSkuCount: 8,
    maxSkuCount: 14,
    facingRule: '每SKU至少2个排面，热销便当3个排面',
    priceTagRule: '生产日期每批次单独标注',
    promotionRule: '配组合套餐价（便当+饮料+小食）',
    weight: 9,
    enabled: true,
    updatedAt: '2026-06-06 07:30',
  },
  {
    id: 'ds018',
    category: 'fresh',
    categoryName: '鲜食',
    subCategory: '面包烘焙',
    name: '面包糕点陈列标准',
    description: '面包按品类分：吐司、餐包、丹麦、蛋糕。独立封闭展示柜，温度常温（≤25°C）。短保面包每日更新，当日现烤单独标记。',
    shelfType: '面包柜',
    minSkuCount: 8,
    maxSkuCount: 14,
    facingRule: '每SKU至少2个排面，吐司3个排面',
    priceTagRule: '现烤面包贴生产时间标签',
    promotionRule: '每日18:00后面包8折，配试吃盘',
    weight: 8,
    enabled: true,
    updatedAt: '2026-06-05 06:45',
  },
  {
    id: 'ds019',
    category: 'frozen',
    categoryName: '冷冻食品',
    subCategory: '冷冻水饺',
    name: '冷冻水饺陈列规范',
    description: '水饺汤圆统一卧式冷冻冰柜（-18°C以下），按品类分区：水饺、汤圆、面点。品牌同区，大袋装底层，小袋装上中层。',
    shelfType: '卧式冰柜',
    minSkuCount: 8,
    maxSkuCount: 14,
    facingRule: '每SKU至少2个排面，品牌专区',
    priceTagRule: '价签贴冰柜上方横梁，与产品对应',
    promotionRule: '促销组合装（水饺+汤圆）设专区',
    weight: 7,
    enabled: true,
    updatedAt: '2026-05-22 13:30',
  },
  {
    id: 'ds020',
    category: 'frozen',
    categoryName: '冷冻食品',
    subCategory: '冰淇淋',
    name: '冰淇淋冰柜陈列',
    description: '冰淇淋统一立式冷冻冰柜（-22°C以下），按品牌分区域，盒装/杯装/棒支分区。高端专柜设独立玻璃门，夏季增设辅助冷冻柜。',
    shelfType: '立式冷柜',
    minSkuCount: 12,
    maxSkuCount: 20,
    facingRule: '每SKU至少2个排面，爆款3个排面',
    priceTagRule: '每个柜门贴价格清单，单品独立价签',
    promotionRule: '夏季配冰柜外贴广告画，新品配试吃',
    weight: 9,
    enabled: true,
    updatedAt: '2026-06-04 15:20',
  },
  {
    id: 'ds021',
    category: 'frozen',
    categoryName: '冷冻食品',
    subCategory: '冷冻肉制品',
    name: '冷冻肉制品陈列规范',
    description: '肉制品分区管理：禽类、畜类、水产。独立包装正面朝外，注意品牌分区。严格监控冷冻温度，保持冰柜清洁无异味。',
    shelfType: '卧式冰柜',
    minSkuCount: 8,
    maxSkuCount: 12,
    facingRule: '每SKU至少2个排面',
    priceTagRule: '价签标注产地与重量',
    weight: 6,
    enabled: true,
    updatedAt: '2026-05-26 10:00',
  },
];

const generateMockItems = (taskId: string, count: number): InspectionItem[] => {
  const categories: { type: CategoryType; name: string }[] = [
    { type: 'drinks', name: '饮料' },
    { type: 'snacks', name: '零食' },
    { type: 'daily', name: '日用品' },
    { type: 'fresh', name: '生鲜' },
    { type: 'frozen', name: '冷冻' },
    { type: 'others', name: '其他' },
  ];
  const standards = [
    { code: 'DS001', name: '可乐货架陈列标准' },
    { code: 'DS002', name: '薯片端架陈列标准' },
    { code: 'DS003', name: '洗漱用品陈列标准' },
    { code: 'DS004', name: '冷藏柜温度标准' },
    { code: 'DS005', name: '促销堆头陈列标准' },
    { code: 'DS006', name: '价签规范检查' },
    { code: 'DS007', name: '货架排面标准' },
    { code: 'DS008', name: '冷柜商品陈列' },
  ];
  const items: InspectionItem[] = [];
  for (let i = 0; i < count; i++) {
    const cat = categories[i % categories.length];
    const std = standards[i % standards.length];
    const statuses: ItemStatus[] = ['pending', 'pass', 'fail', 'pending', 'pending'];
    const status = statuses[i % statuses.length];
    items.push({
      id: `item-${taskId}-${i + 1}`,
      taskId,
      standardId: `std-${i + 1}`,
      standardName: std.name,
      standardCode: `${std.code}-${(i % 8) + 1}`,
      category: cat.type,
      categoryName: cat.name,
      sortOrder: i + 1,
      weight: 10,
      status,
      photoRecords: status !== 'pending' ? [
        {
          id: `ph-${taskId}-${i}-1`,
          itemId: `item-${taskId}-${i + 1}`,
          taskId,
          url: `https://picsum.photos/seed/${taskId}${i}1/400/300`,
          uploadedAt: '2026-06-09 10:30',
          uploadedBy: 'u002',
          marks: status === 'fail' ? [
            { id: `mk-1`, photoId: `ph-${taskId}-${i}-1`, type: 'outOfStock', x: 30, y: 40 },
            { id: `mk-2`, photoId: `ph-${taskId}-${i}-1`, type: 'priceTag', x: 65, y: 55 },
          ] : [],
        },
      ] : [],
      issueRecords: status === 'fail' ? [
        {
          id: `issue-${taskId}-${i}-1`,
          itemId: `item-${taskId}-${i + 1}`,
          taskId,
          type: 'outOfStock',
          typeName: '缺货',
          priority: 'high',
          priorityName: '高',
          description: '可口可乐 330ml 缺货约2个排面，已持续超过12小时',
          skuName: '可口可乐 330ml',
          photoId: `ph-${taskId}-${i}-1`,
          createdAt: '2026-06-09 10:35',
          createdBy: 'u002',
          resolved: false,
        },
      ] : [],
      score: status === 'pass' ? 10 : status === 'fail' ? 4 : undefined,
      maxScore: 10,
      checkedAt: status !== 'pending' ? '2026-06-09 10:30' : undefined,
      checkedBy: status !== 'pending' ? 'u002' : undefined,
    });
  }
  return items;
};

const countItems = (items: InspectionItem[], status: ItemStatus | 'completed') => {
  if (status === 'completed') {
    return items.filter((i) => i.status === 'pass' || i.status === 'fail').length;
  }
  return items.filter((i) => i.status === status).length;
};

const mockTasksData: {
  id: string;
  title: string;
  storeId: string;
  storeName: string;
  creatorId: string;
  creatorName: string;
  assigneeId: string;
  assigneeName: string;
  type: TaskType;
  status: TaskStatus;
  startTime: string;
  deadline: string;
  score?: number;
  itemCount: number;
}[] = [
  {
    id: 't001',
    title: '6月第二周周巡检',
    storeId: 's001',
    storeName: '陆家嘴旗舰店',
    creatorId: 'u001',
    creatorName: '张明远',
    assigneeId: 'u002',
    assigneeName: '李雪琴',
    type: 'weekly',
    status: 'in_progress',
    startTime: '2026-06-09 09:00',
    deadline: '2026-06-12 18:00',
    itemCount: 25,
  },
  {
    id: 't002',
    title: '端午促销专项巡检',
    storeId: 's002',
    storeName: '南京东路店',
    creatorId: 'u001',
    creatorName: '张明远',
    assigneeId: 'u003',
    assigneeName: '王建国',
    type: 'promotion',
    status: 'pending',
    startTime: '2026-06-10 10:00',
    deadline: '2026-06-14 20:00',
    itemCount: 18,
  },
  {
    id: 't003',
    title: '5月月度综合巡检',
    storeId: 's003',
    storeName: '徐家汇店',
    creatorId: 'u001',
    creatorName: '张明远',
    assigneeId: 'u004',
    assigneeName: '赵美丽',
    type: 'monthly',
    status: 'completed',
    startTime: '2026-05-25 09:00',
    deadline: '2026-05-30 18:00',
    score: 88,
    itemCount: 40,
  },
  {
    id: 't004',
    title: '临时抽检-缺货问题',
    storeId: 's004',
    storeName: '五角场店',
    creatorId: 'u001',
    creatorName: '张明远',
    assigneeId: 'u005',
    assigneeName: '孙大伟',
    type: 'temporary',
    status: 'overdue',
    startTime: '2026-06-05 09:00',
    deadline: '2026-06-07 18:00',
    itemCount: 12,
  },
  {
    id: 't005',
    title: '6月第一周周巡检',
    storeId: 's005',
    storeName: '中山公园店',
    creatorId: 'u001',
    creatorName: '张明远',
    assigneeId: 'u006',
    assigneeName: '周小芳',
    type: 'weekly',
    status: 'completed',
    startTime: '2026-06-02 09:00',
    deadline: '2026-06-05 18:00',
    score: 85,
    itemCount: 22,
  },
  {
    id: 't006',
    title: '冷饮陈列专项检查',
    storeId: 's001',
    storeName: '陆家嘴旗舰店',
    creatorId: 'u001',
    creatorName: '张明远',
    assigneeId: 'u002',
    assigneeName: '李雪琴',
    type: 'temporary',
    status: 'pending',
    startTime: '2026-06-10 14:00',
    deadline: '2026-06-11 18:00',
    itemCount: 10,
  },
];

const mockTasks: InspectionTask[] = mockTasksData.map((t) => {
  const items = generateMockItems(t.id, t.itemCount);
  return {
    ...t,
    completedItems: countItems(items, 'completed'),
    passItems: countItems(items, 'pass'),
    failItems: countItems(items, 'fail'),
    items,
    createdAt: t.startTime,
  };
});

const mockOrders: RectificationOrder[] = [
  {
    id: 'ro001',
    taskId: 't003',
    storeId: 's002',
    storeName: '南京东路店',
    itemName: '堆头促销陈列',
    issueType: 'promotion',
    description: '促销堆头商品数量不足，缺少POP海报',
    assigneeName: '王建国',
    assignorName: '张明远',
    deadline: '2026-06-13 18:00',
    status: 'pending',
    priority: 'high',
    createdAt: '2026-06-09 14:30',
  },
  {
    id: 'ro002',
    taskId: 't001',
    storeId: 's001',
    storeName: '陆家嘴旗舰店',
    itemName: '价签检查',
    issueType: 'price_tag',
    description: '饮料区3个商品价签缺失，2个价签与商品不对应',
    assigneeName: '李雪琴',
    assignorName: '张明远',
    deadline: '2026-06-11 12:00',
    status: 'processing',
    priority: 'medium',
    createdAt: '2026-06-09 10:15',
  },
  {
    id: 'ro003',
    taskId: 't004',
    storeId: 's004',
    storeName: '五角场店',
    itemName: '缺货商品',
    issueType: 'out_of_stock',
    description: '零食区15个SKU缺货超过48小时',
    assigneeName: '孙大伟',
    assignorName: '张明远',
    deadline: '2026-06-08 18:00',
    status: 'reviewing',
    priority: 'high',
    createdAt: '2026-06-06 09:00',
  },
  {
    id: 'ro004',
    taskId: 't003',
    storeId: 's003',
    storeName: '徐家汇店',
    itemName: '冷柜温度',
    issueType: 'display',
    description: '冷藏柜温度超标，显示8°C，要求≤4°C',
    assigneeName: '赵美丽',
    assignorName: '张明远',
    deadline: '2026-06-05 18:00',
    status: 'passed',
    priority: 'high',
    createdAt: '2026-06-03 11:20',
  },
];

const skuList = [
  { name: '可口可乐 330ml*24罐', category: '饮料', baseStock: 20, baseSafety: 15 },
  { name: '百事可乐 500ml*24瓶', category: '饮料', baseStock: 25, baseSafety: 18 },
  { name: '农夫山泉 550ml*24瓶', category: '饮料', baseStock: 30, baseSafety: 20 },
  { name: '东方乌龙茶 500ml*15瓶', category: '饮料', baseStock: 18, baseSafety: 12 },
  { name: '红牛功能饮料 250ml*24罐', category: '饮料', baseStock: 15, baseSafety: 10 },
  { name: '乐事薯片 原味 70g', category: '零食', baseStock: 20, baseSafety: 15 },
  { name: '奥利奥饼干 原味 116g', category: '零食', baseStock: 25, baseSafety: 18 },
  { name: '德芙巧克力 丝滑牛奶 43g', category: '零食', baseStock: 18, baseSafety: 12 },
  { name: '三只松鼠每日坚果 750g', category: '零食', baseStock: 10, baseSafety: 8 },
  { name: '康师傅红烧牛肉面 5连包', category: '零食', baseStock: 22, baseSafety: 16 },
  { name: '海飞丝洗发水 750ml', category: '日用品', baseStock: 12, baseSafety: 8 },
  { name: '云南白药牙膏 180g', category: '日用品', baseStock: 15, baseSafety: 10 },
  { name: '维达抽纸 3层120抽', category: '日用品', baseStock: 30, baseSafety: 20 },
  { name: '蓝月亮洗衣液 3kg', category: '日用品', baseStock: 10, baseSafety: 7 },
  { name: '全家火腿蛋三明治 150g', category: '鲜食', baseStock: 20, baseSafety: 15 },
  { name: '奥尔良鸡腿便当 350g', category: '鲜食', baseStock: 15, baseSafety: 10 },
  { name: '三文鱼寿司拼盘 180g', category: '鲜食', baseStock: 8, baseSafety: 6 },
  { name: '曼可顿全麦面包 400g', category: '鲜食', baseStock: 12, baseSafety: 8 },
  { name: '思念三鲜水饺 1kg', category: '冷冻', baseStock: 15, baseSafety: 10 },
  { name: '和路雪梦龙冰淇淋 64g', category: '冷冻', baseStock: 25, baseSafety: 18 },
];

const generateReplenishments = (): ReplenishmentSuggestion[] => {
  const result: ReplenishmentSuggestion[] = [];
  let id = 1;
  const stores = ['s001', 's002', 's003', 's004', 's005'];
  const storeNames: Record<string, string> = {
    s001: '陆家嘴旗舰店',
    s002: '南京东路店',
    s003: '徐家汇店',
    s004: '五角场店',
    s005: '中山公园店',
  };
  
  stores.forEach((storeId) => {
    const seed = parseInt(storeId.replace('s', ''));
    skuList.forEach((sku, idx) => {
      const variance = ((seed * 7 + idx * 13) % 100) - 50;
      const currentStock = Math.max(0, sku.baseStock + Math.floor(variance * 0.3));
      const safetyStock = sku.baseSafety;
      const suggestedQty = Math.max(0, safetyStock * 2 - currentStock + Math.floor(Math.random() * 10));
      
      let urgency: 'normal' | 'urgent' | 'critical';
      if (currentStock === 0 || currentStock < safetyStock * 0.2) {
        urgency = 'critical';
      } else if (currentStock < safetyStock * 0.6) {
        urgency = 'urgent';
      } else {
        urgency = 'normal';
      }
      
      let priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
      if (urgency === 'critical') priority = 'critical';
      else if (urgency === 'urgent') priority = 'high';
      else priority = 'medium';
      
      const statuses: ReplenishmentSuggestion['status'][] = ['pending', 'pending', 'pending', 'ordered', 'completed', 'cancelled'];
      const statusIndex = (seed + idx) % statuses.length;
      const status = statuses[statusIndex];
      
      const daysAgo = (idx * 2 + seed) % 10;
      const date = new Date('2026-06-10');
      date.setDate(date.getDate() - daysAgo);
      const lastReplenishedAt = date.toISOString().slice(0, 10);
      
      if (currentStock < safetyStock || status !== 'pending') {
        result.push({
          id: `rp${String(id++).padStart(3, '0')}`,
          storeId,
          storeName: storeNames[storeId],
          skuId: `sku${String(idx + 1).padStart(3, '0')}`,
          skuName: sku.name,
          category: sku.category,
          currentStock,
          safetyStock,
          suggestedQty,
          urgency,
          priority,
          status,
          lastReplenishedAt,
        });
      }
    });
  });
  
  return result;
};

const mockReplenishments: ReplenishmentSuggestion[] = generateReplenishments();

const mockScores: StoreScore[] = [
  {
    storeId: 's001',
    storeName: '陆家嘴旗舰店',
    period: '2026-W23',
    periodType: 'weekly',
    totalScore: 92,
    displayScore: 95,
    stockScore: 88,
    priceScore: 94,
    promotionScore: 90,
    rectificationScore: 93,
    taskCount: 4,
    rectificationRate: 100,
    rank: 1,
  },
  {
    storeId: 's003',
    storeName: '徐家汇店',
    period: '2026-W23',
    periodType: 'weekly',
    totalScore: 88,
    displayScore: 90,
    stockScore: 85,
    priceScore: 92,
    promotionScore: 86,
    rectificationScore: 87,
    taskCount: 3,
    rectificationRate: 88,
    rank: 2,
  },
  {
    storeId: 's005',
    storeName: '中山公园店',
    period: '2026-W23',
    periodType: 'weekly',
    totalScore: 85,
    displayScore: 88,
    stockScore: 82,
    priceScore: 89,
    promotionScore: 83,
    rectificationScore: 84,
    taskCount: 3,
    rectificationRate: 85,
    rank: 3,
  },
];

export interface NewTaskForm {
  type: TaskType;
  title: string;
  storeIds: string[];
  assigneeId: string;
  startTime: string;
  deadline: string;
  categories: CategoryType[];
}

interface AppState {
  currentUser: User;
  selectedStoreId: string;
  users: User[];
  stores: Store[];
  standards: DisplayStandard[];
  tasks: InspectionTask[];
  orders: RectificationOrder[];
  replenishments: ReplenishmentSuggestion[];
  scores: StoreScore[];

  switchRole: () => void;
  setSelectedStoreId: (id: string) => void;
  updateOrderStatus: (orderId: string, status: RectificationOrder['status']) => void;
  getStoresByCurrentUser: () => Store[];
  getTasksByStoreId: (storeId: string) => InspectionTask[];
  getOrdersByStoreId: (storeId: string) => RectificationOrder[];
  getReplenishmentsByStoreId: (storeId: string) => ReplenishmentSuggestion[];
  getTaskById: (taskId: string) => InspectionTask | undefined;
  getAllTasks: () => InspectionTask[];
  createTask: (form: NewTaskForm) => InspectionTask;
  updateItemStatus: (taskId: string, itemId: string, status: ItemStatus) => void;
  addPhotoRecord: (taskId: string, itemId: string, photo: PhotoRecord) => void;
  addIssueRecord: (taskId: string, itemId: string, issue: IssueRecord) => void;

  addStandard: (standard: Omit<DisplayStandard, 'id' | 'updatedAt'>) => DisplayStandard;
  updateStandard: (id: string, data: Partial<DisplayStandard>) => void;
  toggleStandard: (id: string) => void;
  deleteStandard: (id: string) => void;

  setFloorPlan: (storeId: string, imageUrl: string) => void;
  addShelf: (storeId: string, shelf: Omit<Shelf, 'id'>) => Shelf;
  updateShelf: (storeId: string, shelfId: string, data: Partial<Shelf>) => void;
  deleteShelf: (storeId: string, shelfId: string) => void;

  batchUpdateReplenishmentStatus: (ids: string[], status: ReplenishmentSuggestion['status']) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 10);

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: mockUsers[0],
  selectedStoreId: 's001',
  users: mockUsers,
  stores: mockStores,
  standards: mockStandards,
  tasks: mockTasks,
  orders: mockOrders,
  replenishments: mockReplenishments,
  scores: mockScores,

  switchRole: () => {
    const { currentUser, users } = get();
    const otherRole = currentUser.role === 'supervisor' ? 'manager' : 'supervisor';
    const targetUser = users.find((u) => u.role === otherRole);
    if (targetUser) {
      set({
        currentUser: targetUser,
        selectedStoreId: targetUser.storeIds[0] || 's001',
      });
    }
  },

  setSelectedStoreId: (id) => set({ selectedStoreId: id }),

  updateOrderStatus: (orderId, status) => {
    const { orders } = get();
    const updatedOrders = orders.map((order) =>
      order.id === orderId ? { ...order, status } : order
    );
    set({ orders: updatedOrders });
  },

  getStoresByCurrentUser: () => {
    const { currentUser, stores } = get();
    if (currentUser.role === 'supervisor') {
      return stores;
    }
    return stores.filter((s) => currentUser.storeIds.includes(s.id));
  },

  getTasksByStoreId: (storeId) => {
    const { tasks } = get();
    return tasks.filter((t) => t.storeId === storeId);
  },

  getOrdersByStoreId: (storeId) => {
    const { orders } = get();
    return orders.filter((o) => o.storeId === storeId);
  },

  getReplenishmentsByStoreId: (storeId) => {
    const { replenishments } = get();
    return replenishments.filter((r) => r.storeId === storeId);
  },

  getTaskById: (taskId) => {
    const { tasks } = get();
    return tasks.find((t) => t.id === taskId);
  },

  getAllTasks: () => {
    const { tasks, currentUser } = get();
    if (currentUser.role === 'supervisor') {
      return tasks;
    }
    return tasks.filter((t) => currentUser.storeIds.includes(t.storeId));
  },

  createTask: (form) => {
    const { currentUser, stores, users } = get();
    const categoryMap: Record<CategoryType, string> = {
      drinks: '饮料', snacks: '零食', daily: '日用品',
      fresh: '生鲜', frozen: '冷冻', others: '其他',
    };
    const defaultCats: CategoryType[] = ['drinks', 'snacks', 'daily'];
    const createdTasks: InspectionTask[] = form.storeIds.map((storeId, idx) => {
      const store = stores.find((s) => s.id === storeId);
      const assignee = users.find((u) => u.id === form.assigneeId);
      const categories: CategoryType[] = form.categories.length > 0 ? (form.categories as CategoryType[]) : defaultCats;
      const itemCount = categories.length * 6 + Math.floor(Math.random() * 5);
      const items = generateMockItems(`new-${generateId()}`, itemCount).map((item, i) => {
        const cat: CategoryType = categories[i % categories.length];
        return {
          ...item,
          category: cat,
          categoryName: categoryMap[cat],
          status: 'pending' as ItemStatus,
          photoRecords: [],
          issueRecords: [],
          score: undefined,
          checkedAt: undefined,
          checkedBy: undefined,
        };
      });
      return {
        id: `t-${generateId()}-${idx}`,
        title: form.title,
        storeId,
        storeName: store?.name || storeId,
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        assigneeId: form.assigneeId,
        assigneeName: assignee?.name || form.assigneeId,
        type: form.type,
        status: 'pending' as TaskStatus,
        startTime: form.startTime,
        deadline: form.deadline,
        itemCount,
        completedItems: 0,
        passItems: 0,
        failItems: 0,
        items,
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };
    });
    set((state) => ({ tasks: [...createdTasks, ...state.tasks] }));
    return createdTasks[0];
  },

  updateItemStatus: (taskId, itemId, status) => {
    set((state) => {
      const tasks = state.tasks.map((task) => {
        if (task.id !== taskId) return task;
        const items = task.items.map((item) => {
          if (item.id !== itemId) return item;
          return {
            ...item,
            status,
            checkedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
            checkedBy: state.currentUser.id,
            score: status === 'pass' ? item.maxScore : status === 'fail' ? Math.floor(item.maxScore * 0.4) : 0,
          };
        });
        const completed = countItems(items, 'completed');
        const pass = countItems(items, 'pass');
        const fail = countItems(items, 'fail');
        const allDone = items.every((i) => i.status !== 'pending');
        return {
          ...task,
          items,
          completedItems: completed,
          passItems: pass,
          failItems: fail,
          status: allDone ? 'completed' as TaskStatus : (completed > 0 ? 'in_progress' as TaskStatus : task.status),
          score: allDone ? Math.round(items.reduce((acc, i) => acc + (i.score || 0), 0) / items.reduce((acc, i) => acc + i.maxScore, 0) * 100) : task.score,
        };
      });
      return { tasks };
    });
  },

  addPhotoRecord: (taskId, itemId, photo) => {
    set((state) => {
      const tasks = state.tasks.map((task) => {
        if (task.id !== taskId) return task;
        const items = task.items.map((item) => {
          if (item.id !== itemId) return item;
          return { ...item, photoRecords: [...item.photoRecords, photo] };
        });
        return { ...task, items };
      });
      return { tasks };
    });
  },

  addIssueRecord: (taskId, itemId, issue) => {
    set((state) => {
      const tasks = state.tasks.map((task) => {
        if (task.id !== taskId) return task;
        const items = task.items.map((item) => {
          if (item.id !== itemId) return item;
          return { ...item, issueRecords: [...item.issueRecords, issue] };
        });
        return { ...task, items };
      });
      return { tasks };
    });
  },

  addStandard: (standard) => {
    const newStandard: DisplayStandard = {
      ...standard,
      id: `ds-${generateId()}`,
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    set((state) => ({ standards: [newStandard, ...state.standards] }));
    return newStandard;
  },

  updateStandard: (id, data) => {
    set((state) => ({
      standards: state.standards.map((s) =>
        s.id === id
          ? { ...s, ...data, updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') }
          : s
      ),
    }));
  },

  toggleStandard: (id) => {
    set((state) => ({
      standards: state.standards.map((s) =>
        s.id === id
          ? { ...s, enabled: !s.enabled, updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') }
          : s
      ),
    }));
  },

  deleteStandard: (id) => {
    set((state) => ({
      standards: state.standards.filter((s) => s.id !== id),
    }));
  },

  setFloorPlan: (storeId, imageUrl) => {
    set((state) => ({
      stores: state.stores.map((s) =>
        s.id === storeId ? { ...s, floorPlanUrl: imageUrl } : s
      ),
    }));
  },

  addShelf: (storeId, shelf) => {
    const newShelf: Shelf = {
      ...shelf,
      id: `sh-${generateId()}`,
    };
    set((state) => ({
      stores: state.stores.map((s) =>
        s.id === storeId ? { ...s, shelves: [...s.shelves, newShelf] } : s
      ),
    }));
    return newShelf;
  },

  updateShelf: (storeId, shelfId, data) => {
    set((state) => ({
      stores: state.stores.map((s) =>
        s.id === storeId
          ? {
              ...s,
              shelves: s.shelves.map((sh) =>
                sh.id === shelfId ? { ...sh, ...data } : sh
              ),
            }
          : s
      ),
    }));
  },

  deleteShelf: (storeId, shelfId) => {
    set((state) => ({
      stores: state.stores.map((s) =>
        s.id === storeId
          ? { ...s, shelves: s.shelves.filter((sh) => sh.id !== shelfId) }
          : s
      ),
    }));
  },

  batchUpdateReplenishmentStatus: (ids, status) => {
    set((state) => ({
      replenishments: state.replenishments.map((r) =>
        ids.includes(r.id) ? { ...r, status } : r
      ),
    }));
  },
}));
