import React, { useState } from "react";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { AuthInput } from "../AuthInput";
import { SubmitButton, RequestStatus } from "../SubmitButton";
import { ViewState } from "../LoginForm";

interface ResetStepProps {
  changeView: (view: ViewState) => void;
}

export function ResetStep({ changeView }: ResetStepProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<RequestStatus>("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) return setStatus("error");

    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
      toast.success("Password changed successfully", {
        style: {
          background: "#062F28",
          color: "#9FE870",
          border: "none"
        }
      });
      setTimeout(() => {
        changeView("login");
      }, 1000);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <AuthInput
        label="New Password"
        type="password"
        placeholder="Enter new password"
        icon={<Lock size={16} />}
        value={newPassword}
        onChange={(e) => {
          setNewPassword(e.target.value);
          if (status === "error") setStatus("idle");
        }}
        hasError={status === "error"}
        className="mb-[16px]"
      />

      <AuthInput
        label="Confirm Password"
        type="password"
        placeholder="Re-enter new password"
        icon={<Lock size={16} />}
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          if (status === "error") setStatus("idle");
        }}
        hasError={status === "error"}
        className="mb-[10px]"
      />

      {status === "error" && (
        <p className="text-red-500 text-[11px] mb-[10px] text-center">
          Passwords do not match or are empty.
        </p>
      )}

      <div className="mt-[14px]">
        <SubmitButton status={status} text="Reset Password" />
      </div>
    </form>
  );
}
