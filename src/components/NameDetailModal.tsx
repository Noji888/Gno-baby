import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Copy, 
  Share2, 
  Volume2, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  Check, 
  BookOpen, 
  Calendar, 
  Star,
  FileText
} from 'lucide-react';
import { BabyName, DayOfWeek } from '../types';
import { storage } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { analyzeNameThaksa } from '../services/thaksaCalculator';

interface NameDetailModalProps {
  name: BabyName | null;
  onClose: () => void;
  defaultDay?: DayOfWeek;
}

const ALL_DAYS: { id: DayOfWeek; label: string; color: string }[] = [
  { id: 'sunday', label: 'อาทิตย์', color: 'text-red-500 bg-red-50' },
  { id: 'monday', label: 'จันทร์', color: 'text-yellow-600 bg-yellow-50' },
  { id: 'tuesday', label: 'อังคาร', color: 'text-pink-500 bg-pink-50' },
  { id: 'wednesday_day', label: 'พุธ (กลางวัน)', color: 'text-emerald-600 bg-emerald-50' },
  { id: 'wednesday_night', label: 'พุธ (กลางคืน)', color: 'text-indigo-600 bg-indigo-50' },
  { id: 'thursday', label: 'พฤหัสฯ', color: 'text-orange-500 bg-orange-50' },
  { id: 'friday', label: 'ศุกร์', color: 'text-cyan-600 bg-cyan-50' },
  { id: 'saturday', label: 'เสาร์', color: 'text-purple-600 bg-purple-50' }
];

