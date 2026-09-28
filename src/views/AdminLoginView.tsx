import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, Delete, RotateCcw, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

interface AdminLoginViewProps {
  setCurrentTab: (tab: string) => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ setCurrentTab }) => {
  const { loginAdminWithPin } = useAuth();
  const { showToast } = useToast();

  const [pin, setPin] = useState<string>('');
  const [errorShake, setErrorShake] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus hidden input on mount for physical keyboard support
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  }, []);

  const handleDigit = (digit: string) => {
    if (isVerifying || pin.length >= 4) return;
    setErrorMessage(null);
    const newPin = pin + digit;
    setPin(newPin);

    if (newPin.length === 4) {
      verifyPin(newPin);
    }
  };

  const handleBackspace = () => {
    if (isVerifying) return;
    setErrorMessage(null);
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (isVerifying) return;
    setErrorMessage(null);
    setPin('');
  };

  const verifyPin = (pinToTest: string) => {
    setIsVerifying(true);
    setErrorMessage(null);

    setTimeout(() => {
      const res = loginAdminWithPin(pinToTest);
      if (res.success) {
        showToast('เข้าสู่ระบบผู้ดูแลระบบสำเร็จ', 'success');
        setCurrentTab('admin_dashboard');
      } else {
        setErrorShake(true);
        setErrorMessage('รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
        showToast('รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง', 'error');
        setTimeout(() => {
          setPin('');
          setErrorShake(false);
          setIsVerifying(false);
          if (hiddenInputRef.current) {
            hiddenInputRef.current.focus();
          }
        }, 500);
      }
    }, 250);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isVerifying) return;
    if (e.key >= '0' && e.key <= '9') {
      handleDigit(e.key);
    } else if (e.key === 'Backspace') {
      handleBackspace();
    } else if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div 
      className="max-w-sm mx-auto my-10 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 shadow-2xl space-y-6 text-center select-none"
      onClick={() => hiddenInputRef.current?.focus()}
    >
      {/* Hidden input to capture physical keyboard input */}
      <input
        ref={hiddenInputRef}
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        value={pin}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, '');
          if (val.length <= 4) {
            setPin(val);
            if (val.length === 4) verifyPin(val);
          }
        }}
        onKeyDown={handleKeyDown}
        className="opacity-0 absolute pointer-events-none -left-9999px"
        aria-label="Admin PIN Input"
      />

      {/* HEADER ICON & TITLE */}
      <div className="space-y-3">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-400 text-white flex items-center justify-center text-3xl shadow-lg shadow-amber-200/50 dark:shadow-none">
          <KeyRound className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-['Prompt']">
            ยืนยันรหัสความปลอดภัย
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            กรุณาระบุรหัส PIN 4 หลักเพื่อเข้าสู่ระบบจัดการหลังบ้าน
          </p>
        </div>
      </div>

      {/* PIN DOTS DISPLAY (MASKED) */}
      <div className={`flex justify-center items-center gap-4 py-3 ${errorShake ? 'animate-bounce' : ''}`}>
        {[0, 1, 2, 3].map((index) => {
          const isFilled = pin.length > index;
          return (
            <div
              key={index}
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full transition-all duration-200 flex items-center justify-center ${
                isFilled
                  ? 'bg-amber-500 scale-110 shadow-md shadow-amber-300 dark:shadow-none'
                  : 'border-2 border-slate-300 dark:border-slate-700 bg-transparent'
              }`}
            >
              {isFilled && <span className="w-2 h-2 rounded-full bg-white" />}
            </div>
          );
        })}
      </div>

      {/* ERROR MESSAGE IF ANY */}
      {errorMessage && (
        <p className="text-xs font-semibold text-rose-500 animate-pulse">
          {errorMessage}
        </p>
      )}

      {/* NUMERIC KEYPAD */}
      <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto pt-1">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            type="button"
            disabled={isVerifying}
            onClick={() => handleDigit(digit)}
            className="w-18 h-14 sm:w-20 sm:h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 active:scale-95 text-slate-800 dark:text-slate-100 font-bold text-xl sm:text-2xl transition-all flex items-center justify-center shadow-xs border border-slate-200/60 dark:border-slate-700"
          >
            {digit}
          </button>
        ))}

        {/* CLEAR BUTTON */}
        <button
          type="button"
          disabled={isVerifying || pin.length === 0}
          onClick={handleClear}
          aria-label="ล้างทั้งหมด"
          className="w-18 h-14 sm:w-20 sm:h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-500 text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 border border-slate-200/40 dark:border-slate-700/50 disabled:opacity-40"
        >
          <RotateCcw className="w-4 h-4" />
          <span>ล้าง</span>
        </button>

        {/* DIGIT 0 */}
        <button
          type="button"
          disabled={isVerifying}
          onClick={() => handleDigit('0')}
          className="w-18 h-14 sm:w-20 sm:h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 active:scale-95 text-slate-800 dark:text-slate-100 font-bold text-xl sm:text-2xl transition-all flex items-center justify-center shadow-xs border border-slate-200/60 dark:border-slate-700"
        >
          0
        </button>

        {/* BACKSPACE BUTTON */}
        <button
          type="button"
          disabled={isVerifying || pin.length === 0}
          onClick={handleBackspace}
          aria-label="ลบตัวเลข"
          className="w-18 h-14 sm:w-20 sm:h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-500 text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 border border-slate-200/40 dark:border-slate-700/50 disabled:opacity-40"
        >
          <Delete className="w-4 h-4" />
          <span>ลบ</span>
        </button>
      </div>

      {/* BACK TO HOME */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setCurrentTab('home')}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 inline-flex items-center gap-1.5 transition-colors py-1 px-3 rounded-lg"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          ยกเลิกและกลับหน้าหลัก
        </button>
      </div>
    </div>
  );
};
