import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit2, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  AlertTriangle,
  Globe,
  Settings,
  Layers,
  Calculator,
  Warehouse,
  Gauge,
  ShieldCheck,
  TrendingUp,
  Terminal,
  Network
} from 'lucide-react';
import { SystemItem, EmbedMode } from '../types/portal';
import { toPersianDigits } from '../utils/healthCheck';

interface ManageSystemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  systems: SystemItem[];
  onSaveSystems: (newSystems: SystemItem[], deletedId?: string) => void;
  onResetDefaults: () => void;
  initialEditSystem?: SystemItem | null;
}

export const ManageSystemsModal: React.FC<ManageSystemsModalProps> = ({
  isOpen,
  onClose,
  systems,
  onSaveSystems,
  onResetDefaults,
  initialEditSystem,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'edit'>('list');
  const [editingSystem, setEditingSystem] = useState<Partial<SystemItem> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // If initialEditSystem was passed, open edit tab immediately
  React.useEffect(() => {
    if (initialEditSystem) {
      setEditingSystem({ ...initialEditSystem });
      setIsNew(false);
      setActiveTab('edit');
    }
  }, [initialEditSystem]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 2500);
  };

  const handleStartAdd = () => {
    setEditingSystem({
      id: `sys-${Date.now()}`,
      title: '',
      subtitle: '',
      category: 'سامانه‌های عمومی',
      description: '',
      url: 'https://',
      healthCheckUrl: '',
      icon: 'network',
      embedMode: 'auto',
      tags: [],
      order: systems.length + 1,
      accentColor: '#d9822b',
      internalCode: `SYS-${systems.length + 1}`,
      status: 'untested',
      statusMessage: 'بدون پایشگر زنده / آماده اتصال',
    });
    setIsNew(true);
    setActiveTab('edit');
  };

  const handleStartEdit = (sys: SystemItem) => {
    setEditingSystem({ ...sys });
    setIsNew(false);
    setActiveTab('edit');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSystem || !editingSystem.title || !editingSystem.url) {
      alert('لطفاً عنوان و آدرس سامانه را وارد نمایید.');
      return;
    }

    const currentList = [...systems];
    if (isNew) {
      const newItem: SystemItem = {
        id: editingSystem.id || `sys-${Date.now()}`,
        title: editingSystem.title,
        subtitle: editingSystem.subtitle || '',
        category: editingSystem.category || 'سامانه سازمانی',
        description: editingSystem.description || '',
        url: editingSystem.url,
        healthCheckUrl: editingSystem.healthCheckUrl || '',
        icon: editingSystem.icon || 'network',
        embedMode: (editingSystem.embedMode as EmbedMode) || 'auto',
        tags: editingSystem.tags || [],
        order: currentList.length + 1,
        accentColor: editingSystem.accentColor || '#d9822b',
        internalCode: editingSystem.internalCode || '',
        status: 'untested',
        statusMessage: 'بدون پایشگر زنده / آماده اتصال',
      };
      const updated = [...currentList, newItem];
      onSaveSystems(updated);
      showToast('سامانه جدید با موفقیت اضافه شد');
    } else {
      const updated = currentList.map((item) =>
        item.id === editingSystem.id
          ? ({ ...item, ...editingSystem, status: 'untested' } as SystemItem)
          : item
      );
      onSaveSystems(updated);
      showToast('مشخصات سامانه با موفقیت بروزرسانی شد');
    }

    setActiveTab('list');
    setEditingSystem(null);
  };

  const handleDelete = (id: string) => {
    const updated = systems.filter((s) => s.id !== id);
    onSaveSystems(updated, id);
    setDeleteConfirmId(null);
    showToast('سامانه با موفقیت حذف شد');
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= systems.length) return;

    const list = [...systems];
    const temp = list[index];
    list[index] = list[newIdx];
    list[newIdx] = temp;

    // reassign orders
    const reordered = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    onSaveSystems(reordered);
  };

  // Export JSON configuration
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(systems, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `waateh-portal-config-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('فایل پشتیبان با موفقیت دانلود شد');
  };

  // Import JSON configuration
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          onSaveSystems(imported);
          showToast('تنظیمات جدید از فایل وارد شد');
        } else {
          alert('قالب فایل نامعتبر است.');
        }
      } catch (err) {
        alert('خطا در خواندن فایل پیکربندی JSON');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white border border-slate-200 text-[#b45309] shadow-2xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">مدیریت و پیکربندی سامانه‌های پرتال</h2>
              <p className="text-xs text-slate-500">تغییر آدرس‌ها، ترتیب چینش و مشخصات فنی وب‌اپلیکیشن‌ها</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switchers */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => {
                  setActiveTab('list');
                  setEditingSystem(null);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'list'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                فهرست سامانه‌ها ({toPersianDigits(systems.length)})
              </button>
              <button
                onClick={handleStartAdd}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'edit' && isNew
                    ? 'bg-[#b45309] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>افزودن سامانه جدید</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success toast notification */}
        {successToast && (
          <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 px-6 py-2 text-xs flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'list' ? (
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="text-xs text-slate-500">
                  برای تغییر چیدمان کارت‌ها در صفحه اصلی، از دکمه‌های بالا و پایین استفاده کنید.
                </div>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-[#b45309]" />
                    <span>ورود فایل JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportJSON}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={handleExportJSON}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-[#b45309]" />
                    <span>پشتیبان‌گیری JSON</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('آیا از بازنشانی کلیه تنظیمات به حالت اولیه کارخانه اطمینان دارید؟')) {
                        onResetDefaults();
                        showToast('تنظیمات به حالت پیش‌فرض کارخانه بازگشت');
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                    <span>بازنشانی پیش‌فرض</span>
                  </button>
                </div>
              </div>

              {/* Systems List */}
              <div className="space-y-2.5">
                {systems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#b45309]/50 transition-colors gap-3 shadow-2xs"
                  >
                    {/* Index & Title */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="font-mono text-xs text-[#b45309] font-bold bg-white px-2 py-1 rounded border border-slate-200 shadow-2xs">
                        ۰{toPersianDigits(idx + 1)}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 truncate">{item.title}</span>
                          <span className="text-[11px] text-slate-500 font-mono">({item.category})</span>
                        </div>
                        <div className="text-xs text-slate-500 font-mono truncate dir-ltr text-right mt-0.5">
                          {item.url}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Move up / down */}
                      <button
                        onClick={() => handleMove(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 text-slate-600 hover:text-slate-900 bg-white disabled:opacity-30 rounded-lg border border-slate-200 shadow-2xs"
                        title="انتقال به بالا"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMove(idx, 'down')}
                        disabled={idx === systems.length - 1}
                        className="p-1.5 text-slate-600 hover:text-slate-900 bg-white disabled:opacity-30 rounded-lg border border-slate-200 shadow-2xs"
                        title="انتقال به پایین"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:text-black bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs"
                        title="ویرایش"
                      >
                        <Edit2 className="w-3 h-3 text-[#b45309]" />
                        <span>ویرایش</span>
                      </button>

                      {/* Delete */}
                      {deleteConfirmId === item.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="px-2 py-1 text-xs text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors"
                          >
                            تأیید حذف
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded transition-colors"
                          >
                            انصراف
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Edit Form */
            <form onSubmit={handleSaveForm} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    عنوان کامل سامانه *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSystem?.title || ''}
                    onChange={(e) =>
                      setEditingSystem((prev) => ({ ...prev!, title: e.target.value }))
                    }
                    placeholder="مثال: حسابداری واته / SAP Waateh"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#b45309] text-slate-900 text-xs rounded-lg px-3 py-2 focus:outline-none"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    زیرعنوان یا شرح کوتاه *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSystem?.subtitle || ''}
                    onChange={(e) =>
                      setEditingSystem((prev) => ({ ...prev!, subtitle: e.target.value }))
                    }
                    placeholder="مثال: سیستم جامع مدیریت مالی و بودجه"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#b45309] text-slate-900 text-xs rounded-lg px-3 py-2 focus:outline-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    دسته‌بندی سازمانی
                  </label>
                  <input
                    type="text"
                    value={editingSystem?.category || ''}
                    onChange={(e) =>
                      setEditingSystem((prev) => ({ ...prev!, category: e.target.value }))
                    }
                    placeholder="مثال: فرآوری فلزات و بازرگانی"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#b45309] text-slate-900 text-xs rounded-lg px-3 py-2 focus:outline-none"
                  />
                </div>

                {/* Internal Code */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    کد داخلی سیستم
                  </label>
                  <input
                    type="text"
                    value={editingSystem?.internalCode || ''}
                    onChange={(e) =>
                      setEditingSystem((prev) => ({ ...prev!, internalCode: e.target.value }))
                    }
                    placeholder="مثال: FIN-SAP-01"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#b45309] text-slate-900 text-xs rounded-lg px-3 py-2 focus:outline-none font-mono"
                  />
                </div>

                {/* URL */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    آدرس URL واقعی سامانه (وب‌سایت، دامنه سازمانی یا IP شبکه داخلی) *
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-[#b45309] absolute right-3 top-2.5" />
                    <input
                      type="url"
                      required
                      value={editingSystem?.url || ''}
                      onChange={(e) =>
                        setEditingSystem((prev) => ({ ...prev!, url: e.target.value }))
                      }
                      placeholder="https://accounting.waateh.internal یا http://192.168.1.100:8080"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#b45309] text-slate-900 text-xs rounded-lg pr-9 pl-3 py-2 focus:outline-none font-mono dir-ltr text-left"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    آدرس واقعی سیستم خود را وارد کنید. این آدرس در کلیک مستقیم یا در حالت فریم باز خواهد شد.
                  </p>
                </div>

                {/* Health Check URL */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    آدرس اختصاصی پایش وضعیت (اختیاری Health Check / Ping)
                  </label>
                  <input
                    type="text"
                    value={editingSystem?.healthCheckUrl || ''}
                    onChange={(e) =>
                      setEditingSystem((prev) => ({ ...prev!, healthCheckUrl: e.target.value }))
                    }
                    placeholder="مثال: https://accounting.waateh.internal/health (در صورت خالی بودن، آدرس اصلی بررسی می‌شود)"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#b45309] text-slate-900 text-xs rounded-lg px-3 py-2 focus:outline-none font-mono dir-ltr text-left"
                  />
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    آیکون سامانه
                  </label>
                  <select
                    value={editingSystem?.icon || 'network'}
                    onChange={(e) =>
                      setEditingSystem((prev) => ({ ...prev!, icon: e.target.value as any }))
                    }
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#b45309] text-slate-900 text-xs rounded-lg px-3 py-2 focus:outline-none"
                  >
                    <option value="calculator">حسابداری و مالی (ماشین‌حساب)</option>
                    <option value="copper">متالورژی و مس (لایه‌های فلزی)</option>
                    <option value="warehouse">انبارداری و لجستیک (سوله انبار)</option>
                    <option value="chiller">تأسیسات و چیلر صنعتی (فشارسنج)</option>
                    <option value="analytics">نمودارها و تحلیل‌ها (گزارشات)</option>
                    <option value="shield">امنیت و کنترل دسترسی (سپر امنیتی)</option>
                    <option value="terminal">کنسول مدیریتی و سرور (ترمینال)</option>
                    <option value="network">شبکه و زیرساخت (شبکه عمومی)</option>
                  </select>
                </div>

                {/* Embed Mode */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    حالت نمایش پیش‌فرض
                  </label>
                  <select
                    value={editingSystem?.embedMode || 'auto'}
                    onChange={(e) =>
                      setEditingSystem((prev) => ({ ...prev!, embedMode: e.target.value as EmbedMode }))
                    }
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#b45309] text-slate-900 text-xs rounded-lg px-3 py-2 focus:outline-none"
                  >
                    <option value="auto">هوشمند (نمایش در پرتال با قابلیت باز کردن برگه جدید)</option>
                    <option value="iframe">فقط تمام‌صفحه داخلی پرتال (Iframe)</option>
                    <option value="new_tab">مستقیماً در برگه جدید مرورگر</option>
                  </select>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    شرح و توضیحات عملکردی
                  </label>
                  <textarea
                    rows={3}
                    value={editingSystem?.description || ''}
                    onChange={(e) =>
                      setEditingSystem((prev) => ({ ...prev!, description: e.target.value }))
                    }
                    placeholder="شرح مختصری از امکانات و کاربرد سامانه در تشکیلات سازمانی واته..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#b45309] text-slate-900 text-xs rounded-lg px-3 py-2 focus:outline-none leading-relaxed"
                  />
                </div>

              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('list');
                    setEditingSystem(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors shadow-2xs"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#b45309] to-[#d97706] hover:from-[#c25e0a] hover:to-[#e58e37] rounded-lg shadow-sm transition-colors"
                >
                  ذخیره اطلاعات سامانه
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
