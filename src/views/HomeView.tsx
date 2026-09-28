import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  Heart, 
  ShieldCheck, 
  Flame, 
  Dices, 
  Star, 
  ArrowRight, 
  Compass, 
  BookOpen, 
  Users, 
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { storage } from '../services/storageService';
import { BabyName } from '../types';
import { NameCard } from '../components/NameCard';

interface HomeViewProps {
  onNavigateToSearch: (options?: { gender?: string; day?: string; keyword?: string }) => void;
  onOpenDetails: (name: BabyName) => void;
  onOpenRandom: () => void;
  setCurrentTab: (tab: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ 
  onNavigateToSearch, 
  onOpenDetails, 
  onOpenRandom,
  setCurrentTab 
}) => {
  const [keyword, setKeyword] = useState('');

  const names = storage.getBabyNames();
  // Get top 6 popular names
  const popularNames = [...names]
    .sort((a, b) => (b.favoriteCount + b.searchCount) - (a.favoriteCount + a.searchCount))
    .slice(0, 6);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateToSearch({ keyword });
  };

  return (
    <div className="space-y-16">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-pink-100/60 via-sky-50/50 to-white dark:from-slate-800/80 dark:via-slate-900/50 dark:to-slate-900 border border-pink-100 dark:border-slate-800 p-8 sm:p-14 text-center">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-pink-300/30 dark:bg-pink-900/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-sky-300/30 dark:bg-sky-900/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto space-y-6">
          
          {/* BADGE */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-pink-200 dark:border-slate-700 shadow-xs">
            <span className="text-base">✨</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              เว็บไซต์แนะนำชื่อเด็กภาษาไทยตามหลักโหราศาสตร์ทักษาปกรณ์
            </span>
          </div>

          {/* MAIN HEADING */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-50 font-['Prompt'] tracking-tight leading-tight">
            ตั้งชื่อลูกน้อยอันเป็นที่รัก
            <span className="block mt-1 bg-gradient-to-r from-sky-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">
              เสริมสิริมงคลตามวันเกิดและราศี
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            รวบรวม 200 ชื่อภาษาไทยแท้พร้อมความหมายลึกซึ้ง คำนวณอักษรศรี เดช มนตรี และกาลกิณีตามวันเกิด 8 วัน และ 12 ราศี ให้คุณพ่อคุณแม่เลือกชื่อที่ดีที่สุดแด่แก้วตาดวงใจ
          </p>

          {/* SEARCH BAR */}
          <form onSubmit={handleQuickSearch} className="max-w-xl mx-auto flex items-center gap-2 p-2 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-pink-200/80 dark:border-slate-700">
            <div className="pl-3 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="ค้นหาชื่อ, คำอ่าน หรือความหมาย เช่น ปัญญา, มั่งคั่ง..."
              className="w-full text-sm py-2 px-2 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-sky-400 via-pink-400 to-amber-400 text-white shadow-md hover:opacity-95 transition-opacity shrink-0"
            >
              ค้นหาชื่อ
            </button>
          </form>

          {/* QUICK BUTTONS */}
          <div className="flex items-center justify-center gap-2 flex-wrap text-xs pt-2">
            <span className="text-slate-400 font-medium">ค้นหาด่วน:</span>
            <button
              onClick={() => onNavigateToSearch({ gender: 'boy' })}
              className="px-3 py-1 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-medium hover:bg-sky-200 transition-colors"
            >
              👦 ชื่อเด็กผู้ชาย
            </button>
            <button
              onClick={() => onNavigateToSearch({ gender: 'girl' })}
              className="px-3 py-1 rounded-xl bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 font-medium hover:bg-pink-200 transition-colors"
            >
              👧 ชื่อเด็กผู้หญิง
            </button>
            <button
              onClick={onOpenRandom}
              className="px-3 py-1 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-medium hover:bg-purple-200 transition-colors flex items-center gap-1"
            >
              <Dices className="w-3.5 h-3.5" />
              สุ่มชื่อมงคล
            </button>
          </div>
        </div>
      </section>

      {/* 4 HIGHLIGHT PILLARS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center text-xl">
            📜
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            หลักทักษาปกรณ์ 8 วัน
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            คัดกรองอักษรบริวาร อายุ เดช ศรี มูละ อุตสาหะ มนตรี และคัดอักษรกาลกิณีออกอย่างแม่นยำ
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-600 flex items-center justify-center text-xl">
            ♈
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            สมพงศ์ 12 ราศีเกิด
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            เชื่อมโยงธาตุประจำตัว ดิน น้ำ ลม ไฟ พร้อมดาวครองเรือนเสริมบารมีลูกน้อย
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-950 text-pink-600 flex items-center justify-center text-xl">
            💎
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            ฐานข้อมูล 200 ชื่อแท้
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            ชาย 100 ชื่อ และหญิง 100 ชื่อ ตรวจสอบรากศัพท์บาลี-สันสกฤตทุกชื่ออย่างถูกต้อง
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center text-xl">
            👨‍👩‍👧
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            ระบบสมาชิกและบันทึก
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            บันทึกชื่อที่ชอบ เปรียบเทียบชื่อข้างเคียง และจดโน้ตส่วนตัวของครอบครัว
          </p>
        </div>
      </section>

      {/* POPULAR NAMES PREVIEW */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 font-['Prompt']">
                ชื่อมงคลยอดนิยม
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              ชื่อเด็กภาษาไทยที่มีผู้ค้นหาและบันทึกไว้ในระบบมากที่สุด
            </p>
          </div>

          <button
            onClick={() => setCurrentTab('popular')}
            className="flex items-center gap-1.5 text-xs font-bold text-pink-600 dark:text-pink-400 hover:text-pink-700 transition-colors"
          >
            ดูชื่อยอดนิยมทั้งหมด
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {popularNames.map(name => (
            <NameCard
              key={name.id}
              name={name}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </div>
      </section>

      {/* THAKSA OVERVIEW CALLOUT */}
      <section className="p-8 rounded-3xl bg-gradient-to-r from-amber-50/70 via-pink-50/70 to-sky-50/70 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 border border-amber-200/60 dark:border-slate-700">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="space-y-3">
            <span className="text-xs px-3 py-1 rounded-full font-bold bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
              โบราณจารย์ไทย
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-['Prompt']">
              พร้อมค้นหาชื่อมงคลตามวันเกิดของลูกหรือยัง?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              กรอกวัน เดือน ปีเกิด (รองรับทั้ง พ.ศ. และ ค.ศ.) เวลาเกิด และความหมายที่ต้องการ ระบบจะทำการคำนวณและคัดกรองชื่อมงคลพร้อมเหตุผลทางโหราศาสตร์ทันที
            </p>
          </div>

          <button
            onClick={() => onNavigateToSearch()}
            className="px-8 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-pink-500 to-sky-500 hover:opacity-95 text-white shadow-xl shadow-pink-200/50 dark:shadow-none shrink-0 flex items-center gap-2"
          >
            <Compass className="w-4 h-4" />
            เข้าสู่ระบบค้นหาชื่อมงคล
          </button>
        </div>
      </section>

    </div>
  );
};
