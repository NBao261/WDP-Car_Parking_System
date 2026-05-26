import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ExceptionsList, { ExceptionData } from "./components/ExceptionsList";
import ExceptionDetailDrawer from "./components/ExceptionDetailDrawer";

export default function ExceptionsStaffPage() {
  const [selectedException, setSelectedException] = useState<ExceptionData | null>(null);
  const [exceptionsList, setExceptionsList] = useState<ExceptionData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const existingStr = localStorage.getItem("mock_exceptions");
    if (existingStr) {
      try {
        const existing = JSON.parse(existingStr);
        const mapped = existing.map((exc: any) => ({
          id: exc.code,
          plate: exc.plateOut || exc.plateIn,
          type: exc.type,
          time: new Date(exc.createdAt).toLocaleString('vi-VN'),
          status: exc.status.toUpperCase(),
          manager: null,
          note: exc.note
        }));
        setExceptionsList(mapped);
      } catch (e) {
        setExceptionsList([]);
      }
    }
  }, []);

  const handleContinueCheckout = (plate: string) => {
    // Navigate to Vehicle Check page (check-in/out) and pass the plate via state
    navigate("/staff", { state: { plate } });
  };

  return (
    <div className="h-full max-w-6xl mx-auto pb-10 p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-[22px] font-bold text-[#060606]">Ngoại lệ của tôi</h2>
          <p className="text-sm text-[#6b6b6b] mt-1">Các ngoại lệ bạn đã báo cáo và trạng thái giải quyết.</p>
        </div>
      </div>

      <ExceptionsList 
        exceptionsList={exceptionsList} 
        onSelectException={setSelectedException} 
        onContinueCheckout={handleContinueCheckout} 
      />

      <ExceptionDetailDrawer 
        selectedException={selectedException} 
        onClose={() => setSelectedException(null)} 
        onContinueCheckout={handleContinueCheckout} 
      />
    </div>
  );
}