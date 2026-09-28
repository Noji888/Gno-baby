import React, { useState } from 'react';
import { X, Dices, Sparkles, Heart, Volume2, ArrowRight } from 'lucide-react';
import { BabyName, DayOfWeek, Gender } from '../types';
import { storage } from '../services/storageService';
import { useToast } from './Toast';
import { useAuth } from '../context/AuthContext';
import { analyzeNameThaksa } from '../services/thaksaCalculator';

interface RandomNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectName: (name: BabyName) => void;
}

export const RandomNameModal: React.FC<RandomNameModalProps> = ({ isOpen, onClose, onSelectName }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [gender, setGender] = useState<Gender>('unspecified');
  const [day, setDay] = useState<DayOfWeek>('monday');
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<BabyName | null>(null);

  if (!isOpen) return null;

  const handleSpin = () => {
    setIsSpinning(true);
    let allNames = storage.getBabyNames();

    if (gender !== 'unspecified') {
      allNames = allNames.filter(n => n.gender === gender);
    }

    // Filter by free of kalakini for the selected day if possible
    const luckyNames = allNames.filter(n => {
      const t = analyzeNameThaksa(n.name, day);
      return t.isKalakiniFree;
    });

    const candidatePool = luckyNames.length > 0 ? luckyNames : allNames;

    let iterations = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * candidatePool.length);
      setResult(candidatePool[randomIndex]);
      iterations++;
      if (iterations > 12) {
        clearInterval(interval);
        setIsSpinning(false);
        const finalName = candidatePool[Math.floor(Math.random() * candidatePool.length)];
        setResult(finalName);
        storage.incrementSearchCount(finalName.id);
      }
    }, 100);
  };

  const handleFavorite = () => {
    if (!currentUser || !result) {
      showToast('กรุณาเข้าสู่ระบบเพื่อบันทึกชื่อโปรด', 'info');
      return;
    }
    const isNow = storage.toggleFavorite(currentUser.id, result.id);
    if (isNow) showToast(`บันทึก "${result.name}" ในรายการโปรดแล้ว`, 'success');
    else showToast(`นำ "${result.name}" ออกจากรายการโปรดแล้ว`, 'info');
  };

  const handleSpeak = () => {
    if (result && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(result.name);
      u.lang = 'th-TH';
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in-50">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-pink-100 dark:border-slate-800 p-6 overflow-hidden animate-in zoom-in-95"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-purple-400 via-pink-400 to-amber-300 flex items-center justify-center text-white shadow-lg shadow-purple-200/50">
            <Dices className={`w-7 h-7 ${isSpinning ? 'animate-spin' : ''}`} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-slate-50 font-['Prompt']">
            สุ่มชื่อเด็กมงคล (Lucky Draw)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ค้นหาชื่อมงคลที่ฟ้าลิขิต ไร้อักษรกาลกิณี เสริมบารมีให้ลูกรัก
          </p>
        </div>

        {/* CONTROLS */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
              เพศของเด็ก
            </label>
            <select
              value={gender}
              onChange={e => setGender(e.target.value as Gender)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="unspecified">👶 ทุกเพศ (ชาย/หญิง)</option>
              <option value="boy">👦 เด็กผู้ชาย</option>
              <option value="girl">👧 เด็กผู้หญิง</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
              วันเกิดตามทักษา
            </label>
            <select
              value={day}
              onChange={e => setDay(e.target.value as DayOfWeek)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="sunday">วันอาทิตย์</option>
              <option value="monday">วันจันทร์</option>
              <option value="tuesday">วันอังคาร</option>
              <option value="wednesday_day">วันพุธ (กลางวัน)</option>
              <option value="wednesday_night">วันพุธ (กลางคืน)</option>
              <option value="thursday">วันพฤหัสบดี</option>
              <option value="friday">วันศุกร์</option>
              <option value="saturday">วันเสาร์</option>
            </select>
          </div>
        </div>

        {/* RESULT CARD */}
        {result ? (
          <div className="mb-6 p-5 rounded-2xl bg-gradient-to-tr from-pink-50 via-sky-50 to-amber-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 border border-pink-200 dark:border-slate-700 text-center animate-in zoom-in-95">
            <div className="inline-block px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-pink-200 dark:border-slate-700 text-[11px] font-bold text-pink-600 dark:text-pink-400 mb-2">
              ✨ ชื่อมงคลที่สุ่มได้ ✨
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-1">
              <h4 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 font-['Prompt']">
                {result.name}
              </h4>
              <button
                onClick={handleSpeak}
                className="text-slate-400 hover:text-pink-500 p-1"
                title="ฟังเสียงอ่าน"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-xs text-pink-600 dark:text-pink-400 font-medium mb-2">
              คำอ่าน: [{result.reading}] • {result.gender === 'boy' ? 'เด็กชาย' : 'เด็กหญิง'}
            </p>

            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed mb-4">
              {result.meaning}
            </p>

            <div className="flex items-center justify-center gap-2">
              <button
                onClick={handleFavorite}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-rose-500"
              >
                <Heart className="w-3.5 h-3.5" />
                บันทึกชื่อโปรด
              </button>
              <button
                onClick={() => {
                  onClose();
                  onSelectName(result);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900"
              >
                ดูรายละเอียดเต็ม
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
            <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-60" />
            <p className="text-xs text-slate-400">
              กดปุ่มด้านล่างเพื่อเริ่มหมุนวงล้อสุ่มชื่อเด็กมงคล
            </p>
          </div>
        )}

        {/* BUTTON */}
        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 hover:opacity-95 text-white shadow-lg shadow-pink-200/50 dark:shadow-none transition-all flex items-center justify-center gap-2"
        >
          <Dices className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
          {isSpinning ? 'กำลังสุ่มชื่อมงคล...' : result ? 'สุ่มใหม่อีกครั้ง' : 'เริ่มสุ่มชื่อมงคล'}
        </button>
      </div>
    </div>
  );
};
