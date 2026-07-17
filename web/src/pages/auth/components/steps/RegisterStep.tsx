import React, { useState } from 'react';
import { User, Mail, Phone, Lock } from 'lucide-react';
import { z } from 'zod';
import { AuthInput } from '../AuthInput';
import { SubmitButton, RequestStatus } from '../SubmitButton';
import { ViewState } from '../LoginForm';

import { authService } from '../../../../services/auth.service';

interface RegisterStepProps {
  changeView: (view: ViewState) => void;
}

const registerSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Vui lòng nhập email hợp lệ'),
  phone: z.string().regex(/^(0|\+84)\d{9,10}$/, 'Số điện thoại không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export function RegisterStep({ changeView }: RegisterStepProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationResult = registerSchema.safeParse({ name, email, phone, password });
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      setFieldErrors({
        name: errors.name?.[0],
        email: errors.email?.[0],
        phone: errors.phone?.[0],
        password: errors.password?.[0],
      });
      setStatus('idle');
      return;
    }

    setFieldErrors({});
    setStatus('loading');
    setErrorMessage('');

    try {
      await authService.register({ name, email, phone, password });
      setStatus('success');

      // Auto switch back to login after a delay
      setTimeout(() => {
        changeView('login');
      }, 1500);
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message || 'Có lỗi xảy ra khi đăng ký.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <AuthInput
        label="Họ và Tên"
        type="text"
        placeholder="Nhập họ và tên"
        icon={<User size={16} />}
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: undefined });
          if (status === 'error') setStatus('idle');
        }}
        hasError={!!fieldErrors.name}
        errorMessage={fieldErrors.name}
        className="mb-[12px]"
      />

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
        hasError={!!fieldErrors.email}
        errorMessage={fieldErrors.email}
        className="mb-[12px]"
      />

      <AuthInput
        label="Số điện thoại"
        type="tel"
        placeholder="Nhập số điện thoại"
        icon={<Phone size={16} />}
        value={phone}
        onChange={(e) => {
          setPhone(e.target.value);
          if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: undefined });
          if (status === 'error') setStatus('idle');
        }}
        hasError={!!fieldErrors.phone}
        errorMessage={fieldErrors.phone}
        className="mb-[12px]"
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
        className="mb-[20px]"
      />

      {status === 'error' && (
        <p className="text-red-500 text-[11px] mb-[10px] text-center animate-in fade-in slide-in-from-top-1">
          {errorMessage}
        </p>
      )}

      {status === 'success' && (
        <p className="text-green-500 text-[11px] mb-[10px] text-center animate-in fade-in slide-in-from-top-1">
          Đăng ký thành công! Đang chuyển về trang đăng nhập...
        </p>
      )}

      <SubmitButton status={status} text="Đăng ký tài khoản" />

      <div className="mt-[20px] text-center">
        <p className="text-[#7B7B7B] text-[12px]">
          Đã có tài khoản?{' '}
          <button
            type="button"
            onClick={() => changeView('login')}
            className="text-[#9FE870] font-medium hover:text-[#062F28] hover:underline transition-colors"
          >
            Đăng nhập ngay
          </button>
        </p>
      </div>
    </form>
  );
}
