import { NavLink, useLocation } from 'react-router-dom';
import {
  Map as MapIcon,
  Ruler as RulerIcon,
  ClipboardList as ClipboardListIcon,
  Camera as CameraIcon,
  Package as PackageIcon,
  AlertTriangle as AlertTriangleIcon,
  BarChart3 as BarChart3Icon,
  Shield,
  User,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    path: '/store-map',
    label: '门店地图',
    icon: MapIcon,
  },
  {
    path: '/display-standards',
    label: '陈列标准',
    icon: RulerIcon,
  },
  {
    path: '/inspection-tasks',
    label: '巡检任务',
    icon: ClipboardListIcon,
  },
  {
    path: '/photo-verification',
    label: '拍照验收',
    icon: CameraIcon,
  },
  {
    path: '/replenishment',
    label: '补货建议',
    icon: PackageIcon,
  },
  {
    path: '/rectification',
    label: '整改跟踪',
    icon: AlertTriangleIcon,
  },
  {
    path: '/reports',
    label: '经营报表',
    icon: BarChart3Icon,
  },
];

export default function Sidebar() {
  const location = useLocation();
  const { currentUser, switchRole } = useAppStore();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isSupervisor = currentUser.role === 'supervisor';

  return (
    <aside
      className="h-screen flex flex-col relative overflow-hidden"
      style={{ width: 240 }}
    >
      <div
        className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
        aria-hidden
      />
      <div
        className="absolute inset-0 backdrop-blur-xl bg-white/5"
        aria-hidden
      />
      <div
        className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none"
        aria-hidden
      >
        <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-56 h-56 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col h-full p-4">
        <div className="flex items-center gap-3 px-2 py-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-white font-bold text-lg tracking-wide">巡检通</div>
            <div className="text-blue-200/60 text-xs">智慧零售平台</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative',
                  active
                    ? 'bg-white/15 text-white shadow-lg shadow-black/10 border border-white/10'
                    : 'text-slate-300/80 hover:text-white hover:bg-white/5 border border-transparent'
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-r-full" />
                )}
                <Icon
                  className={cn(
                    'w-5 h-5 flex-shrink-0 transition-transform duration-200',
                    active && 'scale-110'
                  )}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className="text-sm font-medium flex-1">{item.label}</span>
                {active && (
                  <ChevronRight className="w-4 h-4 text-blue-300" />
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-4 pt-4 border-t border-white/10">
          <button
            onClick={switchRole}
            className="w-full p-3 rounded-xl bg-gradient-to-r from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 border border-white/10 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                  isSupervisor
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                    : 'bg-gradient-to-br from-emerald-400 to-teal-500'
                )}
              >
                {isSupervisor ? (
                  <Shield className="w-5 h-5 text-white" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-white text-sm font-medium truncate">
                  {currentUser.name}
                </div>
                <div
                  className={cn(
                    'text-xs transition-colors',
                    isSupervisor ? 'text-amber-300' : 'text-emerald-300'
                  )}
                >
                  {isSupervisor ? '督导角色' : '店长角色'}
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <svg
                  className="w-4 h-4 text-slate-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 1l4 4-4 4" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <path d="M7 23l-4-4 4-4" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
}
