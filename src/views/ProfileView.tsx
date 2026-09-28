import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Heart, Search, Clock, Save, Trash2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storageService';
import { useToast } from '../components/Toast';

interface ProfileViewProps {
  setCurrentTab: (tab: string) => void;
  onNavigateToSearch: (options?: any) => void;
}

const AVATAR_OPTIONS = ['👶', '👦', '👧', '👨‍👩‍👧', '👨‍👩‍👦', '🤰', '🤱', '⭐', '🍼', '🧸'];

export const ProfileView: React.FC<ProfileViewProps> = ({ setCurrentTab, onNavigateToSearch }) => {
  const { currentUser, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(currentUser?.name || '');
  const [nickname, setNickname] = useState(currentUser?.nickname || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [expectedDueDate, setExpectedDueDate] = useState(currentUser?.expectedDueDate || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '👶');

  if (!currentUser) {
    return (
      <div className="text-center py-20">
        <p>กรุณาเข้าสู่ระบบ</p>
      </div>
    );
  }

  const searchHistory = storage.getSearchHistory(currentUser.id);
  const favorites = storage.getFavorites(currentUser.id);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = updateProfile({
      name,
      nickname,
      phone,
      expectedDueDate,
      avatar
    });
    if (ok) {
      showToast('บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว', 'success');
    } else {
      showToast('บันทึกไม่สำเร็จ', 'error');
    }
  };

  const handleClearHistory = () => {
    storage.clearSearchHistory(currentUser.id);
    showToast('ล้างประวัติการค้นหาเรียบร้อยแล้ว', 'info');
  };

  const handleRepeatSearch = (item: typeof searchHistory[0]) => {
    onNavigateToSearch({
      gender: item.gender,
      day: item.dayOfWeek,
      keyword: item.keyword
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      
      {/* HEADER PROFILE CARD */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-pink-50 via-sky-50 to-amber-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 border border-pink-100 dark:border-slate-700 shadow-md flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-white dark:bg-slate-900 border border-pink-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-4xl shrink-0">
          {avatar}
        </div>
        <div className="text-center sm:text-left space-y-1 flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50 font-['Prompt']">
              {currentUser.name}
            </h1>
            <span className="px-3 py-0.5 rounded-full font-mono text-xs font-bold bg-pink-500 text-white shadow-xs">
              {currentUser.memberId}
            </span>
            {currentUser.role === 'admin' && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                แอดมิน
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {currentUser.email} • สมาชิกตั้งแต่ {new Date(currentUser.createdAt).toLocaleDateString('th-TH')}
          </p>
        </div>

        {/* QUICK STATS */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setCurrentTab('favorites')}
            className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center cursor-pointer hover:border-pink-300"
          >
            <span className="block text-xl font-black text-pink-600 dark:text-pink-400">{favorites.length}</span>
            <span className="text-[10px] text-slate-400 font-medium">ชื่อที่บันทึก</span>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center">
            <span className="block text-xl font-black text-sky-600 dark:text-sky-400">{searchHistory.length}</span>
            <span className="text-[10px] text-slate-400 font-medium">ครั้งที่ค้นหา</span>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE FORM */}
      <form onSubmit={handleSaveProfile} className="p-8 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700 shadow-md space-y-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-['Prompt']">
          แก้ไขข้อมูลโปรไฟล์
        </h2>

        {/* AVATAR SELECTOR */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            เลือกไอคอนโปรไฟล์
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {AVATAR_OPTIONS.map(opt => (
              <button
                type="button"
                key={opt}
                onClick={() => setAvatar(opt)}
                className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${
                  avatar === opt
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-950 scale-110 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:border-pink-300'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              ชื่อ - นามสกุล
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              ชื่อเล่น
            </label>
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden"
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
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              กำหนดคลอด หรือวันเกิดของลูก
            </label>
            <input
              type="date"
              value={expectedDueDate}
              onChange={e => setExpectedDueDate(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-pink-500 hover:bg-pink-600 text-white shadow-md transition-colors"
          >
            <Save className="w-4 h-4" />
            บันทึกการเปลี่ยนแปลง
          </button>
        </div>
      </form>

      {/* SEARCH HISTORY LOG SECTION */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-sky-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-['Prompt']">
              ประวัติการค้นหาชื่อมงคล ({searchHistory.length})
            </h2>
          </div>

          {searchHistory.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              ล้างประวัติ
            </button>
          )}
        </div>

        {searchHistory.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {searchHistory.map(item => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.keyword && (
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        "{item.keyword}"
                      </span>
                    )}
                    {item.gender && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {item.gender === 'boy' ? 'เด็กชาย' : item.gender === 'girl' ? 'เด็กหญิง' : 'ทุกเพศ'}
                      </span>
                    )}
                    {item.zodiac && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                        {item.zodiac}
                      </span>
                    )}
                    <span className="text-slate-400 text-[11px]">
                      ผลลัพธ์ {item.resultsCount} ชื่อ
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.timestamp).toLocaleString('th-TH')}
                  </span>
                </div>

                <button
                  onClick={() => handleRepeatSearch(item)}
                  className="flex items-center gap-1 font-bold text-sky-500 hover:underline shrink-0"
                >
                  ค้นหาซ้ำ
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-6">
            ยังไม่มีประวัติการค้นหา
          </p>
        )}
      </div>

    </div>
  );
};
