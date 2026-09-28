import React, { useState } from 'react';
import { UserPlus, Mail, Key, User, Phone, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

interface RegisterViewProps {
  setCurrentTab: (tab: string) => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ setCurrentTab }) => {
  const { register } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredMemberId, setRegisteredMemberId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร', 'error');
      return;
    }

    setLoading(true);
    const res = register({
      name,
      nickname,
      email,
      phone,
      password
    });
    setLoading(false);

    if (res.success) {
      // Get member ID from storage
      const users = JSON.parse(localStorage.getItem('gno_users_v2') || '[]');
      const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      setRegisteredMemberId(user?.memberId || 'GNO-M000001');
      showToast('สมัครสมาชิกสำเร็จแล้ว!', 'success');
    } else {
      showToast(res.error || 'เกิดข้อผิดพลาดในการสมัครสมาชิก', 'error');
    }
  };

  if (registeredMemberId) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white dark:bg-slate-800 border-2 border-emerald-300 dark:border-emerald-700 shadow-xl text-center space-y-5 animate-in zoom-in-95">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-3xl">
          🎉
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 font-['Prompt']">
          ยินดีต้อนรับสมาชิกใหม่!
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          บัญชีของคุณได้รับการลงทะเบียนเรียบร้อยแล้ว รหัสสมาชิกประจำตัวของคุณคือ:
        </p>

        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
          <span className="text-xs text-emerald-600 dark:text-emerald-400 block font-medium">รหัสสมาชิก (Member ID)</span>
          <span className="text-3xl font-black font-mono tracking-wider text-emerald-700 dark:text-emerald-300">
            {registeredMemberId}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">
            *คุณสามารถใช้ Member ID นี้ หรือใช้อีเมลเพื่อเข้าสู่ระบบในครั้งถัดไป
          </p>
        </div>

        <button
          onClick={() => setCurrentTab('home')}
          className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-sky-400 via-pink-400 to-amber-400 text-white shadow-lg shadow-pink-200/50 hover:opacity-95 transition-opacity"
        >
          เริ่มค้นหาชื่อมงคลทันที
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white dark:bg-slate-800/95 border border-pink-100 dark:border-slate-700 shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-sky-400 via-pink-400 to-amber-300 flex items-center justify-center text-white shadow-md shadow-pink-200/50">
          <UserPlus className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 font-['Prompt']">
          สมัครสมาชิก GNO BABY
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          รับรหัสสมาชิก Member ID เพื่อบันทึกชื่อโปรดและเปรียบเทียบชื่อลูกรัก
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            ชื่อ - นามสกุล <span className="text-pink-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="คุณพ่อกอล์ฟ หรือ คุณแม่พลอย"
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-pink-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              ชื่อเล่น
            </label>
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="กอล์ฟ / พลอย"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              เบอร์โทรศัพท์
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="081-xxxxxxx"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            อีเมล <span className="text-pink-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-pink-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              รหัสผ่าน <span className="text-pink-500">*</span>
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="ขั้นต่ำ 6 ตัว"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              ยืนยันรหัสผ่าน <span className="text-pink-500">*</span>
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="ยืนยันรหัส"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-sky-400 via-pink-400 to-amber-400 hover:opacity-95 text-white shadow-md shadow-pink-200/50 transition-all flex items-center justify-center gap-2 mt-4"
        >
          {loading ? 'กำลังลงทะเบียน...' : 'สมัครสมาชิกเพื่อรับ Member ID'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="pt-2 text-center text-xs text-slate-500">
        มีบัญชีสมาชิกอยู่แล้ว?{' '}
        <button
          onClick={() => setCurrentTab('login')}
          className="font-bold text-pink-600 dark:text-pink-400 hover:underline"
        >
          เข้าสู่ระบบที่นี่
        </button>
      </div>
    </div>
  );
};
