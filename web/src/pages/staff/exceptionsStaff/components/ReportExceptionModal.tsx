import { useState } from "react";
import { X, ChevronLeft, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  exceptionService,
  ExceptionType,
} from "../../../../services/exception.service";
import SessionLookupStep, { SelectedSessionInfo } from "./SessionLookupStep";
import ExceptionTypeStep from "./ExceptionTypeStep";
import ExceptionDescriptionStep from "./ExceptionDescriptionStep";

interface ReportExceptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialPlate?: string;
}

type Step = 1 | 2 | 3;

const STEP_LABELS = ["Tìm xe", "Loại ngoại lệ", "Mô tả & Xác nhận"];

export default function ReportExceptionModal({
  isOpen,
  onClose,
  onSuccess,
  initialPlate,
}: ReportExceptionModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [selectedSession, setSelectedSession] = useState<SelectedSessionInfo | null>(null);
  const [selectedType, setSelectedType] = useState<ExceptionType | null>(null);
  const [description, setDescription] = useState("");
  const [surcharge, setSurcharge] = useState(50000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    setStep(1);
    setSelectedSession(null);
    setSelectedType(null);
    setDescription("");
    setSurcharge(50000);
    setIsSubmitting(false);
    setSubmitted(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSessionSelected = (session: SelectedSessionInfo) => {
    setSelectedSession(session);
    setStep(2);
  };

  const handleTypeSelected = (type: ExceptionType) => {
    setSelectedType(type);
  };

  const canProceedStep2 = !!selectedType;
  const canProceedStep3 = description.trim().length >= 20;

  const handleSubmit = async () => {
    if (!selectedSession || !selectedType) return;
    setIsSubmitting(true);
    try {
      const payload: any = {
        sessionId: selectedSession.id,
        type: selectedType,
        description: description.trim(),
      };
      if (selectedType === ExceptionType.LOST_CARD && surcharge > 0) {
        payload.surcharge = surcharge;
      }

      const res = await exceptionService.createException(payload);
      if (res.success) {
        setSubmitted(true);
        toast.success("Ngoại lệ đã được báo cáo thành công!");
        onSuccess();
      } else {
        throw new Error(res.message || "Tạo ngoại lệ thất bại.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal panel */}
      <div className="relative z-10 w-full max-w-[520px] mx-4 bg-white rounded-[20px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#e8e9e8] flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-[17px] font-bold text-[#060606]">Báo cáo Ngoại lệ</h2>
            <p className="text-[12px] text-[#6b6b6b] mt-0.5">Bước {step} / 3</p>
          </div>
          <button
            onClick={handleClose}
            className="text-[#6b6b6b] hover:text-black p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 pt-4 pb-2 shrink-0">
          <div className="flex items-center gap-0">
            {STEP_LABELS.map((label, idx) => {
              const stepNum = (idx + 1) as Step;
              const isDone = step > stepNum;
              const isActive = step === stepNum;
              return (
                <div key={stepNum} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                        isDone
                          ? "bg-[#060606] text-white"
                          : isActive
                          ? "bg-[#d7ee46] text-[#060606] border-2 border-[#060606]"
                          : "bg-[#f0f0f0] text-[#999] border border-[#e8e9e8]"
                      }`}
                    >
                      {isDone ? "✓" : stepNum}
                    </div>
                    <span
                      className={`text-[10px] font-medium whitespace-nowrap ${
                        isActive ? "text-[#060606]" : "text-[#999]"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {idx < STEP_LABELS.length - 1 && (
                    <div
                      className={`h-[2px] flex-1 mx-2 mt-[-10px] rounded transition-all ${
                        isDone ? "bg-[#060606]" : "bg-[#e8e9e8]"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {submitted ? (
            // Success state
            <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#e8f7f0] flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-[#1d7a4a]" />
              </div>
              <div>
                <p className="text-[16px] font-bold text-[#060606]">Đã gửi báo cáo thành công!</p>
                <p className="text-[13px] text-[#6b6b6b] mt-1">
                  Ngoại lệ đã được ghi nhận và đang chờ xử lý.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="mt-2 px-6 py-2.5 bg-[#060606] text-white font-semibold rounded-[10px] hover:opacity-80 transition-all text-[13px]"
              >
                Đóng
              </button>
            </div>
          ) : (
            <>
              {step === 1 && (
                <SessionLookupStep
                  onSessionSelected={handleSessionSelected}
                  initialPlate={initialPlate}
                />
              )}
              {step === 2 && selectedSession && (
                <ExceptionTypeStep
                  session={selectedSession}
                  selectedType={selectedType}
                  onSelectType={handleTypeSelected}
                />
              )}
              {step === 3 && selectedSession && selectedType && (
                <ExceptionDescriptionStep
                  session={selectedSession}
                  exceptionType={selectedType}
                  description={description}
                  surcharge={surcharge}
                  onDescriptionChange={setDescription}
                  onSurchargeChange={setSurcharge}
                />
              )}
            </>
          )}
        </div>

        {/* Footer navigation */}
        {!submitted && (
          <div className="px-6 py-4 border-t border-[#e8e9e8] flex gap-3 shrink-0 bg-white">
            {step > 1 ? (
              <button
                onClick={() => setStep((s) => (s - 1) as Step)}
                className="flex items-center gap-1.5 px-4 py-2.5 border border-[#e8e9e8] rounded-[10px] text-[13px] font-medium text-[#060606] hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Quay lại
              </button>
            ) : (
              <button
                onClick={handleClose}
                className="px-4 py-2.5 border border-[#e8e9e8] rounded-[10px] text-[13px] font-medium text-[#060606] hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
            )}

            {step === 2 && (
              <button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="flex-1 h-10 bg-[#060606] text-white font-semibold text-[13px] rounded-[10px] hover:opacity-80 transition-all disabled:opacity-30"
              >
                Tiếp theo →
              </button>
            )}

            {step === 3 && (
              <button
                onClick={handleSubmit}
                disabled={!canProceedStep3 || isSubmitting}
                className="flex-1 h-10 bg-[#060606] text-white font-semibold text-[13px] rounded-[10px] hover:opacity-80 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  "Gửi báo cáo ✓"
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
