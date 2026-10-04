import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ExternalLink, 
  RefreshCw, 
  Copy, 
  Check, 
  ShieldAlert, 
  Globe, 
  Maximize2,
  Info
} from 'lucide-react';
import { SystemItem } from '../types/portal';

interface SystemViewerModalProps {
  system: SystemItem | null;
  onClose: () => void;
}

export const SystemViewerModal: React.FC<SystemViewerModalProps> = ({
  system,
  onClose,
}) => {
  const [iframeKey, setIframeKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showIframeNotice, setShowIframeNotice] = useState(true);

  // Reset state when system changes
  useEffect(() => {
    setIframeLoaded(false);
    setIframeKey((prev) => prev + 1);
  }, [system]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!system) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(system.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = () => {
    setIframeLoaded(false);
    setIframeKey((k) => k + 1);
  };

  const handleOpenExternal = () => {
    window.open(system.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white select-none text-slate-800 animate-in fade-in duration-200">
      
      {/* Top Executive Control Bar */}
      <div className="h-14 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between gap-4 shrink-0 shadow-xs">
        
        {/* Left: Back button & System info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:text-black bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-[#b45309] rounded-lg transition-colors shadow-2xs"
          >
            <ArrowRight className="w-4 h-4 text-[#b45309]" />
            <span>بازگشت به پرتال</span>
            <kbd className="hidden sm:inline-block font-mono text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              Esc
            </kbd>
          </button>

          <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 tracking-tight">{system.title}</span>
              <span className="hidden md:inline text-xs text-[#b45309] font-medium">({system.category})</span>
            </div>
          </div>
        </div>

        {/* Center: Live URL display and copy */}
        <div className="hidden lg:flex items-center gap-2 max-w-md w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
          <Globe className="w-3.5 h-3.5 text-[#b45309] shrink-0" />
          <span className="text-xs text-slate-700 font-mono truncate select-all dir-ltr text-left flex-1">
            {system.url}
          </span>
          <button
            onClick={handleCopyUrl}
            className="text-slate-400 hover:text-slate-700 transition-colors"
            title="کپی آدرس سامانه"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors shadow-2xs"
            title="تازه‌سازی فریم سامانه"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">بروزرسانی</span>
          </button>

          <button
            onClick={handleOpenExternal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#b45309] to-[#d97706] hover:from-[#c25e0a] hover:to-[#e58e37] rounded-lg shadow-xs transition-colors"
            title="باز کردن در برگه جدید مرورگر"
          >
            <span>برگه جدید</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Security notice regarding X-Frame-Options in enterprise intranets */}
      {showIframeNotice && (
        <div className="bg-amber-50/90 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-900 gap-3">
          <div className="flex items-center gap-2 truncate">
            <Info className="w-4 h-4 text-[#b45309] shrink-0" />
            <span className="truncate">
              توجه امنیتی: در صورتی که سامانه به علت سیاست <code className="text-[#b45309] font-mono font-bold">X-Frame-Options</code> یا <code className="text-[#b45309] font-mono font-bold">CSP</code> در داخل فریم نمایش داده نشد، از دکمه «برگه جدید» استفاده فرمایید.
            </span>
          </div>
          <button
            onClick={() => setShowIframeNotice(false)}
            className="text-amber-700 hover:text-amber-950 font-medium text-xs shrink-0 px-2"
          >
            متوجه شدم
          </button>
        </div>
      )}

      {/* Main Iframe Container */}
      <div className="relative flex-1 w-full h-full bg-[#050912] overflow-hidden">
        
        {/* Loading Skeleton / Fallback overlay */}
        {!iframeLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070e1b] z-10 p-6 text-center">
            <div className="relative w-16 h-16 rounded-2xl bg-[#0e1d33] border border-[#d9822b]/40 flex items-center justify-center mb-4 shadow-lg">
              <RefreshCw className="w-7 h-7 text-[#d9822b] animate-spin" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">در حال اتصال و بارگذاری {system.title}...</h3>
            <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
              اگر سامانه شما در شبکه داخلی (اینترانت) قرار دارد یا محدودیت دسترسی فریم دارد، می‌توانید آن را مستقیماً در برگه مجزا باز کنید.
            </p>
            <button
              onClick={handleOpenExternal}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#b45309] hover:bg-[#d9822b] rounded-lg shadow-md transition-colors"
            >
              <span>باز کردن فوری در برگه مجزا</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Real Iframe */}
        <iframe
          key={iframeKey}
          src={system.url}
          title={system.title}
          className="w-full h-full border-0 select-auto"
          onLoad={() => setIframeLoaded(true)}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"
        />
      </div>

    </div>
  );
};
