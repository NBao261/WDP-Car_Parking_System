import { ReactNode } from 'react';

interface MainContentProps {
  children: ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  return (
    <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-surface rounded-l-3xl shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)]">
      {children}
    </main>
  );
}
