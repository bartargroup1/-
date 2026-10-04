import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Server,
  Cloud
} from 'lucide-react';
import { 
  SUPABASE_URL, 
  SUPABASE_ANON_KEY, 
  SUPABASE_SQL_SCHEMA, 
  fetchSystemsFromSupabase,
  saveSystemsToSupabase 
} from '../lib/supabase';
import { SystemItem } from '../types/portal';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  systems: SystemItem[];
  onSystemsUpdated: (systems: SystemItem[]) => void;
  isTableMissing: boolean;
  isConnected: boolean;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({
  isOpen,
  onClose,
  systems,
  onSystemsUpdated,
  isTableMissing,
  isConnected,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncStatusMsg('در حال همگام‌سازی با پایگاه‌داده سوپابیس...');

    // First try fetching
    const fetchRes = await fetchSystemsFromSupabase();
    
    if (fetchRes.isTableMissing) {
      setSyncStatusMsg('خطا: جدول systems در پایگاه‌داده یافت نشد. لطفاً اسکریپت SQL زیر را در بخش SQL Editor سوپابیس اجرا فرمایید.');
      setIsSyncing(false);
      return;
    }

    if (fetchRes.data && fetchRes.data.length > 0) {
      onSystemsUpdated(fetchRes.data);
      setSyncStatusMsg(`همگام‌سازی موفق: تعداد ${fetchRes.data.length} سامانه از سوپابیس دریافت شد.`);
    } else {
      // If table is empty, upload current systems
      const saveRes = await saveSystemsToSupabase(systems);
      if (saveRes.error) {
        const errMsg = (saveRes.error as any)?.message || String(saveRes.error);
        setSyncStatusMsg('خطا در بارگذاری سامانه‌ها به سوپابیس: ' + errMsg);
      } else {
        setSyncStatusMsg(`تعداد ${systems.length} سامانه با موفقیت در پایگاه‌داده سوپابیس ذخیره شدند.`);
      }
    }

    setIsSyncing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-2xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">همگام‌سازی ابری با پایگاه‌داده سوپابیس (Supabase)</h2>
              <p className="text-xs text-slate-500 font-mono dir-ltr text-right">{SUPABASE_URL}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 leading-relaxed">
          
          {/* Status Box */}
          <div className="p-4 rounded-xl border bg-slate-50 border-slate-200 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">وضعیت اتصال به سرور:</span>
                {isTableMissing ? (
                  <span className="flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>متصل به پروژه / در انتظار ایجاد جدول</span>
                  </span>
                ) : isConnected ? (
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>پایگاه‌داده متصل و فعال</span>
                  </span>
                ) : (
                  <span className="text-slate-500">در حال بررسی...</span>
                )}
              </div>
              <p className="text-slate-500 text-[11px]">
                پروژه: <code className="font-mono text-slate-700">{SUPABASE_URL}</code>
              </p>
            </div>

            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#b45309] to-[#d97706] hover:from-[#c25e0a] hover:to-[#e58e37] rounded-lg shadow-xs transition-all disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>همگام‌سازی فوری</span>
            </button>
          </div>

          {syncStatusMsg && (
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 font-medium">
              {syncStatusMsg}
            </div>
          )}

          {/* SQL Setup Instruction */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">
                اسکریپت SQL ساخت جدول سامانه‌ها در سوپابیس:
              </span>
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#b45309]" />}
                <span>{copied ? 'کپی شد!' : 'کپی دستورات SQL'}</span>
              </button>
            </div>
            
            <p className="text-slate-500 text-[11px]">
              برای راه‌اندازی اولیه در سوپابیس: وارد داشبورد پروژه خود شده، از منوی سمت چپ به <strong>SQL Editor</strong> بروید و این کد را <strong>Run</strong> نمایید:
            </p>

            <div className="relative bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[11px] dir-ltr text-left overflow-x-auto shadow-inner border border-slate-800">
              <pre>{SUPABASE_SQL_SCHEMA}</pre>
            </div>
          </div>

          <div className="bg-emerald-50/80 border border-emerald-200 p-3 rounded-xl text-emerald-950 text-[11px] space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-emerald-800">
              <Cloud className="w-4 h-4 text-emerald-600" />
              <span>مزایای اتصال سوپابیس به پرتال:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-slate-700 pr-1">
              <li>ذخیره دائمی و متمرکز تمام آدرس‌ها و تنظیمات روی دیتابیس ابری PostgreSQL</li>
              <li>همگام‌سازی زنده و لحظه‌ای (Real-time): تغییر آدرس توسط هر مدیر، بدون نیاز به رفرش در تمام سیستم‌ها اعمال می‌شود.</li>
              <li>بدون وابستگی به مرورگر یا کش محلی دستگاه‌ها</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <a
            href="https://supabase.com/dashboard/project/zozlanygromtrhfogimx/editor"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-[#b45309] hover:underline font-semibold"
          >
            <span>ورود به داشبورد پروژه در سوپابیس</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs"
          >
            بستن
          </button>
        </div>

      </div>
    </div>
  );
};
