import React, { useState } from 'react';
import { LogIn, Key, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { AdminPinModal } from '../components/AdminPinModal';

interface LoginViewProps {
  setCurrentTab: (tab: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ setCurrentTab }) => {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      showToast('กรุณากรอกอีเมลหรือรหัสสมาชิก และรหัสผ่าน', 'error');
      return;
    }

    setLoading(true);
    const res = login(identifier, password);
    setLoading(false);

    if (res.success) {
      showToast('เข้าสู่ระบบสำเร็จ ยินดีต้อนรับสู่ GNO BABY', 'success');
      setCurrentTab('home');
    } else {
      showToast(res.error || 'เข้าสู่ระบบไม่สำเร็จ', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white dark:bg-slate-800/95 border border-pink-100 dark:border-slate-700 shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <div 
          onClick={() => setShowAdminPinModal(true)}
          title="เข้าสู่ระบบผู้ดูแลระบบ (Admin PIN)"
          className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-sky-400 via-pink-400 to-amber-300 flex items-center justify-center text-white shadow-md shadow-pink-200/50 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
        >
          <LogIn className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 font-['Prompt']">
          เข้าสู่ระบบสมาชิก
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          เข้าสู่ระบบด้วยอีเมล หรือ Member ID (เช่น GNO-M000001)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            อีเมล หรือ Member ID
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              required
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              placeholder="parent@example.com หรือ GNO-M000001"
              className="w-full text-xs pl-9 pr-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-pink-400"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              รหัสผ่าน
            </label>
            <button
              type="button"
              onClick={() => setCurrentTab('forgot_password')}
              className="text-[11px] text-pink-500 hover:underline"
            >
              ลืมรหัสผ่าน?
            </button>
          </div>
          <div className="relative">
            <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs pl-9 pr-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-pink-400"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-sky-400 via-pink-400 to-amber-400 hover:opacity-95 text-white shadow-md shadow-pink-200/50 transition-all flex items-center justify-center gap-2"
        >
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* DEMO ACCOUNTS HINT */}
      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
        <p className="font-bold text-slate-700 dark:text-slate-300">💡 บัญชีทดสอบสำหรับทดลองใช้งาน:</p>
        <p>• สมาชิก: <code className="text-pink-600 font-mono">parent@example.com</code> รหัส: <code className="text-pink-600 font-mono">Password123</code></p>
      </div>

      <div className="pt-2 text-center text-xs text-slate-500">
        ยังไม่มีบัญชีสมาชิก?{' '}
        <button
          onClick={() => setCurrentTab('register')}
          className="font-bold text-pink-600 dark:text-pink-400 hover:underline"
        >
          สมัครสมาชิกใหม่
        </button>
      </div>

      {/* ADMIN ENTRY BUTTON THAT OPENS POPUP */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
        <button
          type="button"
          onClick={() => setShowAdminPinModal(true)}
          className="text-xs font-semibold text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
          เข้าสู่ระบบผู้ดูแลระบบ (Admin)
        </button>
      </div>

      {/* ADMIN PIN POPUP MODAL */}
      <AdminPinModal
        isOpen={showAdminPinModal}
        onClose={() => setShowAdminPinModal(false)}
        onSuccess={() => {
          setShowAdminPinModal(false);
          setCurrentTab('admin_dashboard');
        }}
      />
    </div>
  );
};
