import { useMemo, useState, useRef, useEffect } from 'react';
import {
  Store as StoreIcon,
  Search,
  Star,
  MapPin,
  User,
  Upload,
  Clock,
  Sun,
  Coffee,
  Users,
  LayoutGrid,
  Flame,
  ShoppingBasket,
  Info,
  X,
  Plus,
  Image as ImageIcon,
  Package,
  Tag,
} from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAppStore, type Store as StoreType, type Shelf } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | 'normal' | 'warning' | 'critical';
type MapTab = 'distribution' | 'floorplan';
type TimePeriod = 'morning' | 'noon' | 'evening' | 'all';
type ShelfType = 'shelf' | 'endcap' | 'promotion' | 'checkout';

const statusBadgeMap: Record<StoreType['status'], { type: 'success' | 'warning' | 'danger'; label: string }> = {
  normal: { type: 'success', label: '正常' },
  warning: { type: 'warning', label: '预警' },
  critical: { type: 'danger', label: '严重' },
};

const statusDotMap: Record<StoreType['status'], string> = {
  normal: 'bg-success-500',
  warning: 'bg-warning-500',
  critical: 'bg-danger-500',
};

const shelfTypeConfig: Record<ShelfType, { label: string; color: string; borderColor: string; bgColor: string; textColor: string }> = {
  shelf: { label: '普通货架', color: '#2563EB', borderColor: 'border-brand-500', bgColor: 'bg-brand-500/25', textColor: 'text-brand-700' },
  endcap: { label: '端架', color: '#F97316', borderColor: 'border-warning-500', bgColor: 'bg-warning-500/30', textColor: 'text-warning-700' },
  promotion: { label: '促销堆头', color: '#9333EA', borderColor: 'border-purple-500', bgColor: 'bg-purple-500/25', textColor: 'text-purple-700' },
  checkout: { label: '收银台货架', color: '#10B981', borderColor: 'border-success-500', bgColor: 'bg-success-500/25', textColor: 'text-success-700' },
};

function renderStars(score: number) {
  const full = Math.floor(score / 20);
  const half = score % 20 >= 10;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-3.5 w-3.5',
            i < full
              ? 'fill-amber-400 text-amber-400'
              : i === full && half
                ? 'fill-amber-200 text-amber-400'
                : 'text-slate-200'
          )}
        />
      ))}
      <span className="ml-1 text-xs font-semibold text-slate-700">{score}</span>
    </div>
  );
}

interface MapMarker {
  store: StoreType;
  x: number;
  y: number;
}

