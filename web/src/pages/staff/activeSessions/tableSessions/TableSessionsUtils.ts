export const calculateDuration = (checkInTime: string) => {
  const diff = Date.now() - new Date(checkInTime).getTime();
  if (diff < 0) return '0p';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const parts = [];
  if (days > 0) parts.push(`${days} ngày`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}p`);
  return parts.join(' ');
};

export const getActiveBadgeClasses = (checkInTime: string) => {
  const diffHours = (Date.now() - new Date(checkInTime).getTime()) / (1000 * 60 * 60);
  if (diffHours < 24) {
    const steps = Math.floor(diffHours / 4);
    switch (steps) {
      case 0: return 'bg-[#9FE870]/20 text-[#062F28] border-[#9FE870]/30'; 
      case 1: return 'bg-[#9FE870]/40 text-[#062F28] border-[#9FE870]/50'; 
      case 2: return 'bg-[#9FE870]/60 text-[#062F28] border-[#9FE870]/70'; 
      case 3: return 'bg-[#9FE870]/80 text-[#062F28] border-[#9FE870]/90'; 
      case 4: return 'bg-[#9FE870] text-[#062F28] border-[#9FE870]'; 
      default: return 'bg-[#8BD65E] text-[#062F28] border-[#8BD65E]'; 
    }
  } else {
    const days = Math.floor(diffHours / 24);
    switch (days) {
      case 1: return 'bg-[#062F28]/60 text-white border-[#062F28]/70'; 
      case 2: return 'bg-[#062F28]/80 text-white border-[#062F28]/90'; 
      default: return 'bg-[#062F28] text-white border-[#062F28]'; 
    }
  }
};
