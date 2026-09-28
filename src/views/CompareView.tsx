import React, { useState } from 'react';
import { GitCompare, X, Plus, Sparkles, CheckCircle2, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { BabyName, DayOfWeek } from '../types';
import { storage } from '../services/storageService';
import { useToast } from '../components/Toast';
import { analyzeNameThaksa } from '../services/thaksaCalculator';

interface CompareViewProps {
  onOpenDetails: (name: BabyName) => void;
  setCurrentTab: (tab: string) => void;
}

export const CompareView: React.FC<CompareViewProps> = ({ onOpenDetails, setCurrentTab }) => {
  const { showToast } = useToast();
  const [testDay, setTestDay] = useState<DayOfWeek>('monday');
  const [selectorOpen, setSelectorOpen] = useState(false);

  const compareIds = storage.getCompareList();
  const allNames = storage.getBabyNames();

  const compareNames = compareIds
    .map(id => allNames.find(n => n.id === id))
    .filter(n => n !== undefined) as BabyName[];

  const handleRemove = (id: string, name: string) => {
    storage.toggleCompare(id);
    showToast(`นำชื่อ "${name}" ออกจากตารางเปรียบเทียบแล้ว`, 'info');
  };

  const handleClearAll = () => {
    storage.clearCompareList();
    showToast('ล้างตารางเปรียบเทียบทั้งหมดแล้ว', 'info');
  };

  const handleAddFromSelector = (name: BabyName) => {
    storage.toggleCompare(name.id);
    setSelectorOpen(false);
    showToast(`เพิ่ม "${name.name}" ในตารางเปรียบเทียบแล้ว`, 'success');
  };

  return (
    <div className="space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitCompare className="w-7 h-7 text-indigo-500" />
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 font-['Prompt']">
              เปรียบเทียบชื่อเด็กที่สนใจ
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            เปรียบเทียบจุดเด่น ความหมาย จำนวนพยางค์ และความมงคลตามทักษาปกรณ์แบบเคียงข้างกัน (สูงสุด 4 ชื่อ)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {compareNames.length < 4 && (
            <button
              onClick={() => setSelectorOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-500 text-white shadow-md hover:bg-indigo-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              เพิ่มชื่อลงตาราง
            </button>
          )}

          {compareNames.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
            >
              ล้างทั้งหมด
            </button>
          )}
        </div>
      </div>

      {/* SELECTOR MODAL IF OPEN */}
      {selectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in-50">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                เลือกชื่อที่ต้องการเปรียบเทียบ
              </h3>
              <button onClick={() => setSelectorOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="overflow-y-auto space-y-2 pr-1">
              {allNames
                .filter(n => !compareIds.includes(n.id))
                .slice(0, 30)
                .map(n => (
                  <div
                    key={n.id}
                    onClick={() => handleAddFromSelector(n)}
                    className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div>
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                        {n.name}
                      </span>
                      <span className="text-xs text-slate-400 ml-2">[{n.reading}]</span>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{n.meaning}</p>
                    </div>
                    <span className="text-xs font-bold text-indigo-500">เลือก +</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* COMPARISON TABLE */}
      {compareNames.length > 0 ? (
        <div className="space-y-4">
          
          {/* TEST DAY PICKER */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              ทดสอบความมงคลกับวันเกิด:
            </span>
            <select
              value={testDay}
              onChange={e => setTestDay(e.target.value as DayOfWeek)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-semibold"
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

          <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md">
            <table className="w-full text-left border-collapse min-w-[650px]">
              
              {/* HEADER NAMES */}
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-4 w-40 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    หัวข้อ
                  </th>
                  {compareNames.map(name => (
                    <th key={name.id} className="p-4 text-center border-l border-slate-100 dark:border-slate-800 relative">
                      <button
                        onClick={() => handleRemove(name.id, name.name)}
                        className="absolute top-2 right-2 p-1 rounded-lg text-slate-400 hover:text-rose-500"
                        title="นำออก"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <h3 className="text-xl font-black text-slate-900 dark:text-slate-50 font-['Prompt']">
                        {name.name}
                      </h3>
                      <p className="text-xs text-pink-600 dark:text-pink-400 font-medium">
                        [{name.reading}]
                      </p>
                      <button
                        onClick={() => onOpenDetails(name)}
                        className="mt-2 text-[11px] font-bold text-indigo-500 hover:underline"
                      >
                        ดูรายละเอียด
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                
                {/* MEANING */}
                <tr>
                  <td className="p-4 font-bold text-slate-500 bg-slate-50/50 dark:bg-slate-800/40">
                    ความหมาย
                  </td>
                  {compareNames.map(n => (
                    <td key={n.id} className="p-4 border-l border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed">
                      {n.meaning}
                    </td>
                  ))}
                </tr>

                {/* GENDER */}
                <tr>
                  <td className="p-4 font-bold text-slate-500 bg-slate-50/50 dark:bg-slate-800/40">
                    เพศ
                  </td>
                  {compareNames.map(n => (
                    <td key={n.id} className="p-4 text-center border-l border-slate-100 dark:border-slate-800 font-bold">
                      {n.gender === 'boy' ? '👦 เด็กชาย' : '👧 เด็กหญิง'}
                    </td>
                  ))}
                </tr>

                {/* SYLLABLES */}
                <tr>
                  <td className="p-4 font-bold text-slate-500 bg-slate-50/50 dark:bg-slate-800/40">
                    จำนวนพยางค์
                  </td>
                  {compareNames.map(n => (
                    <td key={n.id} className="p-4 text-center border-l border-slate-100 dark:border-slate-800 font-bold">
                      {n.syllables} พยางค์
                    </td>
                  ))}
                </tr>

                {/* STARTING LETTER */}
                <tr>
                  <td className="p-4 font-bold text-slate-500 bg-slate-50/50 dark:bg-slate-800/40">
                    อักษรต้น
                  </td>
                  {compareNames.map(n => (
                    <td key={n.id} className="p-4 text-center border-l border-slate-100 dark:border-slate-800 font-bold text-sm text-pink-500">
                      {n.startingLetter}
                    </td>
                  ))}
                </tr>

                {/* ZODIAC */}
                <tr>
                  <td className="p-4 font-bold text-slate-500 bg-slate-50/50 dark:bg-slate-800/40">
                    ราศีที่เกี่ยวข้อง
                  </td>
                  {compareNames.map(n => (
                    <td key={n.id} className="p-4 text-center border-l border-slate-100 dark:border-slate-800 font-medium">
                      {n.zodiacSign}
                    </td>
                  ))}
                </tr>

                {/* THAKSA SCORE FOR TEST DAY */}
                <tr>
                  <td className="p-4 font-bold text-slate-500 bg-slate-50/50 dark:bg-slate-800/40">
                    คะแนนมงคล (ทักษา)
                  </td>
                  {compareNames.map(n => {
                    const t = analyzeNameThaksa(n.name, testDay);
                    return (
                      <td key={n.id} className="p-4 text-center border-l border-slate-100 dark:border-slate-800">
                        <span className={`inline-block px-3 py-1 rounded-full font-black text-xs ${
                          t.isKalakiniFree
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {t.score}% {t.isKalakiniFree ? '✓ ไร้กาลกิณี' : '✕ มีกาลกิณี'}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                {/* THAKSA REASON */}
                <tr>
                  <td className="p-4 font-bold text-slate-500 bg-slate-50/50 dark:bg-slate-800/40">
                    เหตุผลตามหลักทักษา
                  </td>
                  {compareNames.map(n => {
                    const t = analyzeNameThaksa(n.name, testDay);
                    return (
                      <td key={n.id} className="p-4 border-l border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                        {t.summaryReason}
                      </td>
                    );
                  })}
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-16 text-center rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-3xl">
            ⚖️
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            ยังไม่มีชื่อในตารางเปรียบเทียบ
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            กดปุ่มไอคอนเปรียบเทียบบนการ์ดชื่อ เพื่อนำชื่อที่คุณสนใจมาดูข้อดีข้อเด่นคู่กันในหน้านี้
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentTab('search')}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-indigo-500 text-white shadow-md hover:bg-indigo-600 transition-colors"
            >
              ไปเลือกชื่อในหน้าค้นหา
            </button>
            <button
              onClick={() => setSelectorOpen(true)}
              className="px-6 py-2.5 rounded-xl font-bold text-xs border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            >
              เลือกจากฐานข้อมูล
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
