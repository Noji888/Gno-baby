import React from 'react';
import { Heart, Copy, GitCompare, Sparkles, Volume2, ShieldCheck, Check } from 'lucide-react';
import { BabyName, DayOfWeek } from '../types';
import { storage } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { analyzeNameThaksa } from '../services/thaksaCalculator';

interface NameCardProps {
  name: BabyName;
  onOpenDetails: (name: BabyName) => void;
  selectedDay?: DayOfWeek;
}

export const NameCard: React.FC<NameCardProps> = ({ name, onOpenDetails, selectedDay }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const isFav = currentUser ? storage.isFavorite(currentUser.id, name.id) : false;
  const isCompared = storage.getCompareList().includes(name.id);

  const thaksa = selectedDay ? analyzeNameThaksa(name.name, selectedDay) : null;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `${name.name} (คำอ่าน: ${name.reading})\nความหมาย: ${name.meaning}\nหมวดหมู่: ${getCategoryLabel(name.category)}`;
    navigator.clipboard.writeText(text);
    showToast(`คัดลอกชื่อ "${name.name}" พร้อมความหมายแล้ว`, 'success');
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      showToast('กรุณาเข้าสู่ระบบเพื่อบันทึกชื่อโปรด', 'info');
      return;
    }
    const nowFav = storage.toggleFavorite(currentUser.id, name.id);
    if (nowFav) {
      showToast(`บันทึกชื่อ "${name.name}" ลงในรายการโปรดแล้ว`, 'success');
    } else {
      showToast(`นำชื่อ "${name.name}" ออกจากรายการโปรดแล้ว`, 'info');
    }
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const added = storage.toggleCompare(name.id);
    if (added) {
      showToast(`เพิ่ม "${name.name}" ในตารางเปรียบเทียบแล้ว`, 'success');
    } else {
      showToast(`นำ "${name.name}" ออกจากตารางเปรียบเทียบแล้ว`, 'info');
    }
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(name.name);
      utterance.lang = 'th-TH';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      showToast(`คำอ่าน: ${name.reading}`, 'info');
    }
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      success: 'ความสำเร็จ',
      love: 'ความรัก',
      wisdom: 'ความฉลาด/ปัญญา',
      wealth: 'ความมั่งคั่ง',
      happiness: 'ความสุข',
      health: 'สุขภาพแข็งแรง',
      honor: 'เกียรติยศ/อำนาจ',
      prosperity: 'ความเจริญก้าวหน้า'
    };
    return labels[cat] || cat;
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'wealth': return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'love': return 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300 border-pink-200 dark:border-pink-800';
      case 'wisdom': return 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-200 dark:border-sky-800';
      case 'honor': return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'health': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'happiness': return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default: return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    }
  };

  return (
    <div
      onClick={() => {
        storage.incrementSearchCount(name.id);
        onOpenDetails(name);
      }}
      className="group relative bg-white dark:bg-slate-800/90 rounded-3xl p-5 border border-pink-100/80 dark:border-slate-700/80 shadow-xs hover:shadow-xl hover:shadow-pink-100/50 dark:hover:shadow-none hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* TOP ROW: BADGES & ACTIONS */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* GENDER BADGE */}
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                name.gender === 'boy'
                  ? 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                  : name.gender === 'girl'
                  ? 'bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300 border-pink-200 dark:border-pink-800'
                  : 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800'
              }`}
            >
              {name.gender === 'boy' ? '👦 ชาย' : name.gender === 'girl' ? '👧 หญิง' : '👶 ไม่ระบุ'}
            </span>

            {/* SYLLABLE */}
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
              {name.syllables} พยางค์
            </span>

            {/* ZODIAC */}
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-medium border border-amber-100 dark:border-amber-900">
              {name.zodiacSign}
            </span>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleCompare}
              title={isCompared ? 'นำออกจากการเปรียบเทียบ' : 'เพิ่มในตารางเปรียบเทียบ'}
              className={`p-1.5 rounded-xl border transition-colors ${
                isCompared
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-600 dark:bg-indigo-950 dark:border-indigo-700 dark:text-indigo-300'
                  : 'border-slate-100 dark:border-slate-700 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950'
              }`}
            >
              <GitCompare className="w-4 h-4" />
            </button>

            <button
              onClick={handleFavorite}
              title={isFav ? 'นำออกจากชื่อที่บันทึก' : 'บันทึกเป็นชื่อโปรด'}
              className={`p-1.5 rounded-xl border transition-colors ${
                isFav
                  ? 'bg-rose-50 border-rose-300 text-rose-500 dark:bg-rose-950 dark:border-rose-700 dark:text-rose-400 fill-rose-500'
                  : 'border-slate-100 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* THAI NAME & READING */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50 font-['Prompt'] group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
              {name.name}
            </h3>
            <button
              onClick={handleSpeak}
              title="ฟังเสียงอ่าน"
              className="text-slate-400 hover:text-pink-500 transition-colors p-1"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-pink-600 dark:text-pink-400 font-medium">
            คำอ่าน: [{name.reading}]
          </p>
        </div>

        {/* MEANING */}
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 leading-relaxed font-normal">
          {name.meaning}
        </p>
      </div>

      {/* FOOTER OF CARD */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
        <span className={`px-2.5 py-1 rounded-xl font-medium border ${getCategoryColor(name.category)}`}>
          {getCategoryLabel(name.category)}
        </span>

        {/* THAKSA MINI INDICATOR IF SELECTED DAY */}
        {thaksa ? (
          <div className="flex items-center gap-1">
            {thaksa.isKalakiniFree ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                ไร้กาลกิณี ({thaksa.score}%)
              </span>
            ) : (
              <span className="text-[11px] font-medium text-rose-500 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-800">
                มีกาลกิณี
              </span>
            )}
          </div>
        ) : (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors py-1 px-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>คัดลอก</span>
          </button>
        )}
      </div>
    </div>
  );
};
