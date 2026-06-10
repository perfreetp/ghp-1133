import { useState, useMemo, useRef, type ReactNode } from 'react';
import {
  BarChart3,
  Calendar,
  Store,
  Download,
  Printer,
  FileText,
  TrendingUp,
  TrendingDown,
  Star,
  ChevronDown,
  Check,
  Award,
  AlertCircle,
  ArrowRight,
  Target,
  CheckCircle2,
  Zap,
  Sparkles,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

type TimePeriod = 'week' | 'month' | 'quarter' | 'custom';
type CompareMode = 'store' | 'trend';

interface StoreRanking {
  rank: number;
  storeId: string;
  storeName: string;
  district: string;
  overallScore: number;
  displayScore: number;
  stockScore: number;
  priceTagScore: number;
  promotionScore: number;
  rectificationScore: number;
  trend: number;
}

const PIE_COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#10B981', '#64748B'];
const BAR_COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#10B981', '#64748B'];

export default function ReportsPage() {
  const { currentUser, getStoresByCurrentUser } = useAppStore();
  const stores = getStoresByCurrentUser();
  const isSupervisor = currentUser.role === 'supervisor';

  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');
  const [compareMode, setCompareMode] = useState<CompareMode>('store');
  const [selectedStores, setSelectedStores] = useState<string[]>(stores.map(s => s.id));
  const [selectedRankStoreId, setSelectedRankStoreId] = useState<string>(stores[0]?.id || '');
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);

  const toggleStore = (storeId: string) => {
    if (selectedStores.includes(storeId)) {
      if (selectedStores.length > 1) {
        setSelectedStores(selectedStores.filter(id => id !== storeId));
      }
    } else {
      setSelectedStores([...selectedStores, storeId]);
    }
  };

  const selectAllStores = () => {
    setSelectedStores(stores.map(s => s.id));
  };

  const timePeriods: { key: TimePeriod; label: string }[] = [
    { key: 'week', label: '本周' },
    { key: 'month', label: '本月' },
    { key: 'quarter', label: '本季' },
    { key: 'custom', label: '自定义' },
  ];

  const storeRankings: StoreRanking[] = useMemo(() => {
    const baseData = [
      { display: 28, stock: 18, price: 14, promo: 14, rect: 19 },
      { display: 27, stock: 17, price: 14, promo: 13, rect: 18 },
      { display: 26, stock: 17, price: 13, promo: 13, rect: 17 },
      { display: 25, stock: 16, price: 13, promo: 12, rect: 17 },
      { display: 25, stock: 16, price: 12, promo: 12, rect: 16 },
      { display: 24, stock: 15, price: 12, promo: 12, rect: 15 },
      { display: 24, stock: 15, price: 12, promo: 11, rect: 15 },
      { display: 23, stock: 14, price: 11, promo: 11, rect: 14 },
      { display: 22, stock: 14, price: 11, promo: 10, rect: 14 },
      { display: 22, stock: 13, price: 10, promo: 10, rect: 13 },
    ];

    return stores.slice(0, 10).map((store, idx) => {
      const d = baseData[idx];
      const overall = +(d.display + d.stock + d.price + d.promo + d.rect).toFixed(1);
      return {
        rank: idx + 1,
        storeId: store.id,
        storeName: store.name,
        district: store.district,
        overallScore: overall,
        displayScore: d.display,
        stockScore: d.stock,
        priceTagScore: d.price,
        promotionScore: d.promo,
        rectificationScore: d.rect,
        trend: (idx % 3 === 0 ? 1 : -1) * (+(Math.random() * 5 + 0.5).toFixed(1)),
      };
    }).sort((a, b) => b.overallScore - a.overallScore).map((r, idx) => ({ ...r, rank: idx + 1 }));
  }, [stores]);

  const selectedRanking = storeRankings.find(r => r.storeId === selectedRankStoreId) || storeRankings[0];

  const radarData = useMemo(() => {
    const store = selectedRanking || storeRankings[0];
    if (!store) return [];
    return [
      { subject: '陈列规范', 选中门店: +(store.displayScore / 30 * 100).toFixed(0), 区域平均: 78 },
      { subject: '库存管理', 选中门店: +(store.stockScore / 20 * 100).toFixed(0), 区域平均: 75 },
      { subject: '价签准确', 选中门店: +(store.priceTagScore / 15 * 100).toFixed(0), 区域平均: 82 },
      { subject: '促销执行', 选中门店: +(store.promotionScore / 15 * 100).toFixed(0), 区域平均: 73 },
      { subject: '整改响应', 选中门店: +(store.rectificationScore / 20 * 100).toFixed(0), 区域平均: 80 },
      { subject: '卫生标准', 选中门店: 88, 区域平均: 81 },
    ];
  }, [selectedRanking, storeRankings]);

  const trendData = [
    { week: 'W19', 选中门店: 82.1, 区域平均: 78.5, Top10: 90.2 },
    { week: 'W20', 选中门店: 83.5, 区域平均: 79.1, Top10: 90.8 },
    { week: 'W21', 选中门店: 84.2, 区域平均: 79.8, Top10: 91.0 },
    { week: 'W22', 选中门店: 85.8, 区域平均: 80.3, Top10: 91.5 },
    { week: 'W23', 选中门店: 86.3, 区域平均: 81.0, Top10: 92.1 },
    { week: 'W24', 选中门店: 87.1, 区域平均: 81.5, Top10: 92.4 },
    { week: 'W25', 选中门店: 88.0, 区域平均: 82.1, Top10: 93.0 },
    { week: 'W26', 选中门店: 88.6, 区域平均: 82.6, Top10: 93.5 },
  ];

  const pieData = [
    { name: '缺货', value: 128 },
    { name: '错位', value: 95 },
    { name: '价签', value: 76 },
    { name: '促销', value: 52 },
    { name: '陈列', value: 68 },
    { name: '其他', value: 31 },
  ];

  const barData = stores.slice(0, 6).map((store, idx) => ({
    name: store.name.replace(/店$/, '').slice(0, 4),
    缺货: 18 + ((idx * 7) % 15),
    错位: 12 + ((idx * 5) % 12),
    价签: 8 + ((idx * 3) % 10),
    促销: 6 + ((idx * 4) % 8),
    陈列: 9 + ((idx * 6) % 11),
    其他: 3 + (idx % 5),
  }));

  const filteredRankings = useMemo(() => {
    return storeRankings.filter(r => selectedStores.includes(r.storeId));
  }, [storeRankings, selectedStores]);

  const topStores = filteredRankings.slice(0, 3);
  const bottomStores = [...filteredRankings].sort((a, b) => a.overallScore - b.overallScore).slice(0, 3);

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  };

  const handleExportExcel = () => {
    const htmlContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="UTF-8">
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>门店经营报表</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
<style>
  td, th { padding: 6px 10px; font-size: 12px; font-family: 'Microsoft YaHei', sans-serif; }
  th { background-color: #4F46E5; color: #FFFFFF; font-weight: bold; text-align: center; border: 1px solid #3730A3; }
  td { border: 1px solid #D1D5DB; text-align: center; }
  tr:nth-child(even) td { background-color: #F8FAFC; }
  .score { font-weight: bold; color: #4F46E5; }
  .up { color: #10B981; }
  .down { color: #EF4444; }
</style>
</head>
<body>
<table>
  <tr>
    <th>排名</th>
    <th>门店名称</th>
    <th>区域</th>
    <th>综合评分</th>
    <th>陈列得分</th>
    <th>库存得分</th>
    <th>价签得分</th>
    <th>促销得分</th>
    <th>整改得分</th>
    <th>环比变化</th>
  </tr>
  ${filteredRankings.map(r => `
  <tr>
    <td>${r.rank}</td>
    <td style="text-align:left;">${r.storeName}</td>
    <td>${r.district}</td>
    <td class="score">${r.overallScore.toFixed(1)}</td>
    <td>${r.displayScore}</td>
    <td>${r.stockScore}</td>
    <td>${r.priceTagScore}</td>
    <td>${r.promotionScore}</td>
    <td>${r.rectificationScore}</td>
    <td class="${r.trend >= 0 ? 'up' : 'down'}">${r.trend >= 0 ? '↑' : '↓'}${Math.abs(r.trend).toFixed(1)}</td>
  </tr>`).join('')}
</table>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `门店经营报表_${formatDate(new Date())}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const weeklyReportRef = useRef<HTMLDivElement>(null);

  const generateWeeklyReportHTML = () => {
    const now = new Date();
    const weekNum = Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7);
    const reportDate = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

    const avgScore = filteredRankings.length > 0
      ? (filteredRankings.reduce((sum, r) => sum + r.overallScore, 0) / filteredRankings.length).toFixed(1)
      : '0';

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>上海区域门店经营周报</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
      padding: 40px;
      color: #0f172a;
      line-height: 1.6;
    }
    .report-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #6366F1; padding-bottom: 20px; }
    .report-title { font-size: 24px; font-weight: bold; color: #1e293b; margin-bottom: 8px; }
    .report-subtitle { font-size: 13px; color: #64748b; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 12px; padding-left: 10px; border-left: 4px solid #6366F1; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .stat-card { background: #f8fafc; padding: 16px; border-radius: 8px; text-align: center; }
    .stat-value { font-size: 24px; font-weight: bold; color: #6366F1; }
    .stat-label { font-size: 12px; color: #64748b; margin-top: 4px; }
    .store-list { display: flex; flex-direction: column; gap: 8px; }
    .store-item { display: flex; align-items: center; justify-content: space-between; padding: 12px; border-radius: 8px; }
    .store-item.top { background: linear-gradient(to right, #ecfdf5, #f0fdf4); border: 1px solid #a7f3d0; }
    .store-item.bottom { background: linear-gradient(to right, #fef2f2, #fff1f2); border: 1px solid #fecaca; }
    .store-info { display: flex; align-items: center; gap: 12px; }
    .rank-badge { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; }
    .rank-1 { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; }
    .rank-2 { background: linear-gradient(135deg, #94a3b8, #64748b); color: white; }
    .rank-3 { background: linear-gradient(135deg, #fb923c, #f97316); color: white; }
    .rank-other { background: #e2e8f0; color: #475569; }
    .store-name { font-weight: 500; font-size: 14px; }
    .store-district { font-size: 12px; color: #64748b; }
    .store-score { font-weight: bold; font-size: 18px; }
    .score-top { color: #10b981; }
    .score-bottom { color: #ef4444; }
    .problem-list { display: flex; flex-direction: column; gap: 10px; }
    .problem-item { display: flex; gap: 12px; padding: 12px; background: #f8fafc; border-radius: 8px; }
    .problem-tag { padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 500; white-space: nowrap; }
    .problem-tag.red { background: #fee2e2; color: #dc2626; }
    .problem-tag.amber { background: #fef3c7; color: #d97706; }
    .problem-tag.blue { background: #dbeafe; color: #2563eb; }
    .problem-tag.purple { background: #f3e8ff; color: #9333ea; }
    .problem-content { font-size: 13px; color: #475569; }
    .todo-list { display: flex; flex-direction: column; gap: 8px; }
    .todo-item { display: flex; gap: 10px; padding: 8px 0; font-size: 13px; color: #334155; }
    .todo-check { width: 20px; height: 20px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #3b82f6); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: white; font-size: 12px; }
    .report-footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f8fafc; font-weight: 600; color: #475569; }
    .score-bar { height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
    .score-bar-fill { height: 100%; border-radius: 3px; }
  </style>
</head>
<body>
  <div class="report-header">
    <div class="report-title">上海区域门店经营周报</div>
    <div class="report-subtitle">报告周期：${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate() - 6}日 - ${reportDate} | 生成日期：${reportDate}</div>
  </div>

  <div class="section">
    <div class="section-title">统计摘要</div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${filteredRankings.length}</div>
        <div class="stat-label">门店数量</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${avgScore}</div>
        <div class="stat-label">平均综合评分</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${topStores.length > 0 ? topStores[0].overallScore.toFixed(1) : '-'}</div>
        <div class="stat-label">最高评分</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${bottomStores.length > 0 ? bottomStores[0].overallScore.toFixed(1) : '-'}</div>
        <div class="stat-label">最低评分</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">TOP 3 最佳门店</div>
    <div class="store-list">
      ${topStores.map((store, idx) => `
        <div class="store-item top">
          <div class="store-info">
            <div class="rank-badge rank-${idx + 1}">${idx + 1}</div>
            <div>
              <div class="store-name">${store.storeName}</div>
              <div class="store-district">${store.district}</div>
            </div>
          </div>
          <div class="store-score score-top">${store.overallScore.toFixed(1)} 分</div>
        </div>
      `).join('')}
    </div>
  </div>

  <div class="section">
    <div class="section-title">TOP 3 待改进门店</div>
    <div class="store-list">
      ${bottomStores.map((store, idx) => `
        <div class="store-item bottom">
          <div class="store-info">
            <div class="rank-badge rank-other">${idx + 1}</div>
            <div>
              <div class="store-name">${store.storeName}</div>
              <div class="store-district">${store.district}</div>
            </div>
          </div>
          <div class="store-score score-bottom">${store.overallScore.toFixed(1)} 分</div>
        </div>
      `).join('')}
    </div>
  </div>

  <div class="section">
    <div class="section-title">主要问题与建议</div>
    <div class="problem-list">
      <div class="problem-item">
        <span class="problem-tag red">缺货问题</span>
        <span class="problem-content">本周缺货问题占比较高，部分门店缺货情况较为严重，建议加强供应商沟通，优化补货频次。</span>
      </div>
      <div class="problem-item">
        <span class="problem-tag amber">陈列错位</span>
        <span class="problem-content">错位问题主要集中在零食区和饮料区，建议加强店员陈列培训，明确排面责任到人。</span>
      </div>
      <div class="problem-item">
        <span class="problem-tag blue">价签管理</span>
        <span class="problem-content">价签问题有所改善，但仍有部分门店促销价签更新不及时，请店长每日开店前完成价签巡检。</span>
      </div>
      <div class="problem-item">
        <span class="problem-tag purple">促销执行</span>
        <span class="problem-content">促销整体执行良好，部分门店POP海报张贴位置不规范，建议增加专项检查。</span>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">下周重点工作</div>
    <div class="todo-list">
      <div class="todo-item"><div class="todo-check">✓</div><span>完成所有门店本周例行巡检任务，重点关注鲜食品类</span></div>
      <div class="todo-item"><div class="todo-check">✓</div><span>跟进待改进门店的专项整改，安排复查验收</span></div>
      <div class="todo-item"><div class="todo-check">✓</div><span>组织店长陈列标准复训，考核通过后方可上岗</span></div>
      <div class="todo-item"><div class="todo-check">✓</div><span>配合促销活动，提前完成门店陈列调整</span></div>
      <div class="todo-item"><div class="todo-check">✓</div><span>完成季度门店评分汇总与绩效沟通</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">门店评分明细</div>
    <table>
      <thead>
        <tr>
          <th>排名</th>
          <th>门店名称</th>
          <th>区域</th>
          <th>综合评分</th>
          <th>陈列</th>
          <th>库存</th>
          <th>价签</th>
          <th>促销</th>
          <th>整改</th>
        </tr>
      </thead>
      <tbody>
        ${filteredRankings.map(r => `
          <tr>
            <td>${r.rank}</td>
            <td>${r.storeName}</td>
            <td>${r.district}</td>
            <td><strong>${r.overallScore.toFixed(1)}</strong></td>
            <td>${r.displayScore}</td>
            <td>${r.stockScore}</td>
            <td>${r.priceTagScore}</td>
            <td>${r.promotionScore}</td>
            <td>${r.rectificationScore}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="report-footer">
    本报告由智慧零售门店陈列巡检平台自动生成 | 第${weekNum}周
  </div>
</body>
</html>
    `;
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('请允许弹出窗口以导出PDF');
      return;
    }
    printWindow.document.write(generateWeeklyReportHTML());
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    };
  };

  const handleExportWeeklyReport = () => {
    handleExportPDF();
  };

  const renderStars = (score: number) => {
    const stars = Math.min(5, Math.round(score / 20));
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              'w-3.5 h-3.5',
              i < stars ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
            )}
          />
        ))}
      </div>
    );
  };

  const renderRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-md shadow-amber-200">
          <Award className="w-4 h-4 text-white" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-md shadow-slate-200">
          <Award className="w-4 h-4 text-white" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center shadow-md shadow-orange-200">
          <Award className="w-4 h-4 text-white" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
        <span className="text-sm font-semibold text-slate-600">{rank}</span>
      </div>
    );
  };

  const CircularProgress = ({ value, size = 100, strokeWidth = 10, gradientFrom, gradientTo, label }: {
    value: number; size?: number; strokeWidth?: number;
    gradientFrom: string; gradientTo: string; label?: ReactNode;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;
    const gradientId = `grad-${Math.random().toString(36).slice(2, 8)}`;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradientFrom} />
              <stop offset="100%" stopColor={gradientTo} />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {label}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">经营报表</h1>
          <p className="text-sm text-slate-500 mt-1">
            多维度分析门店运营情况，辅助经营决策
            {!isSupervisor && '（仅查看本店数据）'}
          </p>
        </div>
      </div>

      <div className="rounded-[10px] bg-white shadow-card p-4 space-y-4 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div className="flex bg-slate-100 rounded-lg p-1">
                {timePeriods.map((tp) => (
                  <button
                    key={tp.key}
                    onClick={() => setTimePeriod(tp.key)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
                      timePeriod === tp.key
                        ? 'bg-white text-brand-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    {tp.label}
                  </button>
                ))}
              </div>
              {timePeriod === 'custom' && (
                <div className="flex items-center gap-2 ml-2">
                  <input
                    type="date"
                    className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                  <span className="text-slate-400">至</span>
                  <input
                    type="date"
                    className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 relative">
              <Store className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-500">门店范围：</span>
              {isSupervisor ? (
                <button
                  onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm transition-colors"
                >
                  <span>
                    已选 {selectedStores.length}/{stores.length}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
              ) : (
                <span className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
                  {stores[0]?.name || '-'}
                </span>
              )}

              {storeDropdownOpen && isSupervisor && (
                <div className="absolute top-full left-20 mt-2 w-64 bg-white rounded-xl shadow-popover border border-slate-100 py-2 z-20 animate-scale-in">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <button
                      onClick={selectAllStores}
                      className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                    >
                      全选
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {stores.map((store) => (
                      <button
                        key={store.id}
                        onClick={() => toggleStore(store.id)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 transition-colors"
                      >
                        <div className={cn(
                          'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                          selectedStores.includes(store.id)
                            ? 'bg-brand-500 border-brand-500'
                            : 'border-slate-300'
                        )}>
                          {selectedStores.includes(store.id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="text-sm text-slate-700 truncate">{store.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-400" />
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setCompareMode('store')}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
                    compareMode === 'store'
                      ? 'bg-white text-brand-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  门店对比
                </button>
                <button
                  onClick={() => setCompareMode('trend')}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
                    compareMode === 'trend'
                      ? 'bg-white text-brand-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  趋势分析
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 no-print">
            <button onClick={handleExportPDF} className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-200">
              <FileText className="w-4 h-4" />
              导出周报(PDF)
            </button>
            <button onClick={handleExportExcel} className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-200">
              <Download className="w-4 h-4" />
              导出Excel
            </button>
            <button onClick={handlePrint} className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-200">
              <Printer className="w-4 h-4" />
              打印
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-[10px] bg-white shadow-card p-5 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <p className="text-sm font-medium text-slate-500">综合评分</p>
            <div className="flex items-center gap-4 mt-3">
              <CircularProgress
                value={88.6}
                size={90}
                strokeWidth={9}
                gradientFrom="#6366F1"
                gradientTo="#8B5CF6"
                label={
                  <div className="text-center">
                    <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">88.6</span>
                  </div>
                }
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-1 text-success-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-semibold">+2.3分</span>
                </div>
                <p className="text-xs text-slate-400">同比上周</p>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs text-slate-500">区域排名 Top 3</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[10px] bg-white shadow-card p-5 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <p className="text-sm font-medium text-slate-500">巡店完成率</p>
            <div className="flex items-center gap-4 mt-3">
              <CircularProgress
                value={96.4}
                size={90}
                strokeWidth={9}
                gradientFrom="#10B981"
                gradientTo="#34D399"
                label={
                  <div className="text-center">
                    <span className="text-xl font-bold text-emerald-600">96.4%</span>
                  </div>
                }
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-slate-700">27/28</span>
                </div>
                <p className="text-xs text-slate-400">已完成/计划</p>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success-500" />
                  <span className="text-xs text-slate-500">远超目标 90%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[10px] bg-white shadow-card p-5 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-sky-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <p className="text-sm font-medium text-slate-500">整改及时率</p>
            <div className="flex items-center gap-4 mt-3">
              <CircularProgress
                value={92.1}
                size={90}
                strokeWidth={9}
                gradientFrom="#3B82F6"
                gradientTo="#60A5FA"
                label={
                  <div className="text-center">
                    <span className="text-xl font-bold text-blue-600">92.1%</span>
                  </div>
                }
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-1 text-success-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-semibold">+5.8%</span>
                </div>
                <p className="text-xs text-slate-400">同比上期</p>
                <div className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs text-slate-500">响应速度提升</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[10px] bg-white shadow-card p-5 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <p className="text-sm font-medium text-slate-500">缺货率</p>
            <div className="flex items-center gap-4 mt-3">
              <CircularProgress
                value={96.8}
                size={90}
                strokeWidth={9}
                gradientFrom="#EF4444"
                gradientTo="#F87171"
                label={
                  <div className="text-center">
                    <span className="text-xl font-bold text-red-500">3.2%</span>
                  </div>
                }
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-1 text-success-600">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-sm font-semibold">-0.7%</span>
                </div>
                <p className="text-xs text-slate-400">持续改善</p>
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-xs text-slate-500">目标 ≤ 3%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[10px] bg-white shadow-card p-5 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <p className="text-sm font-medium text-slate-500">促销达标率</p>
            <div className="flex items-center gap-4 mt-3">
              <CircularProgress
                value={89.7}
                size={90}
                strokeWidth={9}
                gradientFrom="#F97316"
                gradientTo="#FB923C"
                label={
                  <div className="text-center">
                    <span className="text-xl font-bold text-orange-500">89.7%</span>
                  </div>
                }
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-1 text-success-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-semibold">+3.2%</span>
                </div>
                <p className="text-xs text-slate-400">环比提升</p>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs text-slate-500">端午活动效果好</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 rounded-[10px] bg-white shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-800">门店评分排名</h3>
            <span className="text-xs text-slate-400">TOP {Math.min(10, storeRankings.length)} 门店</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2.5 px-2 text-xs font-medium text-slate-400">排名</th>
                  <th className="text-left py-2.5 px-2 text-xs font-medium text-slate-400">门店</th>
                  <th className="text-left py-2.5 px-2 text-xs font-medium text-slate-400">区域</th>
                  <th className="text-left py-2.5 px-2 text-xs font-medium text-slate-400">综合评分</th>
                  <th className="text-left py-2.5 px-2 text-xs font-medium text-slate-400">分项得分</th>
                  <th className="text-right py-2.5 px-2 text-xs font-medium text-slate-400">环比</th>
                </tr>
              </thead>
              <tbody>
                {storeRankings.map((r) => (
                  <tr
                    key={r.storeId}
                    onClick={() => setSelectedRankStoreId(r.storeId)}
                    className={cn(
                      'border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50',
                      selectedRankStoreId === r.storeId && 'bg-blue-50/50'
                    )}
                  >
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-center">
                        {renderRankBadge(r.rank)}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <p className="text-sm font-medium text-slate-800 truncate max-w-[120px]">
                        {r.storeName}
                      </p>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-xs text-slate-500">{r.district}</span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        {renderStars(r.overallScore)}
                        <span className="text-sm font-bold text-slate-800">{r.overallScore.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="space-y-1 min-w-[140px]">
                        {[
                          { label: '陈列', value: r.displayScore, max: 30, color: '#6366F1' },
                          { label: '库存', value: r.stockScore, max: 20, color: '#10B981' },
                          { label: '价签', value: r.priceTagScore, max: 15, color: '#3B82F6' },
                          { label: '促销', value: r.promotionScore, max: 15, color: '#F97316' },
                          { label: '整改', value: r.rectificationScore, max: 20, color: '#8B5CF6' },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 w-6">{item.label}</span>
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${(item.value / item.max) * 100}%`,
                                  backgroundColor: item.color,
                                }}
                              />
                            </div>
                            <span className="text-[10px] font-medium text-slate-600 w-8 text-right">
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className={cn(
                        'inline-flex items-center gap-0.5 text-xs font-semibold',
                        r.trend >= 0 ? 'text-success-600' : 'text-danger-600'
                      )}>
                        {r.trend >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {Math.abs(r.trend).toFixed(1)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-[10px] bg-white shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-800">门店能力雷达图</h3>
            <span className="text-xs text-slate-400">{selectedRanking?.storeName || '-'}</span>
          </div>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#64748B', fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: '#94A3B8', fontSize: 10 }}
                  axisLine={false}
                />
                <Radar
                  name={selectedRanking?.storeName?.slice(0, 4) || '选中门店'}
                  dataKey="选中门店"
                  stroke="#6366F1"
                  fill="#6366F1"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name="区域平均"
                  dataKey="区域平均"
                  stroke="#94A3B8"
                  fill="#94A3B8"
                  fillOpacity={0.1}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: 12 }}
                  iconType="circle"
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-[10px] bg-white shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-800">近8周综合评分趋势</h3>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500" />
              <span className="text-slate-600">{selectedRanking?.storeName || '选中门店'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-slate-400" style={{ borderTop: '2px dashed #94A3B8' }} />
              <span className="text-slate-600">区域平均</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5" style={{ borderTop: '2px dashed #10B981' }} />
              <span className="text-slate-600">Top 10%门店</span>
            </div>
          </div>
        </div>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="week"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 12 }}
              />
              <YAxis
                domain={[70, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 12 }}
              />
              <RechartsTooltip
                contentStyle={{
                  borderRadius: 12,
                  border: 'none',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  padding: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="选中门店"
                name={selectedRanking?.storeName || '选中门店'}
                stroke="url(#lineGradient)"
                strokeWidth={3}
                dot={{ r: 4, fill: '#6366F1', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#6366F1', strokeWidth: 2, stroke: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="区域平均"
                stroke="#94A3B8"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Top10"
                name="Top 10%门店"
                stroke="#10B981"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-[10px] bg-white shadow-card p-5">
          <h3 className="text-base font-semibold text-slate-800 mb-4">问题类型占比</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 13 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[10px] bg-white shadow-card p-5">
          <h3 className="text-base font-semibold text-slate-800 mb-4">各门店问题数量对比</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                />
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  iconType="circle"
                />
                {(['缺货', '错位', '价签', '促销', '陈列', '其他'] as const).map((key, idx) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    stackId="a"
                    fill={BAR_COLORS[idx]}
                    radius={idx === 5 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-[10px] bg-white shadow-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-800">周报内容预览</h3>
            <p className="text-xs text-slate-400 mt-0.5">2026年第26周（6月23日 - 6月29日）</p>
          </div>
        </div>

        <div className="max-h-[600px] overflow-y-auto p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">上海区域门店经营周报</h2>
            <p className="text-sm text-slate-500">报告周期：2026年6月23日 - 2026年6月29日 | 生成日期：2026年6月30日</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: '巡检任务数', value: 28, sub: '同比 +3' },
              { label: '发现问题数', value: 450, sub: '同比 -12.5%' },
              { label: '已整改完成', value: 414, sub: '整改率 92%' },
              { label: '补货建议数', value: 203, sub: '涉及 68 SKU' },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50">
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{item.value}</p>
                <p className="text-xs text-success-600 mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              TOP 3 最佳门店
            </h4>
            <div className="space-y-2">
              {topStores.map((store) => (
                <div key={store.storeId} className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100">
                  <div className="flex items-center gap-3">
                    {renderRankBadge(store.rank)}
                    <div>
                      <p className="text-sm font-medium text-slate-800">{store.storeName}</p>
                      <p className="text-xs text-slate-500">{store.district}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-600">{store.overallScore.toFixed(1)}分</p>
                      <div className="flex items-center justify-end gap-0.5 text-success-600 text-xs">
                        <TrendingUp className="w-3 h-3" />
                        +{store.trend.toFixed(1)}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              TOP 3 待改进门店
            </h4>
            <div className="space-y-2">
              {bottomStores.map((store, idx) => (
                <div key={store.storeId} className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-red-600">{idx + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{store.storeName}</p>
                      <p className="text-xs text-slate-500">{store.district}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-500">{store.overallScore.toFixed(1)}分</p>
                      <div className="flex items-center justify-end gap-0.5 text-danger-600 text-xs">
                        <TrendingDown className="w-3 h-3" />
                        {store.trend.toFixed(1)}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-800">主要问题与建议</h4>
            <div className="p-4 rounded-xl bg-slate-50 space-y-3">
              {[
                { type: '缺货问题', color: 'bg-red-100 text-red-700', content: '本周缺货问题占比28.4%，五角场店、宝山万达店缺货情况较为严重，建议加强供应商沟通，优化补货频次。', level: '高' },
                { type: '陈列错位', color: 'bg-amber-100 text-amber-700', content: '错位问题占比21.1%，主要集中在零食区和饮料区，建议加强店员陈列培训，明确排面责任到人。', level: '中' },
                { type: '价签管理', color: 'bg-blue-100 text-blue-700', content: '价签问题有所改善，但仍有部分门店促销价签更新不及时，请店长每日开店前完成价签巡检。', level: '中' },
                { type: '促销执行', color: 'bg-purple-100 text-purple-700', content: '端午促销整体执行良好，部分门店POP海报张贴位置不规范，下周起将增加专项检查。', level: '低' },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className={cn('shrink-0 h-7 px-2 rounded-md text-xs font-medium flex items-center', item.color)}>
                    {item.type}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-800">下周重点工作</h4>
            <div className="space-y-2">
              {[
                '1. 完成所有门店7月第一周例行巡检任务，重点关注鲜食品类',
                '2. 跟进五角场店、宝山万达店的专项整改，安排复查验收',
                '3. 组织店长陈列标准复训，考核通过后方可上岗',
                '4. 配合总部7月促销活动，提前完成门店陈列调整',
                '5. 完成Q2季度门店评分汇总与绩效沟通',
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center mt-0.5 shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end no-print">
          <button onClick={handleExportWeeklyReport} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white rounded-lg text-sm font-medium transition-all shadow-sm shadow-indigo-500/20">
            <FileText className="w-4 h-4" />
            生成完整周报PDF
          </button>
        </div>
      </div>
    </div>
  );
}
