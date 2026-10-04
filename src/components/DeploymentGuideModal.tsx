import React from 'react';
import { 
  X, 
  Server, 
  Terminal, 
  Shield, 
  Cpu, 
  Globe, 
  Check, 
  Layers, 
  Code2, 
  HelpCircle,
  FileCode
} from 'lucide-react';

interface DeploymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-4xl bg-[#091424] border border-[#1d3254] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#0d1a2f] border-b border-[#1b2c47] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#12233f] border border-[#d9822b]/40 text-[#d9822b]">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">راهنمای استقرار سازمانی و معماری فنی پرتال واته</h2>
              <p className="text-xs text-slate-400">دستورالعمل راه‌اندازی، متغیرهای محیطی، Reverse Proxy و سیاست‌های فریم در شبکه سازمان</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#162744] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
          
          {/* Section 1: Quick Start & Environment */}
          <div className="bg-[#0b1629] p-4 rounded-xl border border-[#1a2c47]">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#d9822b]" />
              <span>۱. راه‌اندازی و اجرای پرتال در محیط توسعه و سرور</span>
            </h3>
            <p className="mb-3">
              پرتال با استفاده از پشته فناوری استاندارد React 19، TypeScript و Vite ساخته شده است. برای اجرای محلی یا سروری:
            </p>
            <div className="bg-[#050912] p-3 rounded-lg border border-[#16253c] font-mono text-[11px] text-slate-200 dir-ltr text-left space-y-1">
              <div># ۱. نصب پیش‌نیازها و پکیج‌ها</div>
              <div className="text-emerald-400">npm install</div>
              <div># ۲. اجرای سرور توسعه</div>
              <div className="text-emerald-400">npm run dev</div>
              <div># ۳. بیلد نسخه نهایی جهت استقرار در سرور شرکت</div>
              <div className="text-emerald-400">npm run build</div>
            </div>
          </div>

          {/* Section 2: Environment variables */}
          <div className="bg-[#0b1629] p-4 rounded-xl border border-[#1a2c47]">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[#d9822b]" />
              <span>۲. تنظیم متغیرهای محیطی (.env)</span>
            </h3>
            <p className="mb-3">
              جهت تنظیمات هاستینگ سازمانی، فایل <code className="text-[#d9822b] font-mono">.env</code> را در ریشه پروژه قرار دهید:
            </p>
            <div className="bg-[#050912] p-3 rounded-lg border border-[#16253c] font-mono text-[11px] text-slate-300 dir-ltr text-left space-y-1">
              <div># پورت سرور در محیط شبکه</div>
              <div>PORT=3000</div>
              <div># آدرس سرور جهت دسترسی کلاینت‌ها و مدیران ارشد</div>
              <div>APP_URL="https://portal.waateh.internal"</div>
              <div># نام شرکت یا هلدینگ</div>
              <div>VITE_ORG_NAME="گروه صنعتی واته"</div>
            </div>
          </div>

          {/* Section 3: Iframe & Reverse Proxy instructions */}
          <div className="bg-[#0b1629] p-4 rounded-xl border border-[#1a2c47]">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#d9822b]" />
              <span>۳. نحوه تنظیم هدرهای امنیتی و NGINX برای نمایش بدون مشکل در iframe</span>
            </h3>
            <p className="mb-2">
              مرورگرهای مدرن سامانه‌هایی را که دارای هدر <code className="text-[#d9822b] font-mono">X-Frame-Options: DENY</code> یا <code className="text-[#d9822b] font-mono">SAMEORIGIN</code> باشند، در داخل فریم‌های دامنه‌های دیگر مسدود می‌کنند. اگر می‌خواهید سامانه‌های داخلی (مانند SAP، WMS، چیلر) مستقیماً داخل پرتال یکپارچه باز شوند:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pr-2 mb-3">
              <li>
                در NGINX سرورهای هر سامانه، اجازه نمایش در فریم پرتال را مشخص کنید:
              </li>
            </ul>
            <div className="bg-[#050912] p-3 rounded-lg border border-[#16253c] font-mono text-[11px] text-slate-300 dir-ltr text-left space-y-1">
              <div># نمونه کانفیگ NGINX برای سرورهای داخلی واته:</div>
              <div>location / &#123;</div>
              <div className="pl-4 text-emerald-400">
                add_header Content-Security-Policy "frame-ancestors 'self' https://portal.waateh.internal http://192.168.*";
              </div>
              <div className="pl-4 text-slate-400">
                # یا برای دسترسی بدون محدودیت فریم در اینترانت امن:
              </div>
              <div className="pl-4 text-amber-400">
                proxy_hide_header X-Frame-Options;
              </div>
              <div>&#125;</div>
            </div>
            <p className="mt-2 text-slate-400 text-[11px]">
              * در صورتی که امکان تغییر هدرهای سامانه‌ای مقدور نباشد، در بخش مدیریت سامانه گزینه نمایش را بر روی «مستقیماً در برگه جدید مرورگر» تنظیم کنید تا با یک کلیک در تب مجزا باز شود.
            </p>
          </div>

          {/* Section 4: Docker & Production Hosting */}
          <div className="bg-[#0b1629] p-4 rounded-xl border border-[#1a2c47]">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#d9822b]" />
              <span>۴. استقرار آسان از طریق داکر (Docker & Docker Compose)</span>
            </h3>
            <p className="mb-2">
              برای قرار دادن پرتال روی سرور لینوکس سازمان با استفاده از داکر:
            </p>
            <div className="bg-[#050912] p-3 rounded-lg border border-[#16253c] font-mono text-[11px] text-slate-300 dir-ltr text-left space-y-1">
              <div>FROM node:20-alpine AS build</div>
              <div>WORKDIR /app</div>
              <div>COPY package*.json ./</div>
              <div>RUN npm install</div>
              <div>COPY . .</div>
              <div>RUN npm run build</div>
              <div><br />FROM nginx:alpine</div>
              <div>COPY --from=build /app/dist /usr/share/nginx/html</div>
              <div>EXPOSE 80</div>
              <div>CMD ["nginx", "-g", "daemon off;"]</div>
            </div>
          </div>

          {/* Section 5: Data Persistence & CEO Security */}
          <div className="bg-[#0b1629] p-4 rounded-xl border border-[#1a2c47]">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#d9822b]" />
              <span>۵. ماندگاری داده‌ها و امنیت دسترسی مدیران ارشد</span>
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-slate-300 pr-2">
              <li>
                <strong>ذخیره‌سازی تنظیمات:</strong> کلیه آدرس‌های ویرایش‌شده و ترتیب سامانه‌ها در حافظه محلی مرورگر (Local Storage) مرورگر مدیران ذخیره می‌شود و با بستن مرورگر پاک نمی‌شود.
              </li>
              <li>
                <strong>پشتیبان‌گیری سازمانی:</strong> می‌توانید در هر زمان با زدن دکمه «پشتیبان‌گیری JSON» در بخش مدیریت، فایل پیکربندی را دانلود و روی سایر سیستم‌ها وارد (Import) کنید.
              </li>
              <li>
                <strong>عدم وجود پسوردهای هاردکد:</strong> هیچ رمز عبور یا کلید دسترسی در کد کاربری وجود ندارد و نشست‌های کاربری (Session) هر سامانه از طریق کوکی‌های مجزای همان سرور نگهداری می‌شود.
              </li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0d1a2f] border-t border-[#1b2c47] flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            واحد فناوری اطلاعات و زیرساخت دیجیتال گروه صنعتی واته
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-[#102038] hover:bg-[#162c4d] border border-[#1d3356] hover:border-[#d9822b] rounded-lg transition-colors"
          >
            بستن راهنما
          </button>
        </div>

      </div>
    </div>
  );
};