export const NameDetailModal: React.FC<NameDetailModalProps> = ({ name, onClose, defaultDay = 'monday' }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [activeDay, setActiveDay] = useState<DayOfWeek>(defaultDay);
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  if (!name) return null;

  const isFav = currentUser ? storage.isFavorite(currentUser.id, name.id) : false;
  const thaksa = analyzeNameThaksa(name.name, activeDay);

  // Load user note if exists
  React.useEffect(() => {
    if (currentUser) {
      const fav = storage.getFavorites(currentUser.id).find(f => f.babyNameId === name.id);
      if (fav && fav.note) setNote(fav.note);
    }
  }, [name, currentUser]);

  const handleCopy = () => {
    const text = `ชื่อมงคล: ${name.name} [${name.reading}]\nความหมาย: ${name.meaning}\nราศี: ${name.zodiacSign}\nแนะนำตามทักษาสำหรับ: ${thaksa.dayThaiName}\nผลวิเคราะห์: ${thaksa.summaryReason}\nที่มา: GNO BABY ระบบตั้งชื่อเด็กตามวันเกิดและราศี`;
    navigator.clipboard.writeText(text);
    showToast(`คัดลอกข้อมูลชื่อ "${name.name}" สำเร็จแล้ว`, 'success');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `ชื่อมงคล ${name.name} - GNO BABY`,
        text: `${name.name} [${name.reading}] ความหมาย: ${name.meaning}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(name.name);
      utterance.lang = 'th-TH';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleFavoriteToggle = () => {
    if (!currentUser) {
      showToast('กรุณาเข้าสู่ระบบเพื่อบันทึกชื่อโปรด', 'info');
      return;
    }
    const res = storage.toggleFavorite(currentUser.id, name.id, note);
    if (res) showToast(`บันทึกชื่อ "${name.name}" ลงรายการโปรดแล้ว`, 'success');
    else showToast(`นำชื่อ "${name.name}" ออกจากรายการโปรดแล้ว`, 'info');
  };

  const handleSaveNote = () => {
    if (!currentUser) return;
    setSavingNote(true);
    storage.updateFavoriteNote(currentUser.id, name.id, note);
    setTimeout(() => {
      setSavingNote(false);
      showToast('บันทึกบันทึกส่วนตัวเรียบร้อยแล้ว', 'success');
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in-50">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-pink-100 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95"
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-sky-50/50 via-pink-50/50 to-amber-50/50 dark:from-slate-800/50 dark:to-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-300 via-pink-300 to-amber-200 flex items-center justify-center text-2xl shadow-sm">
              {name.gender === 'boy' ? '👦' : name.gender === 'girl' ? '👧' : '👶'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 font-['Prompt']">
                  {name.name}
                </h2>
                <button
                  onClick={handleSpeak}
                  title="ฟังเสียงอ่าน"
                  className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-pink-500 transition-colors"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs font-semibold text-pink-600 dark:text-pink-400">
                คำอ่าน: [{name.reading}] • {name.syllables} พยางค์ • ขึ้นต้นด้วย "{name.startingLetter}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleFavoriteToggle}
              className={`p-2.5 rounded-2xl border transition-all ${
                isFav
                  ? 'bg-rose-50 border-rose-300 text-rose-500 dark:bg-rose-950 dark:border-rose-800 fill-current'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BODY SCROLL */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* MEANING & ORIGIN */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-sky-500" />
              ความหมายและรากศัพท์ภาษาไทย
            </div>
            <p className="text-base font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
              {name.meaning}
            </p>
            {name.origin && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">รากศัพท์:</span> {name.origin}
              </p>
            )}
          </div>

          {/* DAY PICKER FOR THAKSA */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-pink-500" />
                ตรวจสอบความมงคลตามวันเกิด (หลักทักษาปกรณ์):
              </label>
              <span className="text-xs font-mono font-bold text-pink-600 dark:text-pink-400">
                คะแนนมงคล: {thaksa.score}%
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {ALL_DAYS.map(d => (
                <button
                  key={d.id}
                  onClick={() => setActiveDay(d.id)}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all text-center border ${
                    activeDay === d.id
                      ? 'bg-slate-900 text-white dark:bg-pink-500 dark:text-white border-transparent shadow-sm scale-105'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-pink-300'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* THAKSA ANALYSIS RESULT CARD */}
          <div className={`p-4 rounded-2xl border ${
            thaksa.isKalakiniFree
              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
          }`}>
            <div className="flex items-start gap-3">
              {thaksa.isKalakiniFree ? (
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    สำหรับผู้เกิด{thaksa.dayThaiName}
                  </h4>
                  {thaksa.isKalakiniFree ? (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 font-bold">
                      มงคล ไร้กาลกิณี
                    </span>
                  ) : (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 font-bold">
                      มีอักษรกาลกิณี
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {thaksa.summaryReason}
                </p>
              </div>
            </div>

            {/* LETTER CATEGORY BREAKDOWN TABLE */}
            <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-800/80">
                <span className="text-slate-400 block text-[10px]">หมวดศรี (โชคลาภ)</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {thaksa.categoryBreakdown.sri.join(', ') || '-'}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-800/80">
                <span className="text-slate-400 block text-[10px]">หมวดเดช (อำนาจ)</span>
                <span className="font-bold text-red-600 dark:text-red-400">
                  {thaksa.categoryBreakdown.dej.join(', ') || '-'}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-800/80">
                <span className="text-slate-400 block text-[10px]">หมวดมนตรี (ผู้อุปถัมภ์)</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {thaksa.categoryBreakdown.montri.join(', ') || '-'}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-800/80">
                <span className="text-slate-400 block text-[10px]">กาลกิณี (ควรเลี่ยง)</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {thaksa.categoryBreakdown.kalakini.join(', ') || 'ไม่มี (ดีมาก)'}
                </span>
              </div>
            </div>
          </div>

          {/* ASTROLOGY TAGS & ZODIAC */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              สมพงศ์กับ {name.zodiacSign}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-xs font-semibold text-sky-800 dark:text-sky-300">
              ค้นหาแล้ว {name.searchCount} ครั้ง
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-800 dark:text-rose-300">
              มีคนบันทึก {name.favoriteCount} ครั้ง
            </span>
          </div>

          {/* PRIVATE NOTE (FOR MEMBERS) */}
          {currentUser && (
            <div className="p-4 rounded-2xl bg-pink-50/50 dark:bg-slate-800 border border-pink-100 dark:border-slate-700 space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-pink-500" />
                บันทึกความทรงจำ / โน้ตส่วนตัวสำหรับชื่อนี้:
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="เช่น: ชื่อนี้คุณยายชอบมาก, วางแผนจะใช้กับน้องคนแรก..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-pink-400"
                rows={2}
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSaveNote}
                  disabled={savingNote}
                  className="px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  {savingNote ? 'กำลังบันทึก...' : 'บันทึกโน้ต'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
          <p className="text-[11px] text-slate-400 italic">
            * ผลลัพธ์อิงตามคัมภีร์ทักษาปกรณ์โหราศาสตร์ไทย
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              คัดลอกข้อมูลชื่อ
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
