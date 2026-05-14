import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LoginStep } from "./steps/LoginStep";
import { ForgotStep } from "./steps/ForgotStep";
import { OtpStep } from "./steps/OtpStep";
import { ResetStep } from "./steps/ResetStep";

export type ViewState = "login" | "forgot" | "otp" | "reset";

export function LoginForm() {
  const [view, setView] = useState<ViewState>("login");
  const [email, setEmail] = useState("");

  const viewMeta = {
    login: {
      title: "Welcome back",
      subtitle: "Sign in to your account"
    },
    forgot: {
      title: "Forgot Password",
      subtitle: "Enter your email to receive a 6-digit verification code."
    },
    otp: {
      title: "Check Your Email",
      subtitle: "We sent a verification code to your email. Please enter it below."
    },
    reset: {
      title: "Create New Password",
      subtitle: "Your new password must be different from previously used passwords."
    }
  };

  return (
    <div className="w-[90%] sm:w-full max-w-[420px] bg-white rounded-[16px] shadow-[0_8px_32px_rgba(6,47,40,0.10)] px-[20px] py-[28px] md:px-[44px] md:pt-[48px] md:pb-[36px] z-10 relative flex flex-col mx-auto overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          className="flex flex-col"
        >
          {/* Dynamic Heading */}
          <div className="text-center mb-[28px]">
            <h2 className="text-[#062F28] font-bold text-[28px] tracking-tight mb-1">{viewMeta[view].title}</h2>
            <p className="text-[#7B7B7B] font-normal text-[13px] px-2 leading-relaxed">
              {viewMeta[view].subtitle}
            </p>
          </div>

          {view === "login" && <LoginStep changeView={setView} />}
          {view === "forgot" && <ForgotStep changeView={setView} email={email} setEmail={setEmail} />}
          {view === "otp" && <OtpStep changeView={setView} />}
          {view === "reset" && <ResetStep changeView={setView} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
