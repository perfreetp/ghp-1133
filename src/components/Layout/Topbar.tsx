import { useLocation } from 'react-router-dom';
import { Bell as BellIcon, Search as SearchIcon, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const routeTitleMap: Record<string, { title: string; breadcrumb: string[] }> = {
  '/store-map': {
    title: '门店地图',
    breadcrumb: ['首页', '门店管理', '门店地图'],
  },
  '/display-standards': {
    title: '陈列标准',
    breadcrumb: ['首页', '标准管理', '陈列标准'],
  },
  '/inspection-tasks': {
    title: '巡检任务',
    breadcrumb: ['首页', '巡检管理', '巡检任务'],
  },
  '/photo-verification': {
    title: '拍照验收',
    breadcrumb: ['首页', '巡检管理', '拍照验收'],
  },
  '/replenishment': {
    title: '补货建议',
    breadcrumb: ['首页', '库存管理', '补货建议'],
  },
  '/rectification': {
    title: '整改跟踪',
    breadcrumb: ['首页', '巡检管理', '整改跟踪'],
  },
  '/reports': {
    title: '经营报表',
    breadcrumb: ['首页', '数据分析', '经营报表'],
  },
};

export default function Topbar() {
  const location = useLocation();
  const { currentUser } = useAppStore();

  const matchedKey = Object.keys(routeTitleMap).find(
    (key) => location.pathname === key || location.pathname.startsWith(key + '/')
  );
  const pageInfo =
    matchedKey ? routeTitleMap[matchedKey] : { title: '首页', breadcrumb: ['首页'] };

  const unreadCount = 3;

  return (
    <header
      className="bg-white border-b border-slate-200/80 shadow-sm flex-shrink-0 relative z-20"
      style={{ height: 64 }}
    >
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex flex-col justify-center min-w-0">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            {pageInfo.title}
          </h1>
          <nav className="flex items-center gap-1 text-sm mt-0.5">
            {pageInfo.breadcrumb.map((item, idx) => (
              <span key={idx} className="flex items-center gap-1">
                {idx > 0 && (
                  <ChevronRightIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                )}
                <span
                  className={
                    idx === pageInfo.breadcrumb.length - 1
                      ? 'text-slate-600 font-medium'
                      : 'text-slate-400'
                  }
                >
                  {item}
                </span>
              </span>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="搜索门店、任务、商品..."
              className="w-64 h-9 pl-9 pr-4 rounded-xl bg-slate-100/80 border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-all"
            />
          </div>

          <button className="relative w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors group">
            <BellIcon className="w-5 h-5 text-slate-600 group-hover:text-slate-800 transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          <div className="h-8 w-px bg-slate-200 flex-shrink-0" />

          <div className="flex items-center gap-3 pl-1 pr-2 py-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full ring-2 ring-slate-200 object-cover bg-slate-100"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-slate-800 truncate">
                {currentUser.name}
              </span>
              <span className="text-xs text-slate-500 truncate">
                {currentUser.role === 'supervisor' ? '区域督导' : '门店店长'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
