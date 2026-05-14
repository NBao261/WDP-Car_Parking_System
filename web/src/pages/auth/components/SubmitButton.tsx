import { Loader2, Check } from "lucide-react";

export type RequestStatus = "idle" | "loading" | "success" | "error";

interface SubmitButtonProps {
  status: RequestStatus;
  text: string;
}

export function SubmitButton({ status, text }: SubmitButtonProps) {
  const isDisabled = status === "loading" || status === "success";
  
  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={`w-full h-[48px] rounded-[8px] flex items-center justify-center gap-2 transition-all duration-200 ${
        isDisabled
          ? "opacity-70 cursor-not-allowed bg-[#9FE870] text-[#062F28]"
          : "bg-[#9FE870] text-[#062F28] hover:bg-[#062F28] hover:text-[#9FE870] active:scale-[0.98]"
      }`}
    >
      {status === "loading" ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          <span className="text-[14px] font-bold">Processing...</span>
        </>
      ) : status === "success" ? (
        <>
          <Check size={20} className="text-[#062F28]" />
          <span className="text-[14px] font-bold">Success</span>
        </>
      ) : (
        <span className="text-[14px] font-bold">{text}</span>
      )}
    </button>
  );
}
