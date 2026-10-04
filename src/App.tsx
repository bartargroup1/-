import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SystemCard } from './components/SystemCard';
import { SystemViewerModal } from './components/SystemViewerModal';
import { ManageSystemsModal } from './components/ManageSystemsModal';
import { DeploymentGuideModal } from './components/DeploymentGuideModal';
import { SupabaseSyncModal } from './components/SupabaseSyncModal';
import { SystemItem } from './types/portal';
import { DEFAULT_SYSTEMS } from './data/defaultSystems';
import { probeEndpoint, toPersianDigits } from './utils/healthCheck';
import { Activity, RefreshCw, Plus, ShieldCheck, CheckCircle2, Database, AlertCircle } from 'lucide-react';
import { 
  fetchSystemsFromSupabase, 
  saveSystemsToSupabase, 
  deleteSystemFromSupabase, 
  supabase 
} from './lib/supabase';

const STORAGE_KEY = 'waateh_systems_config_v1';

export default function App() {
  // Systems state with local persistence
  const [systems, setSystems] = useState<SystemItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load systems from localStorage', e);
    }
    return DEFAULT_SYSTEMS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [viewerSystem, setViewerSystem] = useState<SystemItem | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [isTableMissing, setIsTableMissing] = useState(false);
  const [editingSystem, setEditingSystem] = useState<SystemItem | null>(null);
  const [isProbingAll, setIsProbingAll] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(systems));
    } catch (e) {
      console.error('Failed to save systems to localStorage', e);
    }
  }, [systems]);

  // Initial Supabase database synchronization & real-time changes listener
  useEffect(() => {
    let isMounted = true;

    const initSupabase = async () => {
      try {
        const res = await fetchSystemsFromSupabase();
        if (!isMounted) return;

        if (res.isTableMissing) {
          setIsTableMissing(true);
          setIsSupabaseConnected(false);
          return;
        }

        if (res.error) {
          console.warn('Supabase fetch error:', res.error);
          setIsSupabaseConnected(false);
          return;
        }

        setIsSupabaseConnected(true);
        setIsTableMissing(false);

        if (res.data && res.data.length > 0) {
          setSystems(res.data);
        } else {
          // Table exists in Supabase but is empty: seed it with current systems
          await saveSystemsToSupabase(systems);
        }
      } catch (err) {
        console.warn('Failed to connect to Supabase:', err);
      }
    };

    initSupabase();

    // Subscribe to Postgres changes in real-time
    const channel = supabase
      .channel('public:systems:realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'systems' },
        async () => {
          const res = await fetchSystemsFromSupabase();
          if (res.data && res.data.length > 0 && isMounted) {
            setSystems(res.data);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Update specific system status
  const handleUpdateStatus = (
    systemId: string,
    status: SystemItem['status'],
    latencyMs?: number,
    message?: string
  ) => {
    setSystems((prev) =>
      prev.map((s) =>
        s.id === systemId
          ? {
              ...s,
              status,
              latencyMs: latencyMs !== undefined ? latencyMs : s.latencyMs,
              statusMessage: message || s.statusMessage,
              lastChecked: new Date().toLocaleTimeString('fa-IR'),
            }
          : s
      )
    );
  };

  // Probe all systems sequentially with real network check
  const handleProbeAll = async () => {
    setIsProbingAll(true);
    for (const sys of systems) {
      handleUpdateStatus(sys.id, 'checking', undefined, 'در حال بررسی اتصال شبکه...');
      const target = sys.healthCheckUrl || sys.url;
      const res = await probeEndpoint(target);
      handleUpdateStatus(sys.id, res.status, res.latencyMs, res.message);
    }
    setIsProbingAll(false);
  };

  // Filter systems by search
  const filteredSystems = systems.filter((sys) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      sys.title.toLowerCase().includes(q) ||
      sys.subtitle.toLowerCase().includes(q) ||
      sys.category.toLowerCase().includes(q) ||
      sys.description.toLowerCase().includes(q) ||
      sys.url.toLowerCase().includes(q) ||
      (sys.internalCode && sys.internalCode.toLowerCase().includes(q))
    );
  });

  // Reset defaults handler
  const handleResetDefaults = async () => {
    setSystems(DEFAULT_SYSTEMS);
    try {
      localStorage.removeItem(STORAGE_KEY);
      await saveSystemsToSupabase(DEFAULT_SYSTEMS);
    } catch (e) {}
  };

  // Central handler to save systems with Supabase persistence
  const handleSaveSystems = async (newSystems: SystemItem[], deletedId?: string) => {
    setSystems(newSystems);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSystems));
    } catch (e) {}

    try {
      if (deletedId) {
        await deleteSystemFromSupabase(deletedId);
      }
      const res = await saveSystemsToSupabase(newSystems);
      if (!res.error) {
        setIsSupabaseConnected(true);
      }
    } catch (err) {
      console.warn('Failed to save systems to Supabase:', err);
    }
  };

  const [cardShape, setCardShape] = useState<'large' | 'square' | 'wide'>('large');

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f8fafc] text-slate-800 font-sans select-none overflow-y-auto">
      
      {/* 1. Executive Top Header */}
      <Header
        onOpenManageModal={() => {
          setEditingSystem(null);
          setIsManageModalOpen(true);
        }}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        isSupabaseConnected={isSupabaseConnected}
        isTableMissing={isTableMissing}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        systemsCount={systems.length}
      />

      {/* 2. Main Executive Command Dashboard */}
      <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-[1920px] w-full mx-auto">
        
        {/* Subtle executive status line with shape selector & actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-3 border-b border-slate-200 text-xs text-slate-500">
          
          {/* Status indicators */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">
              سامانه‌های یکپارچه گروه صنعتی واته
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>
              نمایش {toPersianDigits(filteredSystems.length)} از {toPersianDigits(systems.length)} سامانه فعال
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-[#b45309] font-medium hidden sm:inline">
              دسترسی امن سطح مدیریت ارشد
            </span>
          </div>

          {/* Controls: Box Shape Selector & Actions */}
          <div className="flex items-center gap-3">
            
            {/* Shape Switcher: Large Rectangle vs Square vs Wide */}
            <div className="flex items-center bg-slate-200/70 p-1 rounded-lg border border-slate-300/80 text-[11px]">
              <span className="px-2 text-slate-500 font-medium hidden md:inline">قالب باکس‌ها:</span>
              <button
                onClick={() => setCardShape('large')}
                className={`px-2.5 py-1 font-semibold rounded-md transition-all ${
                  cardShape === 'large'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="مستطیل بزرگ با ارتفاع کافی جهت مشاهده کامل سایت"
              >
                مستطیل بزرگ (۴:۳)
              </button>
              <button
                onClick={() => setCardShape('square')}
                className={`px-2.5 py-1 font-semibold rounded-md transition-all ${
                  cardShape === 'square'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="قالب مربعی متعادل"
              >
                مربعی (۱:۱)
              </button>
              <button
                onClick={() => setCardShape('wide')}
                className={`px-2.5 py-1 font-semibold rounded-md transition-all ${
                  cardShape === 'wide'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="کشیده و استاندارد دسکتاپ"
              >
                عریض (۱۶:۱۰)
              </button>
            </div>

            {/* Probe All */}
            <button
              onClick={handleProbeAll}
              disabled={isProbingAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs disabled:opacity-50"
              title="آزمایش زنده اتصال تمام سامانه‌ها"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#b45309] ${isProbingAll ? 'animate-spin' : ''}`} />
              <span>پایش اتصالات</span>
            </button>

            {/* Add System */}
            <button
              onClick={() => {
                setEditingSystem(null);
                setIsManageModalOpen(true);
              }}
              className="flex items-center gap-1 text-xs font-semibold text-[#b45309] hover:text-[#92400e] bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>افزودن سامانه</span>
            </button>
          </div>
        </div>

        {/* 3. The 2x2 Grid (Now with generous height and natural smooth scrolling) */}
        <div className="w-full pb-8">
          {filteredSystems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 w-full">
              {filteredSystems.map((system, index) => (
                <SystemCard
                  key={system.id}
                  system={system}
                  index={index}
                  cardShape={cardShape}
                  onOpenEmbed={(sys) => setViewerSystem(sys)}
                  onOpenEdit={(sys) => {
                    setEditingSystem(sys);
                    setIsManageModalOpen(true);
                  }}
                  onUpdateUrl={async (systemId, newUrl) => {
                    const updated = systems.map((s) =>
                      s.id === systemId ? { ...s, url: newUrl } : s
                    );
                    await handleSaveSystems(updated);
                  }}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[360px] bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xs">
              <p className="text-sm font-semibold text-slate-700 mb-2">
                هیچ سامانه‌ای با عبارت «{searchQuery}» یافت نشد.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#b45309] hover:underline mt-1 font-semibold"
              >
                پاک کردن فیلتر جستجو
              </button>
            </div>
          )}
        </div>

        {/* 4. Bottom Executive Telemetry Line */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-auto border-t border-slate-200 shrink-0 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">پرتال سازمانی گروه صنعتی واته</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>نسخه نهایی پایدار ۲.۰</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="font-mono dir-ltr">Waateh Enterprise Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ارتباط امن رمزنگاری‌شده</span>
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-slate-500">
              طراحی‌شده ویژه پنل مدیریت عامل
            </span>
          </div>
        </div>

      </main>


      {/* Embedded System Fullscreen Viewer Modal */}
      <SystemViewerModal
        system={viewerSystem}
        onClose={() => setViewerSystem(null)}
      />

      {/* Manage Systems Modal (CRUD + Reorder + Import/Export) */}
      <ManageSystemsModal
        isOpen={isManageModalOpen}
        onClose={() => {
          setIsManageModalOpen(false);
          setEditingSystem(null);
        }}
        systems={systems}
        onSaveSystems={handleSaveSystems}
        onResetDefaults={handleResetDefaults}
        initialEditSystem={editingSystem}
      />

      {/* Supabase Database Cloud Sync Modal */}
      <SupabaseSyncModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        systems={systems}
        onSystemsUpdated={(newSys) => {
          setSystems(newSys);
          setIsSupabaseConnected(true);
        }}
        isTableMissing={isTableMissing}
        isConnected={isSupabaseConnected}
      />

      {/* Deployment & Architecture Guide Modal */}
      <DeploymentGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

    </div>
  );
}
