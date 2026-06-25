import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Settings,
  Save,
  RefreshCw,
  Loader2,
  Eye,
  EyeOff,
  Shield,
  Bell,
  Globe,
  Database,
  Clock,
  Lock,
} from 'lucide-react';
import { configService, SystemConfig } from '../../../services/config.service';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
};

// ── Key → group mapping ──────────────────────────────
const CONFIG_GROUPS: {
  key: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  keys: string[];
}[] = [
  {
    key: 'general',
    icon: <Globe size={18} />,
    label: 'Thông số chung',
    description: 'Tên hệ thống, múi giờ, đơn vị tiền tệ',
    keys: ['system_name', 'timezone', 'currency', 'language', 'items_per_page'],
  },
  {
    key: 'security',
    icon: <Shield size={18} />,
    label: 'Bảo mật tài khoản',
    description: 'Chính sách mật khẩu, khóa tài khoản, session',
    keys: [
      'min_password_length',
      'max_login_attempts',
      'lockout_duration_minutes',
      'session_timeout_minutes',
      'require_special_char',
    ],
  },
  {
    key: 'notification',
    icon: <Bell size={18} />,
    label: 'Cấu hình thông báo',
    description: 'Email/SMS, bật tắt từng loại thông báo',
    keys: [
      'email_notifications',
      'sms_notifications',
      'notify_on_create_account',
      'notify_on_reset_password',
    ],
  },
  {
    key: 'business',
    icon: <Clock size={18} />,
    label: 'Quy tắc vận hành',
    description: 'Phí mất thẻ, thời gian giữ chỗ tối đa',
    keys: ['lost_card_fee', 'max_reservation_hours', 'grace_period_minutes'],
  },
];

// ── Single Config Row ──────────────────────────────────
interface ConfigRowProps {
  config: SystemConfig;
  onSave: (key: string, value: any) => Promise<void>;
}

