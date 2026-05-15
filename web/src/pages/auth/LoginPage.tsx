import React from 'react';
import { DecorativeShape } from './components/DecorativeShape';
import { BottomLeftShape } from './components/BottomLeftShape';
import { LoginForm } from './components/LoginForm';

import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#E7E7F1] relative overflow-hidden flex items-center justify-center font-sans">
      <BottomLeftShape />
      <DecorativeShape />

      {/* Premium Absolute Header - Top Left */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="absolute top-0 left-0 w-full p-6 sm:p-10 z-20 flex items-center gap-3"
      >
        <img src="/Logo.png" alt="LYNC Park Logo" className="h-[40px] sm:h-[48px] w-auto object-contain rounded-[8px]" />
        <h1 className="text-[#062F28] font-bold text-[20px] sm:text-[24px] tracking-tight">LYNC Park</h1>
      </motion.div>

      {/* Container for Centered Form */}
      <motion.div
        initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="w-full flex items-center justify-center relative z-10 px-4 py-8"
      >
        <LoginForm />
      </motion.div>
    </div>
  );
};

export default LoginPage;
