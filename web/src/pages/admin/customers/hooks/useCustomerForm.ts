import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { User as UserType } from '@/types/user.types';
import { userService } from '@/services/user.service';
import { UserRole } from '@shared/types';

export function useCustomerForm(
  isOpen: boolean,
  user: UserType | undefined,
  onSuccess: () => void,
  onClose: () => void
) {
  const isEdit = !!user;

  const [basicData, setBasicData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setError('');
      if (user) {
        setBasicData({ name: user.name, email: user.email, phone: user.phone || '', password: '' });
      } else {
        setBasicData({ name: '', email: '', phone: '', password: '' });
      }
    }
  }, [isOpen, user]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      if (isEdit && user) {
        await userService.updateUser(user._id, {
          name: basicData.name,
          phone: basicData.phone,
        });
        toast.success(`Cập nhật thông tin khách hàng "${basicData.name}" thành công.`);
      } else {
        await userService.createUser({
          name: basicData.name,
          email: basicData.email,
          phone: basicData.phone,
          password: basicData.password,
          role: UserRole.DRIVER, // Mặc định tạo khách hàng
        });
        toast.success(`Tạo khách hàng "${basicData.name}" thành công.`);
      }

      onSuccess();
      setTimeout(() => onClose(), 200);
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = (): boolean => {
    const hasBase = !!basicData.name.trim() && !!basicData.phone.trim();
    if (!isEdit)
      return hasBase && !!basicData.email.trim() && basicData.password.trim().length >= 6;
    return hasBase;
  };

  return {
    isEdit,
    basicData,
    setBasicData,
    isSubmitting,
    error,
    handleSubmit,
    canSubmit,
  };
}
