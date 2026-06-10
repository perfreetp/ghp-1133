export type UserRole = 'supervisor' | 'storeManager';

export type StoreStatus = 'normal' | 'warning' | 'critical';

export type TaskStatus = 'pending' | 'inProgress' | 'completed' | 'overdue';

export type IssuePriority = 'low' | 'medium' | 'high' | 'urgent';

export type RectificationStatus = 'pending' | 'inProgress' | 'submitted' | 'approved' | 'rejected' | 'completed';

export type CategoryType = 'drinks' | 'snacks' | 'daily' | 'fresh' | 'frozen' | 'others';

export type IssueType = 'outOfStock' | 'misplaced' | 'priceTag' | 'promotion' | 'cleanliness' | 'others';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  phone: string;
  email: string;
  avatar?: string;
  storeId?: string;
  region?: string;
  createdAt: string;
  lastLoginAt?: string;
  status: 'active' | 'inactive';
}

export interface Shelf {
  id: string;
  storeId: string;
  name: string;
  code: string;
  type: 'shelf' | 'endCap' | 'checkout' | 'promotion';
  floor: number;
  layers: number;
  width: number;
  height: number;
  positionX: number;
  positionY: number;
  rotation: number;
  category?: CategoryType;
  capacity: number;
  currentFill: number;
  status: 'normal' | 'partial' | 'empty';
  remark?: string;
}

export interface HeatmapZone {
  id: string;
  storeId: string;
  name: string;
  type: 'high' | 'medium' | 'low';
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  avgFootTraffic: number;
  peakFootTraffic: number;
  conversionRate: number;
  timePeriod: 'morning' | 'noon' | 'evening' | 'weekend' | 'all';
}

export interface Store {
  id: string;
  name: string;
  code: string;
  address: string;
  district: string;
  city: string;
  phone: string;
  area: number;
  storeType: 'standard' | 'flagship' | 'community';
  managerId: string;
  managerName: string;
  supervisorId: string;
  supervisorName: string;
  latitude: number;
  longitude: number;
  openingTime: string;
  closingTime: string;
  shelves: Shelf[];
  heatmapData: HeatmapZone[];
  status: StoreStatus;
  avgScore: number;
  lastInspectionAt?: string;
  openDate: string;
  createdAt: string;
}

export interface DisplayStandard {
  id: string;
  code: string;
  name: string;
  category: CategoryType;
  categoryName: string;
  subCategory: string;
  shelfType: string;
  position: string;
  skuCount: number;
  facingsPerSku: number;
  layersRequired: number;
  priceTagRequired: boolean;
  promotionTagRequired: boolean;
  freshnessLevel?: string;
  temperatureRequired?: string;
  description: string;
  imageUrl?: string;
  weight: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  enabled: boolean;
}

export interface InspectionItem {
  id: string;
  taskId: string;
  standardId: string;
  standardName: string;
  standardCode: string;
  category: CategoryType;
  categoryName: string;
  shelfId?: string;
  shelfName?: string;
  sortOrder: number;
  weight: number;
  status: 'pending' | 'pass' | 'fail' | 'na';
  photoRecords: PhotoRecord[];
  issueRecords: IssueRecord[];
  score?: number;
  maxScore: number;
  remark?: string;
  checkedAt?: string;
  checkedBy?: string;
}

export interface InspectionTask {
  id: string;
  code: string;
  name: string;
  storeId: string;
  storeName: string;
  type: 'routine' | 'special' | 'audit';
  status: TaskStatus;
  priority: IssuePriority;
  createdBy: string;
  createdByName: string;
  assignedTo: string;
  assignedToName: string;
  items: InspectionItem[];
  totalItems: number;
  completedItems: number;
  passItems: number;
  failItems: number;
  overallScore?: number;
  maxScore: number;
  startDate: string;
  dueDate: string;
  completedAt?: string;
  createdAt: string;
  remark?: string;
}

export interface PhotoMark {
  id: string;
  photoId: string;
  type: IssueType;
  x: number;
  y: number;
  width: number;
  height: number;
  description?: string;
  skuName?: string;
}

export interface PhotoRecord {
  id: string;
  itemId: string;
  taskId: string;
  url: string;
  thumbnail?: string;
  uploadedAt: string;
  uploadedBy: string;
  marks: PhotoMark[];
  remark?: string;
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
  shelfId?: string;
  shelfName?: string;
  photoId?: string;
  rectificationOrderId?: string;
  createdAt: string;
  createdBy: string;
  resolved?: boolean;
  resolvedAt?: string;
}

export interface RectificationOrder {
  id: string;
  code: string;
  taskId: string;
  taskCode: string;
  storeId: string;
  storeName: string;
  issueId: string;
  issueType: IssueType;
  issueTypeName: string;
  priority: IssuePriority;
  priorityName: string;
  status: RectificationStatus;
  statusName: string;
  description: string;
  imageUrls: string[];
  assignedTo: string;
  assignedToName: string;
  supervisedBy: string;
  supervisedByName: string;
  deadline: string;
  createdAt: string;
  startedAt?: string;
  submittedAt?: string;
  reviewedAt?: string;
  completedAt?: string;
  feedback?: string;
  feedbackImages?: string[];
  reviewOpinion?: string;
  rejectReason?: string;
  reviewTimes: number;
}

export interface OutOfStockRecord {
  id: string;
  taskId: string;
  itemId: string;
  storeId: string;
  storeName: string;
  skuCode: string;
  skuName: string;
  category: CategoryType;
  categoryName: string;
  shelfId?: string;
  shelfName?: string;
  standardCapacity: number;
  currentStock: number;
  stockRate: number;
  outOfStockDays?: number;
  priority: IssuePriority;
  createdAt: string;
  resolved?: boolean;
}

export interface ReplenishmentSuggestion {
  id: string;
  code: string;
  storeId: string;
  storeName: string;
  skuCode: string;
  skuName: string;
  barcode?: string;
  category: CategoryType;
  categoryName: string;
  brand?: string;
  spec?: string;
  unit: string;
  standardCapacity: number;
  currentStock: number;
  safeStock: number;
  suggestedQty: number;
  lastWeekSales: number;
  lastMonthSales: number;
  avgDailySales: number;
  outOfStockDays: number;
  priority: IssuePriority;
  priorityName: string;
  expectedDate: string;
  supplier?: string;
  status: 'pending' | 'ordered' | 'shipped' | 'received' | 'completed' | 'cancelled';
  statusName: string;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  remark?: string;
}

export interface StoreScore {
  id: string;
  storeId: string;
  storeName: string;
  periodType: 'week' | 'month' | 'quarter';
  period: string;
  startDate: string;
  endDate: string;
  overallScore: number;
  maxScore: number;
  rank?: number;
  totalStores?: number;
  displayScore: number;
  displayMaxScore: number;
  stockScore: number;
  stockMaxScore: number;
  priceTagScore: number;
  priceTagMaxScore: number;
  promotionScore: number;
  promotionMaxScore: number;
  cleanlinessScore: number;
  cleanlinessMaxScore: number;
  serviceScore: number;
  serviceMaxScore: number;
  inspectionCount: number;
  issueCount: number;
  rectificationRate: number;
  outOfStockRate: number;
  createdAt: string;
}