function StoreMapPage() {
  const {
    stores,
    selectedStoreId,
    setSelectedStoreId,
    currentUser,
    setFloorPlan,
    addShelf,
    updateShelf,
    deleteShelf,
  } = useAppStore();

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [mapTab, setMapTab] = useState<MapTab>('distribution');
  const [clickedStore, setClickedStore] = useState<StoreType | null>(null);

  const [showShelves, setShowShelves] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showEndCaps, setShowEndCaps] = useState(true);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [editingShelfId, setEditingShelfId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [draggingShelfId, setDraggingShelfId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const accessibleStores = useMemo(() => {
    if (currentUser.role === 'supervisor') return stores;
    return stores.filter((s) => currentUser.storeIds.includes(s.id));
  }, [stores, currentUser]);

  const stats = useMemo(() => {
    const total = accessibleStores.length;
    const normal = accessibleStores.filter((s) => s.status === 'normal').length;
    const warning = accessibleStores.filter((s) => s.status === 'warning').length;
    const critical = accessibleStores.filter((s) => s.status === 'critical').length;
    return { total, normal, warning, critical };
  }, [accessibleStores]);

  const filteredStores = useMemo(() => {
    return accessibleStores.filter((s) => {
      const matchSearch =
        !searchText ||
        s.name.toLowerCase().includes(searchText.toLowerCase()) ||
        s.address.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [accessibleStores, searchText, statusFilter]);

  const selectedStore = accessibleStores.find((s) => s.id === selectedStoreId) || accessibleStores[0];

  const markers: MapMarker[] = useMemo(() => {
    return accessibleStores.map((store) => {
      const latMin = 31.1, latMax = 31.45;
      const lngMin = 121.25, lngMax = 121.6;
      const x = ((store.lng - lngMin) / (lngMax - lngMin)) * 100;
      const y = 100 - ((store.lat - latMin) / (latMax - latMin)) * 100;
      return { store, x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
    });
  }, [accessibleStores]);

  const heatZones = useMemo(() => {
    const base = selectedStore?.id || 's001';
    const seed = base.charCodeAt(base.length - 1);
    const intensity = timePeriod === 'morning' ? 0.7 : timePeriod === 'noon' ? 1.0 : timePeriod === 'evening' ? 1.1 : 0.85;
    return [
      { id: 'hz1', name: '入口区域', x: 8, y: 12, r: 65, level: 'high' as const, intensity },
      { id: 'hz2', name: '饮料区', x: 22, y: 28, r: 55, level: 'medium' as const, intensity: intensity * 0.8 },
      { id: 'hz3', name: '零食区', x: 38, y: 50, r: 70, level: 'high' as const, intensity },
      { id: 'hz4', name: '收银台区', x: 80, y: 72, r: 50, level: 'high' as const, intensity: intensity * 1.1 },
      { id: 'hz5', name: '鲜食区', x: 58, y: 25, r: 45, level: 'medium' as const, intensity: intensity * 0.75 },
      { id: 'hz6', name: '日用品区', x: 62, y: 50, r: 40, level: 'low' as const, intensity: intensity * 0.5 },
      { id: 'hz7', name: '冷冻区', x: 82, y: 28, r: 38, level: 'low' as const, intensity: intensity * 0.45 },
      { id: 'hz8', name: '促销堆头区', x: 30, y: 78, r: 60, level: 'high' as const, intensity: intensity * (0.9 + (seed % 5) * 0.03) },
    ];
  }, [selectedStore, timePeriod]);

  const shelves = useMemo(() => {
    return selectedStore?.shelves || [];
  }, [selectedStore]);

  const isSupervisor = currentUser.role === 'supervisor';

  const handleUploadFloorPlan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedStore) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFloorPlan(selectedStore.id, dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddShelf = (type: ShelfType) => {
    if (!selectedStore || !isSupervisor) return;

    const config = shelfTypeConfig[type];
    const newShelf: Omit<Shelf, 'id'> = {
      name: `${config.label}${shelves.filter(s => s.type === type).length + 1}`,
      type,
      x: 30,
      y: 30,
      width: type === 'endcap' ? 25 : type === 'checkout' ? 80 : 80,
      height: type === 'endcap' ? 55 : type === 'checkout' ? 30 : 25,
      levelCount: type === 'promotion' ? 2 : type === 'checkout' ? 3 : 5,
    };

    addShelf(selectedStore.id, newShelf);
    setShowAddMenu(false);
  };

  const handleDeleteShelf = (shelfId: string) => {
    if (!selectedStore || !isSupervisor) return;
    deleteShelf(selectedStore.id, shelfId);
  };

  const handleStartEdit = (shelf: Shelf) => {
    if (!isSupervisor) return;
    setEditingShelfId(shelf.id);
    setEditName(shelf.name);
  };

  const handleSaveEdit = () => {
    if (!selectedStore || !editingShelfId) return;
    updateShelf(selectedStore.id, editingShelfId, { name: editName });
    setEditingShelfId(null);
    setEditName('');
  };

  const handleShelfMouseDown = (e: React.MouseEvent, shelfId: string) => {
    if (!isSupervisor || editingShelfId) return;
    e.stopPropagation();

    const shelf = shelves.find(s => s.id === shelfId);
    if (!shelf || !svgRef.current) return;

    const svg = svgRef.current;
    const svgPoint = svg.createSVGPoint();
    svgPoint.x = e.clientX;
    svgPoint.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;

    const point = svgPoint.matrixTransform(ctm.inverse());

    setDraggingShelfId(shelfId);
    setDragOffset({
      x: point.x - shelf.x,
      y: point.y - shelf.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingShelfId || !svgRef.current || !selectedStore) return;

    const svg = svgRef.current;
    const svgPoint = svg.createSVGPoint();
    svgPoint.x = e.clientX;
    svgPoint.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;

    const point = svgPoint.matrixTransform(ctm.inverse());
    const newX = Math.max(5, Math.min(510, point.x - dragOffset.x));
    const newY = Math.max(5, Math.min(230, point.y - dragOffset.y));

    updateShelf(selectedStore.id, draggingShelfId, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setDraggingShelfId(null);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setDraggingShelfId(null);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const visibleShelves = useMemo(() => {
    if (!showShelves && !showEndCaps) return [];
    return shelves.filter(s => {
      if (s.type === 'endcap' && !showEndCaps) return false;
      if (s.type !== 'endcap' && !showShelves) return false;
      return true;
    });
  }, [shelves, showShelves, showEndCaps]);

  const svgViewBox = "0 0 520 240";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="总门店数"
          value={stats.total}
          icon={<StoreIcon className="h-5 w-5 text-brand-600" />}
          trendData={[3, 4, 4, 5, 5, 5]}
        />
        <StatCard
          title="正常门店"
          value={stats.normal}
          change={stats.total > 0 ? (stats.normal / stats.total) * 100 - 60 : 0}
          icon={<ShoppingBasket className="h-5 w-5 text-success-600" />}
          trendData={[2, 3, 3, 3, 3, 3]}
        />
        <StatCard
          title="预警门店"
          value={stats.warning}
          change={-5.2}
          icon={<Sun className="h-5 w-5 text-warning-600" />}
          trendData={[1, 1, 1, 1, 2, 1]}
        />
        <StatCard
          title="严重问题门店"
          value={stats.critical}
          change={stats.critical > 0 ? 12.5 : 0}
          icon={<Flame className="h-5 w-5 text-danger-600" />}
          trendData={[0, 0, 1, 1, 0, 1]}
        />
      </div>

      <div className="flex gap-5">
        <div className="w-[380px] shrink-0 rounded-[10px] bg-white p-4 shadow-card">
          <div className="mb-3 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="按名称 / 地址搜索门店"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              {(['all', 'normal', 'warning', 'critical'] as StatusFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={cn(
                    'flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition',
                    statusFilter === f
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  {f === 'all' ? '全部' : f === 'normal' ? '正常' : f === 'warning' ? '预警' : '严重'}
                </button>
              ))}
            </div>
          </div>

          <div className="-mx-1 max-h-[calc(100vh-340px)] space-y-2 overflow-y-auto px-1 pb-1">
            {filteredStores.map((store) => {
              const active = store.id === selectedStoreId;
              const badge = statusBadgeMap[store.status];
              return (
                <div
                  key={store.id}
                  onClick={() => setSelectedStoreId(store.id)}
                  className={cn(
                    'cursor-pointer rounded-lg border p-3 transition-all',
                    active
                      ? 'border-brand-400 bg-brand-50/60 shadow-sm ring-2 ring-brand-100'
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn('h-2 w-2 shrink-0 rounded-full', statusDotMap[store.status])}
                        />
                        <h3 className="truncate text-sm font-semibold text-slate-900">{store.name}</h3>
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{store.address}</span>
                      </div>
                    </div>
                    <StatusBadge type={badge.type} label={badge.label} />
                  </div>
                  <div className="mt-2.5 flex items-center justify-between">
                    {renderStars(store.score)}
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <User className="h-3 w-3" />
                      <span>{store.managerName}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredStores.length === 0 && (
              <div className="py-12 text-center text-sm text-slate-400">暂无匹配的门店</div>
            )}
          </div>
        </div>

        <div className="flex-1 rounded-[10px] bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              <button
                onClick={() => setMapTab('distribution')}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition',
                  mapTab === 'distribution'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                <MapPin className="h-3.5 w-3.5" />
                门店分布
              </button>
              <button
                onClick={() => setMapTab('floorplan')}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition',
                  mapTab === 'floorplan'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                平面图与热区
              </button>
            </div>
            {selectedStore && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">当前门店:</span>
                <span className="font-semibold text-slate-800">{selectedStore.name}</span>
                <span
                  className={cn('h-1.5 w-1.5 rounded-full', statusDotMap[selectedStore.status])}
                />
              </div>
            )}
          </div>

          <div className="p-5">
            {mapTab === 'distribution' ? (
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-slate-50 to-emerald-50 ring-1 ring-slate-200/60">
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
                      <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#E2E8F0" strokeWidth="0.15" />
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#grid)" />
                  <path
                    d="M10,55 Q15,30 35,25 T65,30 Q85,35 90,55 T75,80 Q50,92 25,82 T10,55 Z"
                    fill="rgba(37,99,235,0.06)"
                    stroke="#93C5FD"
                    strokeWidth="0.3"
                    strokeDasharray="1 0.5"
                  />
                  <path
                    d="M48,10 Q55,30 60,55 Q58,78 50,92"
                    fill="none"
                    stroke="#BFDBFE"
                    strokeWidth="0.6"
                    strokeLinecap="round"
                  />
                  {[
                    { x: 20, y: 40, label: '嘉定' },
                    { x: 32, y: 28, label: '宝山' },
                    { x: 50, y: 50, label: '黄浦' },
                    { x: 42, y: 56, label: '徐汇' },
                    { x: 60, y: 42, label: '杨浦' },
                    { x: 68, y: 60, label: '浦东' },
                    { x: 30, y: 70, label: '闵行' },
                    { x: 48, y: 72, label: '长宁' },
                  ].map((d, i) => (
                    <text
                      key={i}
                      x={d.x}
                      y={d.y}
                      fontSize="1.8"
                      fill="#94A3B8"
                      textAnchor="middle"
                      className="select-none"
                    >
                      {d.label}
                    </text>
                  ))}
                </svg>

                {markers.map(({ store, x, y }) => {
                  const active = store.id === selectedStoreId;
                  return (
                    <div
                      key={store.id}
                      className="group absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${x}%`, top: `${y}%` }}
                    >
                      <button
                        onClick={() => {
                          setSelectedStoreId(store.id);
                          setClickedStore(store);
                        }}
                        className={cn(
                          'relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-white shadow-lg transition-all',
                          statusDotMap[store.status],
                          active && 'scale-125 ring-4 ring-brand-200 ring-offset-1',
                          'hover:scale-110'
                        )}
                      >
                        {active && (
                          <span
                            className={cn(
                              'absolute inset-0 animate-ping rounded-full opacity-50',
                              statusDotMap[store.status]
                            )}
                          />
                        )}
                      </button>
                      <div
                        className={cn(
                          'absolute left-1/2 top-[calc(100%+6px)] z-10 w-44 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-3 text-left shadow-popover transition-all',
                          clickedStore?.id === store.id || active
                            ? 'opacity-100'
                            : 'pointer-events-none opacity-0 group-hover:opacity-100'
                        )}
                      >
                        {clickedStore?.id === store.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setClickedStore(null);
                            }}
                            className="absolute right-2 top-2 rounded-md p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                        <div className="flex items-center gap-1.5">
                          <span className={cn('h-2 w-2 rounded-full', statusDotMap[store.status])} />
                          <h4 className="truncate text-sm font-semibold text-slate-900">{store.name}</h4>
                        </div>
                        <div className="mt-2 space-y-1 text-xs text-slate-500">
                          <div className="flex items-start gap-1.5">
                            <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
                            <span>{store.address}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="h-3 w-3 shrink-0 text-slate-400" />
                            <span>店长：{store.managerName}</span>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
                          {renderStars(store.score)}
                          <StatusBadge type={statusBadgeMap[store.status].type} label={statusBadgeMap[store.status].label} />
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-sm backdrop-blur">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-success-500" />
                    <span className="text-slate-600">正常</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-warning-500" />
                    <span className="text-slate-600">预警</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-danger-500" />
                    <span className="text-slate-600">严重</span>
                  </div>
                </div>

                <div className="absolute right-4 top-4 rounded-lg border border-slate-200 bg-white/95 px-3 py-1.5 text-xs text-slate-500 shadow-sm backdrop-blur">
                  上海市 · 共 {accessibleStores.length} 家门店
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadFloorPlan}
                    className="hidden"
                  />
                  <button
                    onClick={() => isSupervisor && fileInputRef.current?.click()}
                    disabled={!isSupervisor}
                    className={cn(
                      'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium shadow-sm transition',
                      isSupervisor
                        ? 'bg-brand-500 text-white hover:bg-brand-600'
                        : 'cursor-not-allowed bg-slate-200 text-slate-400'
                    )}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    上传平面图
                  </button>

                  {isSupervisor && (
                    <div className="relative">
                      <button
                        onClick={() => setShowAddMenu(!showAddMenu)}
                        className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        添加货架
                      </button>

                      {showAddMenu && (
                        <div className="absolute left-0 top-full z-20 mt-1 w-36 rounded-lg border border-slate-200 bg-white py-1 shadow-popover">
                          {(Object.keys(shelfTypeConfig) as ShelfType[]).map((type) => (
                            <button
                              key={type}
                              onClick={() => handleAddShelf(type)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
                            >
                              <span
                                className={cn('h-3 w-3 rounded-sm', shelfTypeConfig[type].bgColor)}
                                style={{ backgroundColor: shelfTypeConfig[type].color + '40' }}
                              />
                              {shelfTypeConfig[type].label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="h-5 w-px bg-slate-200" />

                  <div className="flex items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-1.5 text-xs">
                      <input
                        type="checkbox"
                        checked={showShelves}
                        onChange={(e) => setShowShelves(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-brand-500 focus:ring-brand-400"
                      />
                      <Package className="h-3.5 w-3.5 text-slate-500" />
                      <span className="text-slate-600">货架标注</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-1.5 text-xs">
                      <input
                        type="checkbox"
                        checked={showHeatmap}
                        onChange={(e) => setShowHeatmap(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-brand-500 focus:ring-brand-400"
                      />
                      <Flame className="h-3.5 w-3.5 text-danger-500" />
                      <span className="text-slate-600">客流热区</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-1.5 text-xs">
                      <input
                        type="checkbox"
                        checked={showEndCaps}
                        onChange={(e) => setShowEndCaps(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-brand-500 focus:ring-brand-400"
                      />
                      <Tag className="h-3.5 w-3.5 text-warning-500" />
                      <span className="text-slate-600">端架位置</span>
                    </label>
                  </div>

                  <div className="h-5 w-px bg-slate-200" />

                  <div className="flex items-center gap-1 rounded-md bg-white p-0.5 ring-1 ring-slate-200">
                    {(
                      [
                        { k: 'morning', label: '早高峰', icon: Coffee },
                        { k: 'noon', label: '午间', icon: Sun },
                        { k: 'evening', label: '晚高峰', icon: Users },
                        { k: 'all', label: '全天', icon: Clock },
                      ] as { k: TimePeriod; label: string; icon: typeof Coffee }[]
                    ).map(({ k, label, icon: Icon }) => (
                      <button
                        key={k}
                        onClick={() => setTimePeriod(k)}
                        className={cn(
                          'flex items-center gap-1 rounded px-2 py-1 text-xs transition',
                          timePeriod === k
                            ? 'bg-brand-500 text-white'
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                        )}
                      >
                        <Icon className="h-3 w-3" />
                        {label}
                      </button>
                    ))}
                  </div>

                  {!isSupervisor && (
                    <span className="ml-auto text-xs text-slate-400">
                      只读模式 - 店长权限
                    </span>
                  )}
                </div>

                <div
                  className="relative aspect-[16/10] w-full overflow-hidden rounded-xl ring-1 ring-slate-300/60"
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onClick={() => {
                    setShowAddMenu(false);
                    setEditingShelfId(null);
                  }}
                >
                  <svg
                    ref={svgRef}
                    className="absolute inset-0 h-full w-full"
                    viewBox={svgViewBox}
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <defs>
                      <pattern id="floor" width="20" height="20" patternUnits="userSpaceOnUse">
                        <rect width="20" height="20" fill="#F8FAFC" />
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="0.5" />
                      </pattern>
                      <radialGradient id="heat-high" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity="0.55" />
                        <stop offset="50%" stopColor="#F97316" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
                      </radialGradient>
                      <radialGradient id="heat-medium" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#F97316" stopOpacity="0.5" />
                        <stop offset="50%" stopColor="#FACC15" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#FACC15" stopOpacity="0" />
                      </radialGradient>
                      <radialGradient id="heat-low" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.45" />
                        <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {selectedStore?.floorPlanUrl ? (
                      <image
                        href={selectedStore.floorPlanUrl}
                        x="0"
                        y="0"
                        width="520"
                        height="240"
                        preserveAspectRatio="xMidYMid slice"
                        opacity="0.6"
                      />
                    ) : (
                      <rect width="520" height="240" fill="url(#floor)" />
                    )}

                    <rect x="1" y="1" width="518" height="238" fill="none" stroke="#94A3B8" strokeWidth="2" rx="4" />
                    <rect x="1" y="1" width="60" height="30" fill="none" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 2" />
                    <text x="31" y="18" textAnchor="middle" fontSize="8" fill="#10B981" fontWeight="600">
                      入口
                    </text>
                    <rect x="470" y="209" width="49" height="30" fill="none" stroke="#F97316" strokeWidth="1.5" strokeDasharray="3 2" />
                    <text x="495" y="226" textAnchor="middle" fontSize="8" fill="#F97316" fontWeight="600">
                      收银
                    </text>

                    {showHeatmap &&
                      heatZones.map((z) => (
                        <g key={z.id}>
                          <circle
                            cx={z.x * 2}
                            cy={z.y}
                            r={z.r * z.intensity}
                            fill={z.level === 'high' ? 'url(#heat-high)' : z.level === 'medium' ? 'url(#heat-medium)' : 'url(#heat-low)'}
                          />
                        </g>
                      ))}

                    {visibleShelves.map((shelf) => {
                      const config = shelfTypeConfig[shelf.type as ShelfType];
                      const isEditing = editingShelfId === shelf.id;
                      const isDragging = draggingShelfId === shelf.id;

                      return (
                        <g
                          key={shelf.id}
                          transform={`translate(${shelf.x}, ${shelf.y})`}
                          onMouseDown={(e) => handleShelfMouseDown(e, shelf.id)}
                          onDoubleClick={() => handleStartEdit(shelf)}
                          onClick={(e) => e.stopPropagation()}
                          className={cn(
                            isSupervisor && 'cursor-move',
                            isDragging && 'opacity-80'
                          )}
                          style={{ cursor: isSupervisor ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
                        >
                          <rect
                            width={shelf.width}
                            height={shelf.height}
                            fill={config.color + '30'}
                            stroke={config.color}
                            strokeWidth="1.5"
                            rx="3"
                            className={cn(
                              'transition-all',
                              isSupervisor && 'hover:stroke-[2px] hover:shadow-lg'
                            )}
                          />

                          {isEditing ? (
                            <foreignObject x="2" y={shelf.height / 2 - 10} width={shelf.width - 4} height="20">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit();
                                  if (e.key === 'Escape') setEditingShelfId(null);
                                }}
                                autoFocus
                                className="w-full rounded border border-brand-400 bg-white px-1 text-[8px] text-slate-800 outline-none focus:ring-1 focus:ring-brand-300"
                                style={{ fontSize: '8px', height: '18px' }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </foreignObject>
                          ) : (
                            <text
                              x={shelf.width / 2}
                              y={shelf.height / 2 + 2.5}
                              textAnchor="middle"
                              fontSize="7"
                              fill={config.color}
                              fontWeight="600"
                              className="select-none pointer-events-none"
                            >
                              {shelf.name}
                            </text>
                          )}

                          {isSupervisor && !isEditing && (
                            <g
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteShelf(shelf.id);
                              }}
                              className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ opacity: 0 }}
                            >
                              <rect
                                x={shelf.width - 10}
                                y="-5"
                                width="14"
                                height="14"
                                rx="7"
                                fill="#EF4444"
                                className="hover:fill-danger-600 transition-colors"
                              />
                              <X
                                x={shelf.width - 6}
                                y="-1"
                                width="6"
                                height="6"
                                stroke="white"
                                strokeWidth="1.5"
                              />
                            </g>
                          )}

                          {isSupervisor && (
                            <title>{isDragging ? '拖动中...' : '双击编辑名称，拖动移动位置'}</title>
                          )}
                        </g>
                      );
                    })}

                    {showHeatmap &&
                      heatZones.map((z) => (
                        <g key={`label-${z.id}`}>
                          <circle cx={z.x * 2} cy={z.y} r="2.5" fill="white" stroke="#1F2937" strokeWidth="0.5" />
                          <text x={z.x * 2} y={z.y - 5} textAnchor="middle" fontSize="6" fill="#475569" fontWeight="500">
                            {z.name}
                          </text>
                        </g>
                      ))}
                  </svg>

                  <div className="absolute bottom-3 left-3 flex items-center gap-3 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-sm backdrop-blur">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-danger-500/70" />
                      <span className="text-slate-600">高热区</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-warning-500/70" />
                      <span className="text-slate-600">中热区</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-brand-500/70" />
                      <span className="text-slate-600">低热区</span>
                    </div>
                    <div className="h-4 w-px bg-slate-200" />
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-5 rounded-sm bg-brand-500/25 ring-1 ring-brand-500" />
                      <span className="text-slate-600">货架</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-5 rounded-sm bg-warning-500/30 ring-1 ring-warning-500" />
                      <span className="text-slate-600">端架</span>
                    </div>
                  </div>

                  {selectedStore && (
                    <div className="absolute right-3 top-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-white/95 px-3 py-1.5 text-xs shadow-sm backdrop-blur">
                      <Info className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-slate-500">货架数：</span>
                      <span className="font-semibold text-slate-700">{shelves.length}</span>
                      {selectedStore.floorPlanUrl && (
                        <>
                          <span className="text-slate-400">·</span>
                          <ImageIcon className="h-3.5 w-3.5 text-success-500" />
                          <span className="text-success-600">已上传平面图</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoreMapPage;
