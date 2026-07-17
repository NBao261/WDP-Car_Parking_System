import { CheckOutContainer } from "./checkOut/CheckOutContainer";
import { CheckOutConfirmPanel } from "./checkOut/CheckOutConfirmPanel";

interface RightContainerProps {
  coPlateCam: string;
  setCoPlateCam: (plate: string) => void;
  checkOutResult: any;
  setCheckOutResult: (data: any) => void;
  setCurrentCheckOutSession: (session: any) => void;
  isMismatchCO: boolean;
  currentCheckOutSession: any;
}

export function RightContainer({
  coPlateCam, setCoPlateCam, checkOutResult, setCheckOutResult, setCurrentCheckOutSession, isMismatchCO, currentCheckOutSession
}: RightContainerProps) {
  return (
    <div className="flex flex-col bg-white rounded-[12px] border border-[#e8e9e8] shadow-sm p-3 h-full min-h-0 overflow-y-auto">
      <div className="flex-1 flex flex-col min-h-0 pb-2">
        <CheckOutContainer
          plate={coPlateCam}
          onChangePlate={setCoPlateCam}
          onCheckOut={setCheckOutResult}
          onSearch={setCurrentCheckOutSession}
          onFlagException={(checkOutImage) => {
            window.dispatchEvent(new CustomEvent("HOTKEY_F9", {
              detail: { coPlateCam, currentSession: currentCheckOutSession, checkOutImage }
            }));
          }}
        />
      </div>
      <div className="shrink-0">
        <CheckOutConfirmPanel data={checkOutResult} isMismatch={isMismatchCO} />
      </div>
    </div>
  );
}
