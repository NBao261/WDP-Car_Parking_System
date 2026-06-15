import React, { useState } from "react";
import { OTPInput } from "../OTPInput";
import { SubmitButton, RequestStatus } from "../SubmitButton";
import { ViewState } from "../LoginForm";

interface OtpStepProps {
  changeView: (view: ViewState) => void;
}

export function OtpStep({ changeView }: OtpStepProps) {
  const [otp, setOtp] = useState("000000"); // Pre-filled for demo
  const [status, setStatus] = useState<RequestStatus>("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== "000000") return setStatus("error");

    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
      setTimeout(() => changeView("reset"), 600);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <label className="text-[12px] font-semibold text-[#062F28] mb-[6px]">
        Mã xác thực
      </label>
      <OTPInput
        value={otp}
        onChange={(val) => {
          setOtp(val);
          if (status === "error") setStatus("idle");
        }}
        hasError={status === "error"}
      />

      <p className="text-[12px] text-[#7B7B7B] text-center mt-3 mb-1">
        Nhập OTP: <span className="font-mono font-bold">000000</span>
      </p>

      {status === "error" && (
        <p className="text-red-500 text-[11px] mb-[4px] mt-1 text-center">
          Mã OTP không hợp lệ.
        </p>
      )}

      <div className="mt-[20px] mb-[24px]">
        <SubmitButton status={status} text="Xác thực" />
      </div>

      <button
        type="button"
        className="text-[#9FE870] hover:text-[#062F28] text-[12px] font-medium hover:underline transition-colors text-center"
      >
        Không nhận được mã? Gửi lại
      </button>
    </form>
  );
}
