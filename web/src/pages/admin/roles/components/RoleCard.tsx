import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldAlert, User, MoreVertical, Key, Trash2, Edit } from 'lucide-react';
import { Role } from '../../../../types/role.types';

interface RoleCardProps {
  role: Role;
  onEdit: (role: Role) => void;
  onConfigPerms: (role: Role) => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
  }
};

export const RoleIcon = ({ code }: { code: string }) => {
  if (code === 'ROLE_ADMIN') return <ShieldAlert size={24} className="text-red-500" />;
  if (code === 'ROLE_MANAGER') return <Shield size={24} className="text-blue-500" />;
  if (code === 'ROLE_STAFF') return <User size={24} className="text-green-500" />;
  return <Shield size={24} className="text-gray-500" />;
};

export function RoleCard({ role, onEdit, onConfigPerms }: RoleCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <motion.div 
      variants={itemVariants}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow group relative"
    >
      {/* Card Header */}
      <div className="p-6 border-b border-gray-50 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <RoleIcon code={role.code} />
          </div>
          <div>
            <h3 className="font-bold text-[#060606] text-lg leading-tight">{role.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                {role.code}
              </span>
              {role.isDefault && (
                <span className="text-[10px] uppercase font-bold text-[#96a827] bg-[#d7ee46]/20 px-2 py-0.5 rounded-md">
                  Default
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Actions Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="p-2 text-gray-400 hover:text-[#060606] bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <MoreVertical size={18} />
          </button>
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10"
              >
                <div 
                  className="fixed inset-0 z-[-1]" 
                  onClick={() => setIsDropdownOpen(false)}
                />
                <button 
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onEdit(role);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit size={16} /> Chỉnh sửa thông tin
                </button>
                <button 
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onConfigPerms(role);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Key size={16} /> Cấu hình quyền hạn
                </button>
                
                {!role.isDefault && (
                  <>
                    <div className="h-px bg-gray-100 my-1" />
                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                      <Trash2 size={16} /> Xóa Role này
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 flex-1 flex flex-col">
        <p className="text-gray-500 text-sm leading-relaxed flex-1">
          {role.description}
        </p>
        
        <div className="mt-6 flex flex-wrap gap-2">
          <div className="bg-gray-50 border border-gray-200 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Key size={14} className="text-gray-400" />
            {role.permissions?.length || 0} Permissions
          </div>
        </div>
      </div>
      
      {/* Card Footer */}
      <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400">Created recently</span>
        <button 
          onClick={() => onConfigPerms(role)}
          className="text-sm font-bold text-[#060606] hover:text-[#96a827] flex items-center gap-1 transition-colors"
        >
          Cấu hình quyền <span className="text-lg leading-none">→</span>
        </button>
      </div>
    </motion.div>
  );
}
