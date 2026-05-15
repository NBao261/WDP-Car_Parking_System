import { Construction } from 'lucide-react';

interface UnderDevelopmentProps {
  featureName: string;
  description?: string;
}

export function UnderDevelopment({ featureName, description }: UnderDevelopmentProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Icon */}
      <div className="w-20 h-20 rounded-2xl bg-[#d7ee46]/20 flex items-center justify-center mb-6">
        <Construction size={40} className="text-[#96a827]" />
      </div>

      {/* Badge */}
      <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-amber-200 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        Đang trong quá trình phát triển
      </span>

      {/* Feature name */}
      <h1 className="text-2xl font-bold text-[#060606] mb-2">{featureName}</h1>

      {/* Description */}
      <p className="text-gray-500 text-sm max-w-md leading-relaxed">
        {description ??
          'Chức năng này đang được đội ngũ phát triển. Vui lòng quay lại sau.'}
      </p>

      {/* Decorative divider */}
      <div className="flex items-center gap-3 mt-8">
        <div className="w-12 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">LYNC Park Admin Panel</span>
        <div className="w-12 h-px bg-gray-200" />
      </div>
    </div>
  );
}
