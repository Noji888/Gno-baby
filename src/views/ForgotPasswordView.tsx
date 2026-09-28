import React, { useState } from 'react';
import { KeyRound, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { storage } from '../services/storageService';
import { useToast } from '../components/Toast';

interface ForgotPasswordViewProps {
  setCurrentTab: (tab: string) => void;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({ setCurrentTab }) => {
  const { showToast } = useToast();
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'request' | 'reset' | 'done'>('request');

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const user = storage.getUserByEmailOrMemberId(identifier);
    if (!user) {
      showToast('ไม่พบบัญชีผู้ใช้นี้ในระบบ', 'error');
      return;
    }
    setStep('reset');
    showToast('กรุณากำหนดรหัสผ่านใหม่สำหรับบัญชีนี้', 'info');
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร', 'error');
      return;
    }
    storage.updateUserPassword(identifier, newPassword);
    setStep('done');
    showToast('รีเซ็ตรหัสผ่านสำเร็จแล้ว', 'success');
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white dark:bg-slate-800 border border-pink-100 dark:border-slate-700 shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center text-2xl shadow-xs">
          <KeyRound className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 font-['Prompt']">
          ลืมรหัสผ่าน
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          รีเซ็ตรหัสผ่านบัญชีสมาชิก GNO BABY
        </p>
      </div>

      {step === 'request' && (
        <form onSubmit={handleRequest} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              ระบุอีเมล หรือ Member ID
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="parent@example.com หรือ GNO-M000001"
                className="w-full text-xs pl-9 pr-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold text-sm bg-pink-500 hover:bg-pink-600 text-white transition-colors"
          >
            ตรวจสอบบัญชี
          </button>
        </form>
      )}

      {step === 'reset' && (
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              ตั้งรหัสผ่านใหม่สำหรับ {identifier}
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="รหัสผ่านใหม่อย่างน้อย 6 ตัว"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
          >
            บันทึกรหัสผ่านใหม่
          </button>
        </form>
      )}

      {step === 'done' && (
        <div className="text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            รหัสผ่านของคุณได้รับการเปลี่ยนเรียบร้อยแล้ว
          </p>
          <button
            onClick={() => setCurrentTab('login')}
            className="w-full py-3 rounded-xl font-bold text-sm bg-pink-500 text-white"
          >
            ไปที่หน้าเข้าสู่ระบบ
          </button>
        </div>
      )}

      <div className="text-center pt-2">
        <button
          onClick={() => setCurrentTab('login')}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center gap-1 mx-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          กลับไปหน้าเข้าสู่ระบบ
        </button>
      </div>
    </div>
  );
};
