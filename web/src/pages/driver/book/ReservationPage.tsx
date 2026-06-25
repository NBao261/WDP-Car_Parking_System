import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useReservation } from './hooks/useReservation';
import { BookingForm } from './components/BookingForm';
import { FacilitySummary } from './components/FacilitySummary';
import { SuccessTicketModal } from './components/SuccessTicketModal';
import { Skeleton } from '../../../components/ui/Skeleton';

const ReservationSkeleton = () => (
  <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 pb-20 mt-4">
    <div className="flex items-center gap-3 mb-2">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>
    </div>
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 bg-card border border-border rounded-2xl p-6 shadow-sm">
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="space-y-6">
          <div>
            <Skeleton className="h-4 w-24 mb-3" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          </div>
          <div>
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
          <div>
            <Skeleton className="h-4 w-32 mb-3" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-[400px] flex flex-col gap-6">
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <Skeleton className="h-40 w-full rounded-none" />
          <div className="p-5">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    </div>
  </div>
);

const ReservationPage: React.FC = () => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const navigate = useNavigate();

  const {
    facility,
    loading,
    licensePlate,
    setLicensePlate,
    vehicleTypeId,
    setVehicleTypeId,
    timeMode,
    setTimeMode,
    customTime,
    setCustomTime,
    isSubmitting,
    reservationResult,
    closeTicketModal,
    isTimeValid,
    isFormValid,
    handleSubmit,
    uniqueVehicleTypes,
    activePlan,
    currentAvailableCount,
  } = useReservation(facilityId);

  if (loading) {
    return <ReservationSkeleton />;
  }

  const priceFormatted = activePlan?.rates?.[0]?.amount?.toLocaleString('vi-VN') || '0';

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 pb-20">
      {/* ─── MODAL TICKET ────────────────────────────────────────────── */}
      <SuccessTicketModal
        reservationResult={reservationResult}
        facility={facility}
        activePlan={activePlan}
        onClose={closeTicketModal}
      />

      {/* ─── HEADER ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => navigate('/driver/facilities')}
          className="p-2 hover:bg-black/5 rounded-full transition-colors text-muted-foreground hover:text-brand"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-brand font-outfit">Đăng ký Đặt Chỗ</h2>
          <p className="text-muted-foreground text-sm">
            Hệ thống sẽ tự động tìm vị trí tốt nhất cho xe của bạn.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 relative">
        {/* Left Column: Booking Form */}
        <div className="flex-1">
          <BookingForm
            uniqueVehicleTypes={uniqueVehicleTypes}
            vehicleTypeId={vehicleTypeId}
            setVehicleTypeId={setVehicleTypeId}
            licensePlate={licensePlate}
            setLicensePlate={setLicensePlate}
            timeMode={timeMode}
            setTimeMode={setTimeMode}
            customTime={customTime}
            setCustomTime={setCustomTime}
            isTimeValid={isTimeValid}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Right Column: Facility Info & Pricing Summary */}
        <div className="w-full lg:w-[400px]">
          <FacilitySummary
            facility={facility}
            activePlan={activePlan}
            currentAvailableCount={currentAvailableCount}
            priceFormatted={priceFormatted}
            isSubmitting={isSubmitting}
            isFormValid={isFormValid}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default ReservationPage;
