import React, { useState, useEffect } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  Settings2, 
  BookOpen, 
  Activity, 
  Clock, 
  Calendar,
  Building2,
  Search,
  Database
} from 'lucide-react';
import { toPersianDigits } from '../utils/healthCheck';
import executiveAvatar from '../assets/images/waateh_executive_ceo_1791098200963.jpg';

interface HeaderProps {
  onOpenManageModal: () => void;
  onOpenGuideModal: () => void;
  onOpenSupabaseModal?: () => void;
  isSupabaseConnected?: boolean;
  isTableMissing?: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  systemsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenManageModal,
  onOpenGuideModal,
  onOpenSupabaseModal,
  isSupabaseConnected,
  isTableMissing,
  searchQuery,
  onSearchChange,
  systemsCount,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  // Persian real-time clock & Jalali date
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      
      // Jalali date format
      const dateStr = new Intl.DateTimeFormat('fa-IR', {
        dateStyle: 'full',
      }).format(now);
      setCurrentDate(dateStr);

      // Time format with seconds
      const timeStr = new Intl.DateTimeFormat('fa-IR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now);
      setCurrentTime(timeStr);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return (
    <header className="w-full bg-white/95 border-b border-slate-200 shrink-0 select-none z-30 px-4 lg:px-8 py-3 transition-colors shadow-xs">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-4">
        
        {/* Zone 1: Single element brand title lockup compliant with top bar contract */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-[#0f172a] border border-[#b45309]/50 shadow-sm">
            <span className="text-[#f59e0b] font-black text-xl tracking-tighter">W</span>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#b45309] ring-2 ring-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base lg:text-lg font-bold text-slate-900 tracking-tight leading-tight">
              پرتال یکپارچه سامانه‌های واته
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>گروه صنعتی و بازرگانی واته</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#b45309] font-medium">مرکز کنترل مدیریتی</span>
            </div>
          </div>
        </div>

        {/* Zone 2: Search & Live Telemetry metadata (unboxed, no pills) */}
        <div className="hidden md:flex items-center gap-6 text-xs text-slate-500">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute right-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="جستجو در سامانه‌ها..."
              className="bg-slate-50 border border-slate-200 focus:border-[#b45309] text-slate-800 text-xs rounded-lg pr-9 pl-3 py-1.5 w-44 lg:w-56 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute left-2.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                ×
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-[#b45309]" />
            <span className="font-medium">{currentDate || 'در حال بارگذاری تقویم...'}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-700 font-mono tabular-nums bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-[#b45309]" />
            <span className="text-xs font-semibold text-slate-800">{currentTime || '--:--:--'}</span>
          </div>
        </div>

        {/* Zone 3: Executive Profile & Primary Controls */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Supabase Database sync button */}
          {onOpenSupabaseModal && (
            <button
              onClick={onOpenSupabaseModal}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shadow-2xs ${
                isTableMissing
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                  : isSupabaseConnected
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title="اتصال و وضعیت پایگاه‌داده ابری سوپابیس"
            >
              <Database className={`w-3.5 h-3.5 ${isTableMissing ? 'text-amber-600' : isSupabaseConnected ? 'text-emerald-600' : 'text-[#b45309]'}`} />
              <span className="hidden sm:inline">دیتابیس ابری</span>
              <span className={`w-2 h-2 rounded-full ${isTableMissing ? 'bg-amber-500 animate-pulse' : isSupabaseConnected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            </button>
          )}

          {/* Guide button */}
          <button
            onClick={onOpenGuideModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-[#b45309]/50 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
            title="راهنمای استقرار و پیکربندی شبکه"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#b45309]" />
            <span className="hidden sm:inline">راهنمای استقرار</span>
          </button>

          {/* Manage systems modal button */}
          <button
            onClick={onOpenManageModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-[#b45309]/50 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
            title="مدیریت و پیکربندی آدرس سامانه‌ها"
          >
            <Settings2 className="w-3.5 h-3.5 text-[#b45309]" />
            <span className="hidden sm:inline">مدیریت سامانه‌ها</span>
            <span className="text-[11px] text-[#b45309] font-mono tabular-nums font-bold">({toPersianDigits(systemsCount)})</span>
          </button>

          {/* Fullscreen toggle button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-[#b45309]/50 rounded-lg transition-colors shadow-2xs"
            title={isFullscreen ? 'خروج از حالت تمام‌صفحه' : 'نمایش تمام‌صفحه پرتال'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-[#b45309]" />
            ) : (
              <Maximize2 className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Executive user lockup */}
          <div className="flex items-center gap-2.5 pr-2 mr-1 border-r border-slate-200">
            <div className="relative">
              <img
                src={executiveAvatar}
                alt="مدیر ارشد سازمان"
                className="w-8 h-8 rounded-full object-cover border border-[#b45309]/60 shadow-xs"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 left-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
            </div>
            <div className="hidden xl:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900 leading-tight">مدیریت عامل</span>
              <span className="text-[11px] text-slate-500 leading-tight">دسترسی رده ارشد</span>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
