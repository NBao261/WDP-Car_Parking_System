import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { paymentService } from '../../../../services/payment.service';
import { X, CreditCard, Wallet, Smartphone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  amount: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  sessionId,
  amount,
}) => {
  const [method, setMethod] = useState<'MoMo' | 'ZaloPay' | 'VNPAY'>('MoMo');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      const res = await paymentService.createIntent({ sessionId, method });
      if (res.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl; // Redirect to payment gateway
      } else {
        toast.error('Không thể tạo phiên thanh toán');
      }
    } catch (error: any) {
      toast.error(error.message || 'Lỗi hệ thống thanh toán');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white font-outfit flex items-center gap-2">
              <CreditCard className="text-[#3b82f6]" /> Thanh Toán Dịch Vụ
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-full transition-colors bg-slate-800/50 hover:bg-slate-700"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="text-center mb-8">
              <p className="text-slate-400 text-sm mb-1">Tổng tiền thanh toán</p>
              <h2 className="text-4xl font-bold text-[#10b981] font-mono">
                {amount.toLocaleString('vi-VN')}₫
              </h2>
            </div>

            <h4 className="text-white font-medium mb-4 text-sm">Chọn phương thức thanh toán:</h4>
            <div className="space-y-3 mb-8">
              {/* MoMo Option */}
              <button
                onClick={() => setMethod('MoMo')}
                className={`w-full flex items-center p-4 rounded-xl border-2 transition-all ${method === 'MoMo' ? 'border-[#a50064] bg-[#a50064]/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}`}
              >
                <div className="w-10 h-10 rounded-full bg-[#a50064] flex items-center justify-center text-white mr-4 shadow-lg">
                  <Smartphone size={20} />
                </div>
                <div className="text-left">
                  <p className="text-white font-bold">Ví MoMo</p>
                  <p className="text-xs text-slate-400">Thanh toán qua ứng dụng MoMo</p>
                </div>
                {method === 'MoMo' && (
                  <div className="ml-auto w-3 h-3 rounded-full bg-[#a50064]"></div>
                )}
              </button>

              {/* VNPAY Option */}
              <button
                onClick={() => setMethod('VNPAY')}
                className={`w-full flex items-center p-4 rounded-xl border-2 transition-all ${method === 'VNPAY' ? 'border-[#005baa] bg-[#005baa]/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}`}
              >
                <div className="w-10 h-10 rounded-full bg-[#005baa] flex items-center justify-center text-white mr-4 shadow-lg">
                  <Wallet size={20} />
                </div>
                <div className="text-left">
                  <p className="text-white font-bold">VNPAY</p>
                  <p className="text-xs text-slate-400">Thẻ ATM / Ứng dụng ngân hàng</p>
                </div>
                {method === 'VNPAY' && (
                  <div className="ml-auto w-3 h-3 rounded-full bg-[#005baa]"></div>
                )}
              </button>
            </div>

            <button
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full py-4 rounded-xl bg-[#3b82f6] hover:bg-blue-600 disabled:bg-slate-700 text-white font-bold text-lg transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" /> Đang xử lý...
                </>
              ) : (
                'Xác Nhận & Thanh Toán'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
