import React, { useState, useEffect, useRef } from 'react';
import { KeyRound, Delete, RotateCcw, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { loginAdminWithPin } = useAuth();
  const { showToast } = useToast();

  const [pin, setPin] = useState<string>('');
  const [errorShake, setErrorShake] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMessage(null);
      setErrorShake(false);
      setIsVerifying(false);
      setTimeout(() => {
        hiddenInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
        onSuccess();
      } else {
        setErrorShake(true);
        setErrorMessage('รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
        showToast('รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง', 'error');
        setTimeout(() => {
          setPin('');
          setErrorShake(false);
          setIsVerifying(false);
          hiddenInputRef.current?.focus();
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
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-50">
      <div 
        className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 shadow-2xl p-6 sm:p-7 space-y-5 text-center relative animate-in zoom-in-95"
        onClick={() => hiddenInputRef.current?.focus()}
      >
        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          aria-label="ปิดหน้าต่าง"
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hidden input for physical keyboard input */}
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

        {/* ICON & TITLE */}
        <div className="space-y-2 pt-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-400 text-white flex items-center justify-center text-2xl shadow-md shadow-amber-200/50 dark:shadow-none">
            <KeyRound className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 font-['Prompt']">
            ยืนยันรหัส PIN ผู้ดูแลระบบ
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            กรุณาระบุรหัส PIN 4 หลักเพื่อเข้าสู่ระบบหลังบ้าน
          </p>
        </div>

        {/* PIN DISPLAY (MASKED DOTS) */}
        <div className={`flex justify-center items-center gap-3.5 py-2 ${errorShake ? 'animate-bounce' : ''}`}>
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

        {/* KEYPAD */}
        <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              disabled={isVerifying}
              onClick={() => handleDigit(digit)}
              className="w-16 h-13 sm:w-18 sm:h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 active:scale-95 text-slate-800 dark:text-slate-100 font-bold text-xl transition-all flex items-center justify-center border border-slate-200/60 dark:border-slate-700"
            >
              {digit}
            </button>
          ))}

          {/* CLEAR */}
          <button
            type="button"
            disabled={isVerifying || pin.length === 0}
            onClick={handleClear}
            aria-label="ล้าง"
            className="w-16 h-13 sm:w-18 sm:h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-500 text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 border border-slate-200/40 dark:border-slate-700/50 disabled:opacity-40"
          >
            <RotateCcw className="w-4 h-4" />
            <span>ล้าง</span>
          </button>

          {/* 0 */}
          <button
            type="button"
            disabled={isVerifying}
            onClick={() => handleDigit('0')}
            className="w-16 h-13 sm:w-18 sm:h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 active:scale-95 text-slate-800 dark:text-slate-100 font-bold text-xl transition-all flex items-center justify-center border border-slate-200/60 dark:border-slate-700"
          >
            0
          </button>

          {/* BACKSPACE */}
          <button
            type="button"
            disabled={isVerifying || pin.length === 0}
            onClick={handleBackspace}
            aria-label="ลบ"
            className="w-16 h-13 sm:w-18 sm:h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-500 text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 border border-slate-200/40 dark:border-slate-700/50 disabled:opacity-40"
          >
            <Delete className="w-4 h-4" />
            <span>ลบ</span>
          </button>
        </div>

        {/* CANCEL */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 py-1"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
};
