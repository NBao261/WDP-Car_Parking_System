import { useState, useEffect } from 'react';
import {
  ExceptionStatus,
  ExceptionType,
  IException,
  ReviewExceptionPayload,
  EXCEPTION_TYPE_LABELS,
} from '../../../../services/exception.service';
import { ExceptionStatusBadge } from '../../../../components/ui/ExceptionBadge';
import {
  X,
  Eye,
  Camera,
  FileText,
  Clock,
  Car,
  User,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Banknote,
  ShieldAlert,
} from 'lucide-react';

interface ReviewModalProps {
  exception: IException | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (id: string, payload: ReviewExceptionPayload) => Promise<void>;
  submitting: boolean;
}

// ─── Placeholder images khi BE chưa trả về evidenceImages ────────────────────
const EVIDENCE_PLACEHOLDERS: Record<ExceptionType, string[]> = {
  [ExceptionType.LOST_CARD]: [
    'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  ],
  [ExceptionType.WRONG_PLATE]: [
    'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80',
    'https://images.unsplash.com/photo-1553697388-94e804e2f0f6?w=600&q=80',
  ],
  [ExceptionType.OVERTIME]: [
    'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&q=80',
  ],
  [ExceptionType.WRONG_ZONE]: [
    'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=600&q=80',
    'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=600&q=80',
  ],
  [ExceptionType.UNPAID]: [
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80',
  ],
  [ExceptionType.OTHER]: [
    'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&q=80',
  ],
};

// ─── Image Gallery Component ─────────────────────────────────────────────────
function ImageGallery({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] bg-[#f5f5f4] rounded-xl border-2 border-dashed border-[#d4d4d0] text-[#a0a0a0]">
        <Camera size={32} className="mb-2 opacity-40" />
        <p className="text-[12px]">Chưa có hình ảnh bằng chứng</p>
      </div>
    );
  }

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));

  return (
    <>
      <div className="relative rounded-xl overflow-hidden bg-black group" style={{ aspectRatio: '4/3' }}>
        <img
          src={images[current]}
          alt={`Bằng chứng ${current + 1}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&q=80';
          }}
        />
        {/* Lightbox button */}
        <button
          onClick={() => setLightbox(true)}
          className="absolute top-2 right-2 bg-black/50 hover:bg-black/80 text-white rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-all"
          title="Phóng to"
        >
          <ZoomIn size={14} />
        </button>
        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
        {/* Counter pill */}
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {current + 1}/{images.length}
          </div>
        )}
        {/* Caption */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
          <p className="text-white text-[11px] font-medium">
            {current === 0 ? '📷 Ảnh camera lúc xe vào cổng' : '📄 Ảnh giấy tờ xe do Staff tải lên'}
          </p>
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`flex-1 rounded-lg overflow-hidden border-2 transition-all ${
                i === current ? 'border-[#d7ee46]' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
              style={{ aspectRatio: '16/9' }}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox overlay */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-[#d7ee46] transition-colors"
            onClick={() => setLightbox(false)}
          >
            <X size={28} />
          </button>
          <img
            src={images[current]}
            alt=""
            className="max-w-full max-h-full rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

// ─── Info Row helpers ─────────────────────────────────────────────────────────
function InfoRow({ label, value, icon, mono }: { label: string; value?: string | null; icon?: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2 py-2 border-b border-[#f0f1f0] last:border-0">
      {icon && <span className="text-[#a0a0a0] mt-0.5 shrink-0">{icon}</span>}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#a0a0a0]">{label}</p>
        <p className={`text-[13px] font-medium text-[#060606] mt-0.5 truncate ${mono ? 'font-mono' : ''}`}>
          {value || '—'}
        </p>
      </div>
    </div>
  );
}

// ─── Type meta (biểu tượng + màu nền cho header) ──────────────────────────────
const TYPE_META: Record<ExceptionType, { icon: string; bg: string; textColor: string }> = {
  [ExceptionType.LOST_CARD]:   { icon: '🎫', bg: 'from-amber-500/20 to-yellow-500/10',   textColor: 'text-amber-700' },
  [ExceptionType.WRONG_PLATE]: { icon: '🚘', bg: 'from-orange-500/20 to-red-500/10',     textColor: 'text-orange-700' },
  [ExceptionType.OVERTIME]:    { icon: '⏰', bg: 'from-red-500/20 to-rose-500/10',       textColor: 'text-red-700' },
  [ExceptionType.WRONG_ZONE]:  { icon: '📍', bg: 'from-blue-500/20 to-sky-500/10',       textColor: 'text-blue-700' },
  [ExceptionType.UNPAID]:      { icon: '💸', bg: 'from-purple-500/20 to-violet-500/10',  textColor: 'text-purple-700' },
  [ExceptionType.OTHER]:       { icon: '⚠️', bg: 'from-gray-500/20 to-slate-500/10',     textColor: 'text-gray-700' },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export function ReviewModal({ exception, open, onClose, onSubmit, submitting }: ReviewModalProps) {
  const [managerNote, setManagerNote] = useState('');
  const [decision, setDecision] = useState<ExceptionStatus.RESOLVED | ExceptionStatus.REJECTED>(
    ExceptionStatus.RESOLVED
  );

  // Reset state khi mở modal mới
  useEffect(() => {
    if (open) {
      setManagerNote('');
      setDecision(ExceptionStatus.RESOLVED);
    }
  }, [open, exception?._id]);

  if (!open || !exception) return null;

  const session = typeof exception.sessionId === 'object' ? exception.sessionId : null;
  const staff   = typeof exception.staffId   === 'object' ? exception.staffId   : null;

  const isEditable =
    exception.status === ExceptionStatus.NEW ||
    exception.status === ExceptionStatus.PROCESSING;

  const needsEscalation =
    exception.status === ExceptionStatus.NEW &&
    !exception.surcharge; // Chưa có phụ phí → cần Manager ra quyết định giá trị

  // Hình ảnh bằng chứng: từ BE hoặc placeholder theo loại ngoại lệ
  const images: string[] = exception.evidenceImages?.length
    ? exception.evidenceImages
    : EVIDENCE_PLACEHOLDERS[exception.type] ?? [];

  const meta = TYPE_META[exception.type];

  const handleSubmit = async () => {
    await onSubmit(exception._id, { managerNote, status: decision });
    onClose();
  };

  const isSubmitDisabled =
    submitting ||
    (decision === ExceptionStatus.REJECTED && !managerNote.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal shell — max 900px, tall */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[900px] max-h-[92vh] flex flex-col overflow-hidden">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className={`bg-gradient-to-r ${meta.bg} px-6 py-4 border-b border-[#f0f1f0] flex items-start justify-between shrink-0`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{meta.icon}</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-bold text-[17px] text-[#060606]">Review Ngoại Lệ</h2>
                <ExceptionStatusBadge status={exception.status} />
              </div>
              <p className={`text-[12px] font-medium mt-0.5 ${meta.textColor}`}>
                {EXCEPTION_TYPE_LABELS[exception.type]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {needsEscalation && (
              <span className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-lg border border-amber-200">
                <ShieldAlert size={11} />
                Cần xử lý ngay
              </span>
            )}
            <button
              onClick={onClose}
              className="text-[#a0a0a0] hover:text-[#060606] hover:bg-black/5 rounded-lg p-1.5 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Body — Scrollable ───────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] divide-y md:divide-y-0 md:divide-x divide-[#f0f1f0]">

            {/* ═══════ CỘT TRÁI: Thông tin Session + Exception ═════════ */}
            <div className="p-5 space-y-4">
              {/* Session info */}
              <section>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#a0a0a0] mb-1 flex items-center gap-1.5">
                  <Car size={12} /> Thông tin lượt gửi
                </h3>
                <div>
                  <InfoRow label="Biển số xe"  value={session?.licensePlate} icon={<Car size={13} />} mono />
                  <InfoRow label="Mã lượt gửi" value={session?.code}          icon={<FileText size={13} />} mono />
                  <InfoRow
                    label="Giờ vào"
                    value={session?.checkInTime ? new Date(session.checkInTime).toLocaleString('vi-VN') : undefined}
                    icon={<Clock size={13} />}
                  />
                  {session && typeof session.vehicleTypeId === 'object' && session.vehicleTypeId && (
                    <InfoRow label="Loại xe" value={(session.vehicleTypeId as any).name} icon={<Car size={13} />} />
                  )}
                  {session && typeof session.floorId === 'object' && session.floorId && (
                    <InfoRow label="Tầng" value={(session.floorId as any).name} icon={<MapPin size={13} />} />
                  )}
                  {session && typeof session.slotId === 'object' && session.slotId && (
                    <InfoRow label="Slot" value={(session.slotId as any).code} icon={<MapPin size={13} />} mono />
                  )}
                </div>
              </section>

              {/* Exception info */}
              <section>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#a0a0a0] mb-1 flex items-center gap-1.5">
                  <AlertTriangle size={12} /> Chi tiết ngoại lệ
                </h3>
                <div>
                  <InfoRow label="Nhân viên tạo" value={staff?.name} icon={<User size={13} />} />
                  <InfoRow
                    label="Thời gian báo cáo"
                    value={new Date(exception.createdAt).toLocaleString('vi-VN')}
                    icon={<Clock size={13} />}
                  />
                </div>
              </section>

              {/* Mô tả sự cố */}
              <section>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#a0a0a0] mb-2">
                  Mô tả sự cố từ Staff
                </h3>
                <div className="bg-[#f9f9f9] rounded-xl px-3 py-2.5 border border-[#f0f1f0]">
                  <p className="text-[13px] text-[#3a3a3a] leading-relaxed">
                    {exception.description || 'Không có mô tả'}
                  </p>
                </div>
              </section>

              {/* Phụ thu */}
              {exception.surcharge > 0 && (
                <div className="flex items-center justify-between bg-[#fff7ed] rounded-xl px-4 py-3 border border-[#fed7aa]/50">
                  <div className="flex items-center gap-2">
                    <Banknote size={16} className="text-[#c2410c]" />
                    <span className="text-[13px] font-bold text-[#c2410c]">Phụ thu đã áp dụng</span>
                  </div>
                  <span className="text-[15px] font-bold text-[#c2410c]">
                    {exception.surcharge.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              )}

              {/* Ghi chú Manager (read-only nếu đã xử lý) */}
              {!isEditable && exception.managerNote && (
                <section>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#a0a0a0] mb-2 flex items-center gap-1.5">
                    <MessageSquare size={12} /> Ghi chú Manager
                  </h3>
                  <div className="bg-[#f0fdf4] rounded-xl px-3 py-2.5 border border-[#86efac]/40">
                    <p className="text-[13px] text-[#166534]">{exception.managerNote}</p>
                  </div>
                </section>
              )}
            </div>

            {/* ═══════ CỘT PHẢI: Image Gallery + Action Panel ══════════ */}
            <div className="p-5 flex flex-col gap-4">
              {/* Image Gallery */}
              <section className="flex-1">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#a0a0a0] mb-2 flex items-center gap-1.5">
                  <Eye size={12} /> Bằng chứng hình ảnh
                </h3>
                <ImageGallery images={images} />
                <p className="text-[10px] text-[#a0a0a0] mt-1.5 italic">
                  💡 Click vào ảnh để phóng to. Ảnh camera + giấy tờ do Staff tải lên.
                </p>
              </section>

              {/* ── Action Panel (chỉ hiện khi chưa xử lý) ─────────── */}
              {isEditable && (
                <section className="border-t border-[#f0f1f0] pt-4 space-y-3">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#a0a0a0] flex items-center gap-1.5">
                    <MessageSquare size={12} /> Quyết định của Manager
                  </h3>

                  {/* Decision toggle */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDecision(ExceptionStatus.RESOLVED)}
                      className={`flex items-center justify-center gap-2 h-10 rounded-xl text-[13px] font-bold border-2 transition-all ${
                        decision === ExceptionStatus.RESOLVED
                          ? 'border-[#22c55e] bg-[#dcfce7] text-[#166534]'
                          : 'border-[#e8e9e8] bg-white text-[#6b6b6b] hover:border-[#22c55e]/40'
                      }`}
                    >
                      <CheckCircle2 size={15} />
                      Duyệt / Cho ra
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecision(ExceptionStatus.REJECTED)}
                      className={`flex items-center justify-center gap-2 h-10 rounded-xl text-[13px] font-bold border-2 transition-all ${
                        decision === ExceptionStatus.REJECTED
                          ? 'border-[#ef4444] bg-[#fee2e2] text-[#991b1b]'
                          : 'border-[#e8e9e8] bg-white text-[#6b6b6b] hover:border-[#ef4444]/40'
                      }`}
                    >
                      <XCircle size={15} />
                      Từ Chối
                    </button>
                  </div>

                  {/* Context hint */}
                  {decision === ExceptionStatus.REJECTED && (
                    <div className="flex items-start gap-2 bg-[#fef2f2] rounded-lg px-3 py-2 border border-[#fca5a5]/40">
                      <ShieldAlert size={14} className="text-[#dc2626] mt-0.5 shrink-0" />
                      <p className="text-[11px] text-[#dc2626]">
                        Khi từ chối, xe sẽ bị giữ lại. Hãy ghi chú rõ lý do để Staff và bộ phận an ninh xử lý tiếp.
                      </p>
                    </div>
                  )}

                  {/* Manager note textarea */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#a0a0a0] mb-1 block">
                      Ghi chú
                      {decision === ExceptionStatus.REJECTED && (
                        <span className="text-[#ef4444] ml-1">* (bắt buộc khi từ chối)</span>
                      )}
                    </label>
                    <textarea
                      value={managerNote}
                      onChange={(e) => setManagerNote(e.target.value)}
                      placeholder={
                        decision === ExceptionStatus.RESOLVED
                          ? 'VD: Đã đối chiếu camera và giấy tờ, thông tin hợp lệ. Miễn phụ thu mất vé.'
                          : 'VD: Giấy tờ không khớp biển số. Giữ xe, liên hệ công an phường...'
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-[#e8e9e8] rounded-xl text-[13px] outline-none focus:border-[#d7ee46] focus:ring-2 focus:ring-[#d7ee46]/30 transition-all resize-none placeholder:text-[#c0c0c0]"
                    />
                  </div>

                  {/* Submit button */}
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitDisabled}
                    className={`w-full h-11 font-bold text-[14px] rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      decision === ExceptionStatus.RESOLVED
                        ? 'bg-[#1a1a1a] hover:bg-[#333] text-white'
                        : 'bg-[#dc2626] hover:bg-[#b91c1c] text-white'
                    }`}
                  >
                    {submitting
                      ? 'Đang ghi nhận...'
                      : decision === ExceptionStatus.RESOLVED
                      ? '✓ Xác nhận Duyệt & Giải quyết'
                      : '✕ Xác nhận Từ chối'}
                  </button>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
