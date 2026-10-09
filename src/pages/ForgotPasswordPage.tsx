import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, ArrowLeft, ShieldCheck, Mail } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 select-none">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-6 text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center justify-center mx-auto shadow-xs">
          <KeyRound className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            Administrative Access Recovery
          </span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Forgot password?</h1>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Password recovery is handled by the system administrator.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left space-y-2.5 text-xs text-slate-600">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span className="text-[11.5px] leading-relaxed">
              Automated self-service password resets are restricted on the Game Operations Console for compliance and account security.
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span className="text-[11.5px] leading-relaxed text-slate-500">
              Contact <strong className="text-slate-700">security@gamesystem.com</strong> or your system super administrator to request a credential reset ticket.
            </span>
          </div>
        </div>

        <div className="pt-1">
          <button
            type="button"
            onClick={() => navigate('/admin/login')}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-400 font-medium">
          Authorized administrators only.
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