function ConfigRow({ config, onSave }: ConfigRowProps) {
  const [editValue, setEditValue] = useState(String(config.value));
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isBool = typeof config.value === 'boolean';
  const isNumber = typeof config.value === 'number';
  const isSecret =
    config.key.toLowerCase().includes('secret') || config.key.toLowerCase().includes('password');

  const handleChange = (val: string) => {
    setEditValue(val);
    setIsDirty(val !== String(config.value));
  };

  const handleToggle = async (checked: boolean) => {
    setIsSaving(true);
    try {
      await onSave(config.key, checked);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const parsed = isNumber ? Number(editValue) : editValue;
      await onSave(config.key, parsed);
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-gray-50 last:border-0 group">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#060606]">
          {config.key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
        </p>
        {config.description && (
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{config.description}</p>
        )}
        <p className="text-xs text-gray-300 font-mono mt-0.5">{config.key}</p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {isBool ? (
          /* Toggle switch */
          <button
            onClick={() => handleToggle(!config.value)}
            disabled={isSaving}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              config.value ? 'bg-[#d7ee46]' : 'bg-gray-200'
            } disabled:opacity-60`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                config.value ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
            {isSaving && (
              <Loader2 size={12} className="absolute right-1 top-1.5 animate-spin text-gray-400" />
            )}
          </button>
        ) : (
          /* Text / Number input */
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type={isNumber ? 'number' : isSecret && !showPassword ? 'password' : 'text'}
                value={editValue}
                onChange={(e) => handleChange(e.target.value)}
                className={`w-44 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d7ee46] transition-all ${
                  isDirty ? 'border-[#d7ee46] bg-[#d7ee46]/5' : 'border-gray-200 bg-gray-50'
                }`}
              />
              {isSecret && (
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              )}
            </div>
            {isDirty && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#d7ee46] text-[#060606] text-xs font-bold rounded-lg hover:bg-[#c4dc32] transition-colors disabled:opacity-60"
              >
                {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                Lưu
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────
export default function ConfigPage() {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConfigs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await configService.getAll();
      setConfigs(res.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải cấu hình hệ thống');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const handleSave = async (key: string, value: any) => {
    try {
      const res = await configService.update(key, value);
      setConfigs((prev) => prev.map((c) => (c.key === key ? res.data : c)));
      toast.success(`Đã lưu cấu hình "${key}"`);
    } catch (err: any) {
      toast.error(err.message || 'Lưu thất bại');
      throw err;
    }
  };

  // Group configs by predefined groups
  const getConfigsForGroup = (keys: string[]) =>
    keys.map((k) => configs.find((c) => c.key === k)).filter(Boolean) as SystemConfig[];

  const ungroupedKeys = CONFIG_GROUPS.flatMap((g) => g.keys);
  const ungroupedConfigs = configs.filter((c) => !ungroupedKeys.includes(c.key));

  return (
    <motion.div
      className="space-y-6 max-w-4xl mx-auto pb-12"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-[#060606]">Cấu hình Hệ thống</h1>
          <p className="text-gray-500 text-sm mt-1">
            Quản lý các thông số hoạt động của Smart Parking
          </p>
        </div>
        <button
          onClick={fetchConfigs}
          className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors self-start"
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </motion.div>

      {/* Config groups */}
      {isLoading ? (
        <motion.div variants={itemVariants} className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 animate-pulse"
            >
              <div className="h-4 bg-gray-100 rounded w-1/4" />
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex justify-between items-center py-3">
                    <div className="space-y-1 flex-1">
                      <div className="h-3.5 bg-gray-100 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                    <div className="h-8 w-32 bg-gray-100 rounded-lg ml-4" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      ) : configs.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl border border-gray-100 py-20 text-center"
        >
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database size={28} className="text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">Chưa có cấu hình nào</p>
          <p className="text-gray-400 text-sm mt-1">
            Cấu hình sẽ được seed tự động khi server khởi động lần đầu
          </p>
        </motion.div>
      ) : (
        <>
          {CONFIG_GROUPS.map((group) => {
            const groupConfigs = getConfigsForGroup(group.keys);
            if (groupConfigs.length === 0) return null;
            return (
              <motion.div
                key={group.key}
                variants={itemVariants}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Group header */}
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#d7ee46]/20 text-[#6a7a0a] flex items-center justify-center">
                    {group.icon}
                  </div>
                  <div>
                    <h2 className="font-bold text-[#060606] text-sm">{group.label}</h2>
                    <p className="text-xs text-gray-400">{group.description}</p>
                  </div>
                </div>

                {/* Config rows */}
                <div className="px-6">
                  {groupConfigs.map((config) => (
                    <ConfigRow key={config.key} config={config} onSave={handleSave} />
                  ))}
                </div>
              </motion.div>
            );
          })}

          {/* Ungrouped configs */}
          {ungroupedConfigs.length > 0 && (
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center">
                  <Settings size={18} />
                </div>
                <div>
                  <h2 className="font-bold text-[#060606] text-sm">Cấu hình khác</h2>
                  <p className="text-xs text-gray-400">Các thông số bổ sung</p>
                </div>
              </div>
              <div className="px-6">
                {ungroupedConfigs.map((config) => (
                  <ConfigRow key={config.key} config={config} onSave={handleSave} />
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Info box */}
      <motion.div
        variants={itemVariants}
        className="bg-[#060606] rounded-2xl p-6 flex items-start gap-4"
      >
        <div className="w-10 h-10 rounded-xl bg-[#d7ee46]/20 flex items-center justify-center flex-shrink-0">
          <Lock size={20} className="text-[#d7ee46]" />
        </div>
        <div>
          <h3 className="font-bold text-white mb-1">Audit Log</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Mọi thay đổi cấu hình đều được ghi lại trong Audit Log kèm người thực hiện và thời gian.
            Chỉ Admin mới có quyền thay đổi cấu hình hệ thống.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
