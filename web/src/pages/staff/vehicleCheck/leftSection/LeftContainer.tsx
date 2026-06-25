import { CheckInContainer } from "./checkIn/CheckInContainer";
import { CheckInConfirmPanel } from "./checkIn/CheckInConfirmPanel";

interface LeftContainerProps {
  checkInResult: any;
  setCheckInResult: (data: any) => void;
}

export function LeftContainer({ checkInResult, setCheckInResult }: LeftContainerProps) {
  return (
    <div className="flex flex-col bg-white rounded-[12px] border border-[#e8e9e8] shadow-sm p-3 h-full min-h-0 overflow-y-auto">
      <div className="shrink-0 pb-2">
        <CheckInContainer onCheckIn={setCheckInResult} />
      </div>
      <div className="shrink-0">
        <CheckInConfirmPanel data={checkInResult} />
      </div>
    </div>
  );
}
