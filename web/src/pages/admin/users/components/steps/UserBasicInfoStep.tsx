import { User, Mail, Phone, Shield } from 'lucide-react';

interface BasicData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface UserBasicInfoStepProps {
  isEdit: boolean;
  basicData: BasicData;
  onChange: (updater: (prev: BasicData) => BasicData) => void;
}

const inputClass =
  'w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9FE870] focus:bg-white transition-all';

/**
 * Step 1 of UserFormModal: collects name, email (create only), phone, password (create only).
 * Animation handled by parent UserFormModal motion.div wrapper.
 */
export function UserBasicInfoStep({ isEdit, basicData, onChange }: UserBasicInfoStepProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Họ và tên <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            required
            value={basicData.name}
            onChange={(e) => onChange((p) => ({ ...p, name: e.target.value }))}
            className={inputClass}
            placeholder="Nhập họ và tên..."
          />
        </div>
      </div>

      {/* Email — editable only on create */}
      {!isEdit ? (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Email đăng nhập <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              required
              value={basicData.email}
              onChange={(e) => onChange((p) => ({ ...p, email: e.target.value }))}
              className={inputClass}
              placeholder="example@company.com"
            />
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Email đăng nhập
          </label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="email"
              disabled
              value={basicData.email}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-400 cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Email không thể thay đổi sau khi tạo.</p>
        </div>
      )}

      {/* Phone */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Số điện thoại <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="tel"
            required
            value={basicData.phone}
            onChange={(e) => onChange((p) => ({ ...p, phone: e.target.value }))}
            className={inputClass}
            placeholder="09xx xxx xxx"
          />
        </div>
      </div>

      {/* Password — create only */}
      {!isEdit && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Mật khẩu khởi tạo <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Shield size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              required
              minLength={6}
              value={basicData.password}
              onChange={(e) => onChange((p) => ({ ...p, password: e.target.value }))}
              className={inputClass}
              placeholder="Tối thiểu 6 ký tự"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Mật khẩu cấp lần đầu cho nhân viên.</p>
        </div>
      )}
    </div>
  );
}
