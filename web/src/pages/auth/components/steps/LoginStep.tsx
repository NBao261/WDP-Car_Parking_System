import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { z } from 'zod';
import { useAuthStore } from '../../../../store';
import { UserRole } from '../../../../../../shared/types';
import { authService } from '../../../../services/auth.service';
import { userService } from '../../../../services/user.service';
import { AssignedFacility } from '../../../../types/user.types';
import { AuthInput } from '../AuthInput';
import { SubmitButton, RequestStatus } from '../SubmitButton';
import { ViewState } from '../LoginForm';

interface LoginStepProps {
  changeView: (view: ViewState) => void;
}

const loginSchema = z.object({
  email: z.string().min(1, 'Email không được để trống').email('Vui lòng nhập email hợp lệ'),
  password: z
    .string()
    .min(1, 'Mật khẩu không được để trống')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export function LoginStep({ changeView }: LoginStepProps) {
  const { setAuth, setAssignedFacilities } = useAuthStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationResult = loginSchema.safeParse({ email: email.trim(), password });
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      setFieldErrors({
        email: errors.email?.[0],
        password: errors.password?.[0],
      });
      setStatus('idle');
      return;
    }

    setFieldErrors({});
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await authService.login(email.trim(), password);
      const { user, tokens } = response.data;

      // 1. Lưu auth vào store (không có assignedFacilities chưa)
      setAuth({ ...user, assignedFacilities: [] }, tokens.accessToken, tokens.refreshToken);

      // 2. Fetch profile đầy đủ để lấy assignedFacilities populated
      //    Không block navigation nếu thất bại — sẽ có fallback trong useCheckinFlow
      try {
        const profileRes = await userService.getMe();
        const facilities = (profileRes.data.assignedFacilities ?? []) as AssignedFacility[];
        setAssignedFacilities(facilities);
      } catch {
        // Không critical — Staff flow có thể retry sau
      }

      setStatus('success');

      // 3. Điều hướng sau animation success
      setTimeout(() => {
        if (user.role === UserRole.ADMIN) {
          navigate('/admin');
        } else if (user.role === UserRole.MANAGER) {
          navigate('/manager');
        } else if (user.role === UserRole.STAFF) {
          navigate('/staff/shift-selection');
        } else if (user.role === UserRole.DRIVER) {
          navigate('/driver');
        } else {
          navigate('/unauthorized');
        }
      }, 800);
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message || 'Email hoặc mật khẩu không đúng.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <AuthInput
        label="Email"
        type="email"
        placeholder="Nhập email"
        icon={<Mail size={16} />}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
          if (status === 'error') setStatus('idle');
        }}
        hasError={!!fieldErrors.email || status === 'error'}
        errorMessage={fieldErrors.email}
        className="mb-[16px]"
      />

      <AuthInput
        label="Mật khẩu"
        type="password"
        placeholder="Nhập mật khẩu"
        icon={<Lock size={16} />}
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
          if (status === 'error') setStatus('idle');
        }}
        hasError={!!fieldErrors.password || status === 'error'}
        errorMessage={fieldErrors.password}
        className="mb-[10px]"
      />

      {status === 'error' && (
        <p className="text-red-500 text-[11px] mb-[10px] text-center animate-in fade-in slide-in-from-top-1">
          {errorMessage}
        </p>
      )}

      <div className="flex justify-end mb-[24px]">
        <button
          type="button"
          onClick={() => changeView('forgot')}
          className="text-[#9FE870] hover:text-[#062F28] text-[12px] font-medium hover:underline transition-colors"
        >
          Quên mật khẩu
        </button>
      </div>

      <SubmitButton status={status} text="Đăng nhập" />

      <div className="relative flex items-center my-[20px]">
        <div className="flex-grow border-t border-[#E7E7F1]"></div>
        <span className="flex-shrink-0 mx-4 text-[#7B7B7B] text-[12px] bg-white px-2">or</span>
        <div className="flex-grow border-t border-[#E7E7F1]"></div>
      </div>

      <div className="text-center mb-[16px]">
        <button
          type="button"
          onClick={() => changeView('register')}
          className="w-full py-[12px] border border-[#E7E7F1] rounded-[8px] text-[#062F28] font-semibold text-[14px] hover:bg-[#F5F5F5] transition-colors"
        >
          Tạo tài khoản mới
        </button>
      </div>

      <div className="mt-2 text-center flex flex-col gap-1">
        <p className="text-[#7B7B7B] text-[11px]">
          Gặp sự cố khi đăng nhập?{' '}
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="underline hover:text-[#062F28]"
          >
            Liên hệ quản trị viên.
          </a>
        </p>
        <p className="text-[#7B7B7B] text-[10px] opacity-60">
          © 2026 LYNC Park. Bảo lưu mọi quyền.
        </p>
      </div>
    </form>
  );
}
