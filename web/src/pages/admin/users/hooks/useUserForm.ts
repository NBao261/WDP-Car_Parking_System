import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { UserRole } from '@shared/types';
import { User as UserType } from '@/types/user.types';
import { userService } from '@/services/user.service';
import { roleService } from '@/services/role.service';

interface BasicData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

type Step = 1 | 2 | 3;

/**
 * Manages all state and logic for the multi-step UserFormModal.
 * Separates business logic from presentation.
 */
export function useUserForm(
  isOpen: boolean,
  user: UserType | undefined,
  onSuccess: () => void,
  onClose: () => void,
) {
  const isEdit = !!user;
  const [currentStep, setCurrentStep] = useState<Step>(1);

  const [basicData, setBasicData] = useState<BasicData>({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.STAFF);
  const [customPerms, setCustomPerms] = useState<Set<string>>(new Set());
  const [isLoadingPerms, setIsLoadingPerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadUserPermissions = useCallback(async (userId: string) => {
    setIsLoadingPerms(true);
    try {
      const res = await roleService.getUserPermissions(userId);
      setCustomPerms(new Set(res.data.customPermissions || []));
    } catch {
      setCustomPerms(new Set());
    } finally {
      setIsLoadingPerms(false);
    }
  }, []);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setError('');
      if (user) {
        setBasicData({ name: user.name, email: user.email, phone: user.phone, password: '' });
        setSelectedRole(user.role as UserRole);
        loadUserPermissions(user._id);
      } else {
        setBasicData({ name: '', email: '', phone: '', password: '' });
        setSelectedRole(UserRole.STAFF);
        setCustomPerms(new Set());
      }
    }
  }, [isOpen, user, loadUserPermissions]);

  const handleTogglePerm = (permId: string) => {
    const next = new Set(customPerms);
    if (next.has(permId)) next.delete(permId);
    else next.add(permId);
    setCustomPerms(next);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      if (isEdit && user) {
        await userService.updateUser(user._id, {
          name: basicData.name,
          phone: basicData.phone,
        });
        await roleService.assignRole({
          userId: user._id,
          roleCode: selectedRole,
          customPermissions: Array.from(customPerms),
        });
        toast.success(`Cập nhật tài khoản "${basicData.name}" thành công.`);
      } else {
        await userService.createUser({
          name: basicData.name,
          email: basicData.email,
          phone: basicData.phone,
          password: basicData.password,
          role: selectedRole,
        });
        toast.success(`Tạo tài khoản "${basicData.name}" thành công.`);
      }
      onSuccess();
      setTimeout(() => onClose(), 200);
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canGoNext = (): boolean => {
    if (currentStep === 1) {
      const hasBase = !!basicData.name.trim() && !!basicData.phone.trim();
      if (!isEdit) return hasBase && !!basicData.email.trim() && basicData.password.trim().length >= 6;
      return hasBase;
    }
    return true;
  };

  const totalSteps = isEdit ? 3 : 2;

  const steps = isEdit
    ? [
        { id: 1, label: 'Thông tin' },
        { id: 2, label: 'Vai trò' },
        { id: 3, label: 'Quyền bổ sung' },
      ]
    : [
        { id: 1, label: 'Thông tin' },
        { id: 2, label: 'Vai trò' },
      ];

  return {
    isEdit,
    currentStep,
    setCurrentStep,
    basicData,
    setBasicData,
    selectedRole,
    setSelectedRole,
    customPerms,
    handleTogglePerm,
    isLoadingPerms,
    isSubmitting,
    error,
    handleSubmit,
    canGoNext,
    totalSteps,
    steps,
  };
}
