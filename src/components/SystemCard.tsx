import React, { useState, useRef, useEffect } from 'react';
import { 
  Edit3, 
  ExternalLink, 
  Globe, 
  RotateCcw,
  Layers, 
  Calculator, 
  Warehouse, 
  Gauge, 
  ShieldCheck, 
  TrendingUp, 
  Terminal, 
  Network,
  Maximize2,
  MousePointer,
  Unlock,
  Database,
  Check,
  Save,
  Link2
} from 'lucide-react';
import { SystemItem } from '../types/portal';

export type CardShape = 'large' | 'square' | 'wide';

interface SystemCardProps {
  system: SystemItem;
  index: number;
  cardShape?: CardShape;
  onOpenEmbed: (system: SystemItem) => void;
  onOpenEdit: (system: SystemItem) => void;
  onUpdateUrl?: (systemId: string, newUrl: string) => Promise<void> | void;
  onUpdateStatus?: (systemId: string, status: SystemItem['status'], latencyMs?: number, message?: string) => void;
}

export const SystemCard: React.FC<SystemCardProps> = ({
  system,
  index,
  cardShape = 'large',
  onOpenEmbed,
  onOpenEdit,
  onUpdateUrl,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);

  // Quick URL editing state
  const isPlaceholderUrl = 
    !system.url || 
    system.url.includes('example.com') || 
    system.url.includes('.internal') ||
    system.url === 'https://' ||
    system.url === 'http://';

  const [inputUrl, setInputUrl] = useState(isPlaceholderUrl ? '' : system.url);
  const [isSavingUrl, setIsSavingUrl] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setInputUrl(isPlaceholderUrl ? '' : system.url);
  }, [system.url, isPlaceholderUrl]);
  
  // Dynamic scaling so the entire desktop website fits in the box
  const [viewportDims, setViewportDims] = useState({
    scale: 0.5,
    virtualWidth: 1280,
    virtualHeight: 900,
  });

  useEffect(() => {
    if (!viewportRef.current) return;

    const computeScale = () => {
      if (!viewportRef.current) return;
      const rect = viewportRef.current.getBoundingClientRect();
      const containerWidth = rect.width;
      const containerHeight = rect.height;

      if (containerWidth <= 0 || containerHeight <= 0) return;

      // Target virtual desktop width: 1280px for optimal density and legibility
      const virtualWidth = 1280;
      const scale = Math.max(0.25, containerWidth / virtualWidth);
      const virtualHeight = Math.max(760, Math.round(containerHeight / scale));

      setViewportDims({
        scale,
        virtualWidth,
        virtualHeight,
      });
    };

    computeScale();
    const ro = new ResizeObserver(computeScale);
    ro.observe(viewportRef.current);
    window.addEventListener('resize', computeScale);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', computeScale);
    };
  }, [cardShape, isPlaceholderUrl]);

  const handleBoxClick = () => {
    if (isPlaceholderUrl) return;

    // If not in direct interactive scroll mode, clicking the box opens the site full screen
    if (!isInteractive) {
      if (system.embedMode === 'new_tab') {
        window.open(system.url, '_blank', 'noopener,noreferrer');
      } else {
        onOpenEmbed(system);
      }
    }
  };

  const handleRefreshIframe = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasError(false);
    setIframeKey((prev) => prev + 1);
  };

  const handleQuickUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inputUrl.trim()) return;

    let finalUrl = inputUrl.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }

    setIsSavingUrl(true);
    try {
      if (onUpdateUrl) {
        await onUpdateUrl(system.id, finalUrl);
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Error updating URL:', err);
    } finally {
      setIsSavingUrl(false);
    }
  };

  // Icon mapping
  const renderIcon = () => {
    const iconClass = "w-4 h-4 text-[#b45309]";
    switch (system.icon) {
      case 'calculator':
        return <Calculator className={iconClass} />;
      case 'copper':
        return <Layers className={iconClass} />;
      case 'warehouse':
        return <Warehouse className={iconClass} />;
      case 'chiller':
        return <Gauge className={iconClass} />;
      case 'analytics':
        return <TrendingUp className={iconClass} />;
      case 'shield':
        return <ShieldCheck className={iconClass} />;
      case 'terminal':
        return <Terminal className={iconClass} />;
      default:
        return <Network className={iconClass} />;
    }
  };

  // Compute container shape class
  const getShapeClass = () => {
    if (cardShape === 'square') {
      return 'aspect-square min-h-[500px] lg:min-h-[560px]';
    }
    if (cardShape === 'wide') {
      return 'aspect-[16/10] min-h-[460px] lg:min-h-[520px]';
    }
    // Default large rectangle (4:3) - tall and spacious so full page fits
    return 'aspect-[4/3] min-h-[520px] lg:min-h-[600px]';
  };

  return (
    <div 
      onClick={handleBoxClick}
      className={`group relative w-full flex flex-col bg-white border border-slate-200 hover:border-[#b45309] rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 ${
        isInteractive || isPlaceholderUrl ? 'cursor-default' : 'cursor-pointer'
      } overflow-hidden ${getShapeClass()}`}
    >
      {/* 1. Executive Window Titlebar (Clean Light Titanium) */}
      <div className="h-11 bg-slate-50/95 border-b border-slate-200 px-4 flex items-center justify-between gap-3 shrink-0 z-20 select-none">
        
        {/* Right side (RTL start): System Title, Icon & Window Indicators */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0 pl-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400/90 border border-rose-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/90 border border-amber-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/90 border border-emerald-400" />
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1 rounded-md bg-white border border-slate-200 shadow-2xs shrink-0">
              {renderIcon()}
            </div>
            <span className="text-xs lg:text-sm font-bold text-slate-900 truncate tracking-tight">
              {system.title}
            </span>
            <span className="hidden xl:inline text-xs text-slate-500 font-mono truncate">
              ({system.category})
            </span>
          </div>
        </div>

        {/* Left side (Top-Left Corner): Tools & Pencil Edit button */}
        <div className="flex items-center gap-1.5 shrink-0">
          
          {!isPlaceholderUrl && (
            <>
              {/* Direct Interactive Scroll Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsInteractive(!isInteractive);
                }}
                className={`flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-lg border transition-all ${
                  isInteractive
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
                }`}
                title={isInteractive ? 'حالت اسکرول مستقیم فعال است (برای قفل کلیک کنید)' : 'فعال‌سازی اسکرول مستقیم داخل سایت'}
              >
                {isInteractive ? (
                  <>
                    <Unlock className="w-3 h-3 text-emerald-600" />
                    <span className="hidden sm:inline">اسکرول فعال</span>
                  </>
                ) : (
                  <>
                    <MousePointer className="w-3 h-3 text-slate-400" />
                    <span className="hidden sm:inline">اسکرول سایت</span>
                  </>
                )}
              </button>

              {/* Full-screen enter button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEmbed(system);
                }}
                className="p-1.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs"
                title="ورود تمام‌صفحه به سامانه"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              {/* Open in new tab button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(system.url, '_blank', 'noopener,noreferrer');
                }}
                className="p-1.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs"
                title="باز کردن در برگه جدید"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              {/* Refresh iframe button */}
              <button
                onClick={handleRefreshIframe}
                className="p-1.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs"
                title="بروزرسانی پیش‌نمایش"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Pencil Edit button (placed at top-left corner as requested) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenEdit(system);
            }}
            className="p-1.5 text-[#b45309] hover:text-white bg-white hover:bg-[#b45309] border border-[#b45309]/30 hover:border-[#b45309] rounded-lg transition-all active:scale-95 shadow-xs"
            title="ویرایش کامل آدرس و تنظیمات سامانه"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Scaled Virtual Desktop Viewport or Direct Setup Card */}
      <div 
        ref={viewportRef}
        className="relative flex-1 w-full h-full overflow-hidden bg-white select-none"
      >
        {/* Placeholder / Setup View: When system has no real URL configured yet */}
        {isPlaceholderUrl ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-50/60 to-white">
            <div className="w-16 h-16 rounded-2xl bg-amber-50/80 border border-amber-200 shadow-sm flex items-center justify-center mb-4 text-[#b45309]">
              {renderIcon()}
            </div>
            
            <h4 className="text-base font-bold text-slate-900 mb-1">
              {system.title}
            </h4>

            {system.subtitle && (
              <p className="text-xs text-slate-500 max-w-md mb-3 leading-relaxed">
                {system.subtitle}
              </p>
            )}

            {/* Supabase status badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold mb-5 shadow-2xs">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>ثبت‌شده در پایگاه‌داده سوپابیس (Supabase) · آماده اتصال آدرس سامانه</span>
            </div>

            {/* Quick URL Input Form */}
            <form 
              onSubmit={handleQuickUrlSubmit}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white border border-slate-200 p-3.5 rounded-xl shadow-md space-y-3"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <Link2 className="w-3.5 h-3.5 text-[#b45309]" />
                  <span>آدرس اینترنتی یا لوکال این سامانه را وارد کنید:</span>
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  dir="ltr"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://accounting.waateh.com یا http://localhost:8080"
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#b45309] font-mono"
                />

                <button
                  type="submit"
                  disabled={isSavingUrl || !inputUrl.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-[#b45309] to-[#d97706] hover:from-[#c25e0a] hover:to-[#e58e37] text-white text-xs font-bold rounded-lg shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>ذخیره شد!</span>
                    </>
                  ) : (
                    <>
                      <Save className={`w-3.5 h-3.5 ${isSavingUrl ? 'animate-spin' : ''}`} />
                      <span>ثبت در دیتابیس</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                <span>پس از ثبت، سایت به صورت زنده داخل کادر نمایش می‌یابد.</span>
                <button
                  type="button"
                  onClick={() => onOpenEdit(system)}
                  className="text-[#b45309] hover:underline font-semibold"
                >
                  تنظیمات پیشرفته
                </button>
              </div>
            </form>

          </div>
        ) : (
          /* Scaled Desktop Iframe */
          <>
            <iframe
              key={iframeKey}
              src={system.url}
              title={system.title}
              loading="lazy"
              onError={() => setHasError(true)}
              style={{
                width: `${viewportDims.virtualWidth}px`,
                height: `${viewportDims.virtualHeight}px`,
                transform: `scale(${viewportDims.scale})`,
                transformOrigin: 'top left',
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: isInteractive ? 'auto' : 'none',
              }}
              className="border-0 bg-white transition-transform duration-100"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />

            {/* Hover click overlay (only visible when not in direct interactive scroll mode) */}
            {!isInteractive && (
              <div className="absolute inset-0 z-10 bg-transparent group-hover:bg-slate-900/5 transition-colors pointer-events-none" />
            )}

            {/* Floating bottom badge on hover informing the CEO to click to enter */}
            {!isInteractive && (
              <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex items-center justify-between bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200 shadow-lg text-xs text-slate-800">
                  <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500 truncate dir-ltr text-left">
                    <Globe className="w-3.5 h-3.5 text-[#b45309] shrink-0" />
                    <span className="truncate">{system.url}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#b45309] font-bold text-xs shrink-0 mr-2">
                    <span>کلیک برای ورود تمام‌صفحه</span>
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            )}

            {/* Direct interactive scroll helper notice when enabled */}
            {isInteractive && (
              <div className="absolute top-2 left-3 z-20 bg-emerald-600 text-white text-[11px] font-medium px-2.5 py-1 rounded-md shadow-md flex items-center gap-1.5 animate-in fade-in">
                <Unlock className="w-3 h-3" />
                <span>حالت اسکرول و کار فعال است</span>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};
