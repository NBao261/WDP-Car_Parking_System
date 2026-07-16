import { useEffect } from 'react';
import { useCheckOutLogic } from './useCheckOutLogic';
import { CheckOutHeader } from './CheckOutHeader';
import { CheckOutOCR } from './CheckOutOCR';
import { CheckOutForm } from './CheckOutForm';
import { CheckOutPayment } from './CheckOutPayment';

interface CheckOutContainerProps {
  plate: string;
  onChangePlate: (plate: string) => void;
  onCheckOut: (data: any) => void;
  onSearch?: (session: any) => void;
  onFlagException?: (checkoutImageUrl?: string | null) => void;
}

export function CheckOutContainer({
  plate,
  onChangePlate,
  onCheckOut,
  onSearch,
  onFlagException,
}: CheckOutContainerProps) {
  const logic = useCheckOutLogic(plate, onChangePlate, onCheckOut, onSearch);

  useEffect(() => {
    const onF10 = () => logic.handleReset();
    const onF2 = (e: KeyboardEvent) => {
      if (logic.step === 'CONFIRM' && !logic.isSubmitting) {
        e.preventDefault();
        logic.handleCashCheckOut();
      }
    };
    const onF3 = (e: KeyboardEvent) => {
      if (logic.step === 'CONFIRM' && !logic.isSubmitting && !logic.momoQR) {
        e.preventDefault();
        logic.handleMomoCheckOut();
      }
    };
    const onF9 = (e: KeyboardEvent) => {
      e.preventDefault();
      onFlagException?.(logic.checkoutImageUrl);
    };
    const onEnter = (e: KeyboardEvent) => {
      if (e.code === 'Enter') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        if (logic.paymentSuccess) {
          logic.setPaymentSuccess(false);
          logic.handleReset();
          if (onCheckOut) onCheckOut(null);
        } else if (logic.step === 'SEARCH') {
          logic.handleSearch();
        } else if (logic.step === 'CONFIRM') {
          if (!logic.isSubmitting && !logic.momoQR) logic.handleCashCheckOut();
        }
      }
    };

    window.addEventListener('keydown', onEnter);
    window.addEventListener('HOTKEY_F10', onF10);
    window.addEventListener('keydown', (e) => e.key === 'F2' && onF2(e));
    window.addEventListener('keydown', (e) => e.key === 'F3' && onF3(e));
    window.addEventListener('keydown', (e) => e.key === 'F9' && onF9(e));
    return () => {
      window.removeEventListener('keydown', onEnter);
      window.removeEventListener('HOTKEY_F10', onF10);
      window.removeEventListener('keydown', (e) => e.key === 'F2' && onF2(e));
      window.removeEventListener('keydown', (e) => e.key === 'F3' && onF3(e));
      window.removeEventListener('keydown', (e) => e.key === 'F9' && onF9(e));
    };
  }, [
    logic.step,
    logic.isSubmitting,
    logic.searchInput,
    logic.searchMode,
    logic.currentSession,
    plate,
    logic.plateIn,
    logic.momoQR,
    logic.paymentSuccess,
  ]);

  useEffect(() => {
    window.addEventListener('RESET_CHECKOUT', logic.handleReset);
    return () => window.removeEventListener('RESET_CHECKOUT', logic.handleReset);
  }, []);

  const isMismatch =
    logic.step === 'CONFIRM' &&
    !logic.isNoPlateVehicle &&
    plate.toUpperCase() !== logic.plateIn.toUpperCase();
  const isException = logic.currentSession?.status === 'exception';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (logic.paymentSuccess) {
        logic.setPaymentSuccess(false);
        logic.handleReset();
        if (onCheckOut) onCheckOut(null);
      } else if (logic.step === 'SEARCH') {
        if (!logic.searchInput || !logic.ocrPreviewUrl) {
          logic.showMsg('Vui lòng chụp ảnh xe ra trước khi tìm kiếm!', 'warning');
          return;
        }
        logic.handleSearch();
      } else {
        logic.handleCashCheckOut();
      }
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 relative">
      <CheckOutHeader
        building={logic.building}
        gateOut={logic.gateOut}
        currentSession={logic.currentSession}
      />
      <div className="flex flex-col gap-3 flex-1 min-h-0">
        <CheckOutOCR
          step={logic.step}
          isMismatch={isMismatch}
          isNoPlateVehicle={logic.isNoPlateVehicle}
          currentSession={logic.currentSession}
          ocrPreviewUrl={logic.ocrPreviewUrl}
          isUploading={logic.isUploading}
          fileInputRef={logic.fileInputRef}
          clearOcrPreview={logic.clearOcrPreview}
          handleImageUpload={logic.handleImageUpload}
        />
        <CheckOutForm
          plateIn={logic.plateIn}
          plate={plate}
          isNoPlateVehicle={logic.isNoPlateVehicle}
          onChangePlate={onChangePlate}
          handleKeyDown={handleKeyDown}
          step={logic.step}
          isSubmitting={logic.isSubmitting}
          isException={isException}
          isMismatch={isMismatch}
          searchMode={logic.searchMode}
          setSearchMode={logic.setSearchMode}
          setSearchInput={logic.setSearchInput}
          searchInputRef={logic.searchInputRef}
          searchInput={logic.searchInput}
          vehicleTypeName={logic.vehicleTypeName}
        />
        <CheckOutPayment
          paymentSuccess={logic.paymentSuccess}
          panelMsg={logic.panelMsg}
          setPanelMsg={logic.setPanelMsg}
          step={logic.step}
          isMismatch={isMismatch}
          isNoPlateVehicle={logic.isNoPlateVehicle}
          isSubmitting={logic.isSubmitting}
          onFlagException={() => onFlagException?.(logic.checkoutImageUrl)}
          handleCashCheckOut={logic.handleCashCheckOut}
          handleMomoCheckOut={logic.handleMomoCheckOut}
          setPaymentSuccess={logic.setPaymentSuccess}
          handleReset={logic.handleReset}
          onCheckOut={onCheckOut}
          momoQR={logic.momoQR}
          pollIntervalRef={logic.pollIntervalRef}
          setMomoQR={logic.setMomoQR}
        />
      </div>
    </div>
  );
}
