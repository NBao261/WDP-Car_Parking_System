import { Loader2 } from 'lucide-react';

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = 'Đang tải dữ liệu...' }: PageLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-[#062F28] animate-spin mb-4" />
      <p className="text-gray-500 font-medium">{message}</p>
    </div>
  );
}
