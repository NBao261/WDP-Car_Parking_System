import React, { useState } from "react";
import { Mail } from "lucide-react";
import { AuthInput } from "../AuthInput";
import { SubmitButton, RequestStatus } from "../SubmitButton";
import { ViewState } from "../LoginForm";

interface ForgotStepProps {
  changeView: (view: ViewState) => void;
  email: string;
  setEmail: (email: string) => void;
}

export function ForgotStep({ changeView, email, setEmail }: ForgotStepProps) {
  const [status, setStatus] = useState<RequestStatus>("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setStatus("error");

    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
      setTimeout(() => changeView("otp"), 600);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <AuthInput
        label="Địa chỉ Email"
        type="email"
        placeholder="Nhập email"
        icon={<Mail size={16} />}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (status === "error") setStatus("idle");
        }}
        hasError={status === "error"}
        className="mb-[24px]"
      />

      <SubmitButton status={status} text="Gửi mã" />

      <button
        type="button"
        onClick={() => changeView("login")}
        className="mt-[24px] text-[#7B7B7B] text-[12px] font-medium hover:text-[#062F28] hover:underline transition-colors text-center"
      >
        Quay lại đăng nhập
      </button>
    </form>
  );
}
