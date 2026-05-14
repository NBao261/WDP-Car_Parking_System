import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock } from "lucide-react";
import { useAuthStore } from "../../../../store";
import { UserRole } from "../../../../../../shared/types";
import { AuthInput } from "../AuthInput";
import { SubmitButton, RequestStatus } from "../SubmitButton";
import { ViewState } from "../LoginForm";

interface LoginStepProps {
  changeView: (view: ViewState) => void;
}

export function LoginStep({ changeView }: LoginStepProps) {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<RequestStatus>("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return setStatus("error");

    setStatus("loading");
    setTimeout(() => {
      if (username === "admin" && password === "password") {
        setStatus("success");
        setTimeout(() => {
          setAuth(
            { id: '1', name: 'Super Admin', email: 'admin@parkmaster.com', role: UserRole.ADMIN },
            'mock-jwt-token'
          );
          navigate('/admin');
        }, 1000);
      } else {
        setStatus("error");
      }
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <AuthInput
        label="Username"
        type="text"
        placeholder="Enter your username"
        icon={<User size={16} />}
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
          if (status === "error") setStatus("idle");
        }}
        hasError={status === "error"}
        className="mb-[16px]"
      />

      <AuthInput
        label="Password"
        type="password"
        placeholder="Enter your password"
        icon={<Lock size={16} />}
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (status === "error") setStatus("idle");
        }}
        hasError={status === "error"}
        className="mb-[10px]"
      />

      {status === "error" && (
        <p className="text-red-500 text-[11px] mb-[10px] text-center">
          Incorrect username or password. (Hint: admin / password)
        </p>
      )}

      <div className="flex justify-end mb-[24px]">
        <button
          type="button"
          onClick={() => changeView("forgot")}
          className="text-[#9FE870] hover:text-[#062F28] text-[12px] font-medium hover:underline transition-colors"
        >
          Forgot password?
        </button>
      </div>

      <SubmitButton status={status} text="Sign In" />

      <div className="relative flex items-center my-[20px]">
        <div className="flex-grow border-t border-[#E7E7F1]"></div>
        <span className="flex-shrink-0 mx-4 text-[#7B7B7B] text-[12px] bg-white px-2">or</span>
        <div className="flex-grow border-t border-[#E7E7F1]"></div>
      </div>

      <div className="mt-2 text-center flex flex-col gap-1">
        <p className="text-[#7B7B7B] text-[11px]">
          Having trouble log in? <a href="#" onClick={(e) => e.preventDefault()} className="underline hover:text-[#062F28]">Contact your administrator.</a>
        </p>
        <p className="text-[#7B7B7B] text-[10px] opacity-60">
          © 2026 LYNC Park. All rights reserved.
        </p>
      </div>
    </form>
  );
}
