import React, { useState, useMemo } from 'react';
import { Flame, Trophy, Heart, Search, Star, ArrowUpRight } from 'lucide-react';
import { BabyName } from '../types';
import { storage } from '../services/storageService';
import { NameCard } from '../components/NameCard';

interface PopularViewProps {
  onOpenDetails: (name: BabyName) => void;
}

export const PopularView: React.FC<PopularViewProps> = ({ onOpenDetails }) => {
  const [filterGender, setFilterGender] = useState<'all' | 'boy' | 'girl'>('all');
  const [filterRankBy, setFilterRankBy] = useState<'favorites' | 'searches'>('favorites');

  const names = storage.getBabyNames();

  const sortedNames = useMemo(() => {
    let list = [...names];
    if (filterGender !== 'all') {
      list = list.filter(n => n.gender === filterGender);
    }
    return list.sort((a, b) => {
      if (filterRankBy === 'favorites') {
        return (b.favoriteCount || 0) - (a.favoriteCount || 0);
      }
      return (b.searchCount || 0) - (a.searchCount || 0);
    });
  }, [names, filterGender, filterRankBy]);

  return (
    <div className="space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-7 h-7 text-amber-500" />
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 font-['Prompt']">
              อันดับชื่อมงคลยอดนิยม (Top Rankings)
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            จัดอันดับชื่อเด็กภาษาไทยตามจำนวนการบันทึกเป็นชื่อโปรดและการค้นหาของคุณพ่อคุณแม่
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* GENDER TABS */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setFilterGender('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterGender === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-500'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setFilterGender('boy')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterGender === 'boy' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              👦 ชาย
            </button>
            <button
              onClick={() => setFilterGender('girl')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterGender === 'girl' ? 'bg-pink-500 text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              👧 หญิง
            </button>
          </div>

          {/* CRITERIA */}
          <select
            value={filterRankBy}
            onChange={e => setFilterRankBy(e.target.value as any)}
            className="text-xs py-2 px-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
          >
            <option value="favorites">จัดตาม: บันทึกโปรดมากที่สุด</option>
            <option value="searches">จัดตาม: ค้นหาบ่อยที่สุด</option>
          </select>
        </div>
      </div>

      {/* TOP 3 PODIUM */}
      {sortedNames.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          
          {/* 2ND PLACE */}
          <div 
            onClick={() => onOpenDetails(sortedNames[1])}
            className="p-6 rounded-3xl bg-gradient-to-b from-slate-100 to-white dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 shadow-md cursor-pointer hover:scale-102 transition-transform text-center relative order-2 md:order-1"
          >
            <div className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-3 shadow-md">
              🥈 2
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-50 font-['Prompt']">
              {sortedNames[1].name}
            </h3>
            <p className="text-xs text-pink-500 font-medium mb-2">
              [{sortedNames[1].reading}]
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
              {sortedNames[1].meaning}
            </p>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              ❤️ {sortedNames[1].favoriteCount} บันทึก • 🔍 {sortedNames[1].searchCount} ค้นหา
            </span>
          </div>

          {/* 1ST PLACE */}
          <div 
            onClick={() => onOpenDetails(sortedNames[0])}
            className="p-7 rounded-3xl bg-gradient-to-b from-amber-100 via-yellow-50 to-white dark:from-amber-950/60 dark:via-slate-800 dark:to-slate-900 border-2 border-amber-300 dark:border-amber-700 shadow-xl cursor-pointer hover:scale-102 transition-transform text-center relative order-1 md:order-2 -translate-y-2"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-white font-black text-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-300/50">
              🥇 1
            </div>
            <div className="inline-block px-3 py-0.5 rounded-full bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200 text-[10px] font-black uppercase mb-1">
              ยอดนิยมอันดับ 1
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-slate-50 font-['Prompt']">
              {sortedNames[0].name}
            </h3>
            <p className="text-xs text-pink-600 dark:text-pink-400 font-medium mb-2">
              [{sortedNames[0].reading}]
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
              {sortedNames[0].meaning}
            </p>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
              ❤️ {sortedNames[0].favoriteCount} บันทึก • 🔍 {sortedNames[0].searchCount} ค้นหา
            </span>
          </div>

          {/* 3RD PLACE */}
          <div 
            onClick={() => onOpenDetails(sortedNames[2])}
            className="p-6 rounded-3xl bg-gradient-to-b from-orange-50 to-white dark:from-slate-800 dark:to-slate-900 border border-orange-200 dark:border-slate-700 shadow-md cursor-pointer hover:scale-102 transition-transform text-center relative order-3"
          >
            <div className="w-10 h-10 rounded-full bg-amber-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-3 shadow-md">
              🥉 3
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-50 font-['Prompt']">
              {sortedNames[2].name}
            </h3>
            <p className="text-xs text-pink-500 font-medium mb-2">
              [{sortedNames[2].reading}]
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
              {sortedNames[2].meaning}
            </p>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              ❤️ {sortedNames[2].favoriteCount} บันทึก • 🔍 {sortedNames[2].searchCount} ค้นหา
            </span>
          </div>

        </div>
      )}

      {/* ALL REMAINING RANKINGS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sortedNames.slice(3).map((name, idx) => (
          <div key={name.id} className="relative">
            <div className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-slate-800 dark:bg-slate-700 text-white font-mono text-xs flex items-center justify-center font-bold">
              {idx + 4}
            </div>
            <NameCard name={name} onOpenDetails={onOpenDetails} />
          </div>
        ))}
      </div>

    </div>
  );
};
