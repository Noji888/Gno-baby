import React, { useState } from 'react';
import { Heart, Trash2, Edit3, GitCompare, Share2, Download, AlertCircle, ArrowRight } from 'lucide-react';
import { BabyName } from '../types';
import { storage } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { NameCard } from '../components/NameCard';

interface FavoritesViewProps {
  onOpenDetails: (name: BabyName) => void;
  setCurrentTab: (tab: string) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({ onOpenDetails, setCurrentTab }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-3xl bg-white dark:bg-slate-800 border border-pink-100 dark:border-slate-700 text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-pink-100 dark:bg-pink-950 flex items-center justify-center text-3xl">
          ❤️
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 font-['Prompt']">
          เข้าสู่ระบบเพื่อดูชื่อที่บันทึก
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          สมาชิก GNO BABY สามารถบันทึกชื่อเด็กที่ชื่นชอบ จดโน้ตความประทับใจ และเปรียบเทียบชื่อได้สะดวก
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={() => setCurrentTab('login')}
            className="w-full py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-sky-400 via-pink-400 to-amber-400 text-white shadow-md hover:opacity-95"
          >
            เข้าสู่ระบบสมาชิก
          </button>
          <button
            onClick={() => setCurrentTab('register')}
            className="w-full py-2.5 rounded-2xl font-bold text-xs border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            สมัครสมาชิกใหม่
          </button>
        </div>
      </div>
    );
  }

  const favorites = storage.getFavorites(currentUser.id);
  const allNames = storage.getBabyNames();

  const favoriteNames = favorites.map(fav => {
    const item = allNames.find(n => n.id === fav.babyNameId);
    return {
      fav,
      item
    };
  }).filter(entry => entry.item !== undefined) as { fav: typeof favorites[0]; item: BabyName }[];

  const handleRemove = (nameId: string, nameThai: string) => {
    storage.toggleFavorite(currentUser.id, nameId);
    showToast(`ลบชื่อ "${nameThai}" ออกจากรายการโปรดแล้ว`, 'info');
  };

  const handleSaveNote = (nameId: string) => {
    storage.updateFavoriteNote(currentUser.id, nameId, tempNote);
    setEditingNoteId(null);
    showToast('บันทึกโน้ตสำเร็จแล้ว', 'success');
  };

  const handleExportText = () => {
    if (favoriteNames.length === 0) return;
    const text = favoriteNames.map((entry, idx) => 
      `${idx + 1}. ${entry.item.name} [${entry.item.reading}]\nความหมาย: ${entry.item.meaning}\nโน้ต: ${entry.fav.note || '-'}\n`
    ).join('\n---\n');

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GNO_BABY_favorites_${currentUser.memberId}.txt`;
    a.click();
    showToast('ดาวน์โหลดรายการชื่อโปรดแล้ว', 'success');
  };

  return (
    <div className="space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 font-['Prompt']">
              ชื่อที่บันทึกไว้ ({favoriteNames.length} ชื่อ)
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            รายการชื่อที่คุณพ่อคุณแม่ถูกใจ พร้อมบันทึกข้อความส่วนตัวของครอบครัว
          </p>
        </div>

        {favoriteNames.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentTab('compare')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
            >
              <GitCompare className="w-3.5 h-3.5" />
              เปรียบเทียบชื่อในตาราง
            </button>
            <button
              onClick={handleExportText}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              ส่งออกเป็นไฟล์
            </button>
          </div>
        )}
      </div>

      {/* LIST */}
      {favoriteNames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {favoriteNames.map(({ fav, item }) => (
            <div key={item.id} className="flex flex-col justify-between p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-pink-100 dark:border-slate-700 shadow-xs space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300">
                      {item.gender === 'boy' ? '👦 ชาย' : '👧 หญิง'}
                    </span>
                    <h3 
                      onClick={() => onOpenDetails(item)}
                      className="text-2xl font-bold text-slate-900 dark:text-slate-50 font-['Prompt'] mt-1 cursor-pointer hover:text-pink-500 transition-colors"
                    >
                      {item.name}
                    </h3>
                    <p className="text-xs text-pink-600 dark:text-pink-400 font-medium">
                      คำอ่าน: [{item.reading}]
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleRemove(item.id, item.name)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                    title="ลบออกจากรายการโปรด"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-3">
                  {item.meaning}
                </p>

                {/* PERSONAL NOTE BOX */}
                <div className="p-3 rounded-2xl bg-pink-50/50 dark:bg-slate-900 border border-pink-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                      โน้ตส่วนตัว
                    </span>
                    {editingNoteId !== item.id && (
                      <button
                        onClick={() => {
                          setEditingNoteId(item.id);
                          setTempNote(fav.note || '');
                        }}
                        className="text-slate-400 hover:text-pink-500"
                        title="แก้ไขโน้ต"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {editingNoteId === item.id ? (
                    <div className="space-y-2 mt-1">
                      <textarea
                        value={tempNote}
                        onChange={e => setTempNote(e.target.value)}
                        placeholder="พิมพ์โน้ตส่วนตัวที่นี่..."
                        rows={2}
                        className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="px-2 py-1 text-[11px] rounded-lg text-slate-400 hover:bg-slate-100"
                        >
                          ยกเลิก
                        </button>
                        <button
                          onClick={() => handleSaveNote(item.id)}
                          className="px-2.5 py-1 text-[11px] rounded-lg bg-pink-500 text-white font-bold"
                        >
                          บันทึก
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-600 dark:text-slate-300 italic text-[11px]">
                      {fav.note || '(ยังไม่ได้เขียนโน้ต คลิกที่ไอคอนดินสอเพื่อเพิ่ม)'}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-700 text-xs">
                <span className="text-slate-400 text-[11px]">
                  {item.zodiacSign}
                </span>
                <button
                  onClick={() => onOpenDetails(item)}
                  className="flex items-center gap-1 font-bold text-pink-600 dark:text-pink-400 hover:underline"
                >
                  ดูรายละเอียด
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-pink-50 dark:bg-pink-950 flex items-center justify-center text-3xl">
            🤍
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            ยังไม่มีชื่อที่บันทึกไว้
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            กดปุ่มรูปหัวใจบนการ์ดชื่อเด็กที่ชอบในหน้าค้นหา เพื่อรวบรวมรายชื่อไว้เปรียบเทียบในหน้านี้
          </p>
          <button
            onClick={() => setCurrentTab('search')}
            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-pink-500 text-white shadow-md hover:bg-pink-600 transition-colors"
          >
            ไปหน้าค้นหาชื่อมงคล
          </button>
        </div>
      )}

    </div>
  );
};
