import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  Filter, 
  RotateCcw, 
  Calendar, 
  Clock, 
  Moon, 
  Sun, 
  Heart, 
  GitCompare, 
  ShieldCheck, 
  Info, 
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  Dices
} from 'lucide-react';
import { BabyName, DayOfWeek, Gender, MeaningCategory, ZodiacSign } from '../types';
import { storage } from '../services/storageService';
import { analyzeNameThaksa, determineDayOfWeek } from '../services/thaksaCalculator';
import { getZodiacByDate, ZODIAC_SIGNS } from '../data/zodiacData';
import { NameCard } from '../components/NameCard';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

interface SearchViewProps {
  initialOptions?: { gender?: string; day?: string; keyword?: string };
  onOpenDetails: (name: BabyName) => void;
  onOpenRandom: () => void;
}

const THAI_LETTERS = [
  'ทั้งหมด', 'ก', 'ข', 'ค', 'ฆ', 'ง', 'จ', 'ฉ', 'ช', 'ซ', 'ฌ', 'ญ',
  'ฎ', 'ฏ', 'ฐ', 'ฑ', 'ฒ', 'ณ', 'ด', 'ต', 'ถ', 'ท', 'ธ', 'น',
  'บ', 'ป', 'ผ', 'ฝ', 'พ', 'ฟ', 'ภ', 'ม', 'ย', 'ร', 'ล', 'ว',
  'ศ', 'ษ', 'ส', 'ห', 'ฬ', 'อ', 'ฮ'
];

const MEANING_CATEGORIES: { id: MeaningCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'ทุกหมวดหมู่' },
  { id: 'success', label: 'ความสำเร็จ' },
  { id: 'love', label: 'ความรัก/เมตตา' },
  { id: 'wisdom', label: 'ความฉลาด/ปัญญา' },
  { id: 'wealth', label: 'ความมั่งคั่ง/ร่ำรวย' },
  { id: 'happiness', label: 'ความสุข' },
  { id: 'health', label: 'สุขภาพแข็งแรง' },
  { id: 'honor', label: 'เกียรติยศ/อำนาจ' },
  { id: 'prosperity', label: 'ความเจริญก้าวหน้า' }
];

export const SearchView: React.FC<SearchViewProps> = ({ 
  initialOptions, 
  onOpenDetails, 
  onOpenRandom 
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  // Form states
  const [parentNicknames, setParentNicknames] = useState('');
  const [gender, setGender] = useState<Gender>((initialOptions?.gender as Gender) || 'unspecified');
  const [birthYearType, setBirthYearType] = useState<'CE' | 'BE'>('BE'); // ค.ศ. or พ.ศ.
  const [birthDate, setBirthDate] = useState<string>('2026-05-15');
  const [birthTime, setBirthTime] = useState<string>('09:30');
  const [autoZodiac, setAutoZodiac] = useState(true);
  const [selectedZodiac, setSelectedZodiac] = useState<string>('ราศีพฤษภ');
  const [startingLetter, setStartingLetter] = useState<string>('ทั้งหมด');
  const [syllables, setSyllables] = useState<string>('all');
  const [category, setCategory] = useState<MeaningCategory | 'all'>('all');
  const [filterKalakiniOnly, setFilterKalakiniOnly] = useState(true); // default filter out kalakini

  // Realtime search text & sorting
  const [searchKeyword, setSearchKeyword] = useState(initialOptions?.keyword || '');
  const [sortBy, setSortBy] = useState<'popular' | 'alpha' | 'thaksa_score'>('thaksa_score');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Thaksa Day determination
  const dayOfWeek = useMemo<DayOfWeek>(() => {
    if (!birthDate) return 'monday';
    const parts = birthDate.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return determineDayOfWeek(d, birthTime);
  }, [birthDate, birthTime]);

  // Auto calculate zodiac
  useEffect(() => {
    if (autoZodiac && birthDate) {
      const parts = birthDate.split('-').map(Number);
      const z = getZodiacByDate(parts[1], parts[2]);
      setSelectedZodiac(z.nameThai);
    }
  }, [birthDate, autoZodiac]);

  // Form submission / History logging
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (currentUser) {
      storage.addSearchHistory({
        userId: currentUser.id,
        gender,
        birthDate,
        dayOfWeek,
        zodiac: selectedZodiac,
        startingLetter: startingLetter === 'ทั้งหมด' ? undefined : startingLetter,
        syllables: syllables === 'all' ? undefined : Number(syllables),
        category: category === 'all' ? undefined : category,
        keyword: searchKeyword,
        resultsCount: filteredNames.length
      });
    }
    showToast(`ประมวลผลตามหลักทักษาปกรณ์วัน${dayLabel}สำเร็จแล้ว`, 'success');
  };

  const handleReset = () => {
    setParentNicknames('');
    setGender('unspecified');
    setStartingLetter('ทั้งหมด');
    setSyllables('all');
    setCategory('all');
    setSearchKeyword('');
    setFilterKalakiniOnly(true);
    setSortBy('thaksa_score');
    setCurrentPage(1);
  };

  // Names Filtering
  const allNames = storage.getBabyNames();

  const filteredNames = useMemo(() => {
    return allNames.filter(item => {
      // 1. Gender filter
      if (gender !== 'unspecified' && item.gender !== gender && item.gender !== 'unspecified') {
        return false;
      }
      // 2. Starting letter
      if (startingLetter !== 'ทั้งหมด' && item.startingLetter !== startingLetter) {
        return false;
      }
      // 3. Syllables
      if (syllables !== 'all') {
        const sylCount = parseInt(syllables);
        if (sylCount === 4 && item.syllables < 4) return false;
        if (sylCount < 4 && item.syllables !== sylCount) return false;
      }
      // 4. Category
      if (category !== 'all' && item.category !== category) {
        return false;
      }
      // 5. Keyword search (Name, Reading, Meaning)
      if (searchKeyword.trim().length > 0) {
        const q = searchKeyword.trim().toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchReading = item.reading.toLowerCase().includes(q);
        const matchMeaning = item.meaning.toLowerCase().includes(q);
        if (!matchName && !matchReading && !matchMeaning) return false;
      }
      // 6. Thaksa Kalakini filter
      if (filterKalakiniOnly) {
        const t = analyzeNameThaksa(item.name, dayOfWeek);
        if (!t.isKalakiniFree) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'popular') {
        return (b.favoriteCount + b.searchCount) - (a.favoriteCount + a.searchCount);
      }
      if (sortBy === 'alpha') {
        return a.name.localeCompare(b.name, 'th');
      }
      // Sort by thaksa score
      const scoreA = analyzeNameThaksa(a.name, dayOfWeek).score;
      const scoreB = analyzeNameThaksa(b.name, dayOfWeek).score;
      return scoreB - scoreA;
    });
  }, [allNames, gender, startingLetter, syllables, category, searchKeyword, filterKalakiniOnly, sortBy, dayOfWeek]);

  // Pagination
  const totalPages = Math.ceil(filteredNames.length / itemsPerPage) || 1;
  const paginatedNames = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredNames.slice(start, start + itemsPerPage);
  }, [filteredNames, currentPage]);

  const thaksaConfig = storage.getThaksaConfig()[dayOfWeek];
  const dayLabel = thaksaConfig.thaiName;

  return (
    <div className="space-y-8">
      
      {/* HEADER TITLE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 font-['Prompt']">
            ค้นหาชื่อมงคลตามวันเกิดและราศี
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ระบุข้อมูลวันเกิดและเงื่อนไขเพื่อวิเคราะห์ความมงคลด้วยหลักทักษาปกรณ์โบราณ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenRandom}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 hover:bg-purple-200 transition-colors"
          >
            <Dices className="w-4 h-4" />
            สุ่มชื่อมงคล
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            ล้างตัวกรอง
          </button>
        </div>
      </div>

      {/* SEARCH FORM CONTAINER */}
      <form onSubmit={handleSearchSubmit} className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-pink-100 dark:border-slate-700/80 shadow-md space-y-6">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. PARENT NICKNAMES */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              ชื่อเล่นคุณพ่อ / คุณแม่ (ไม่บังคับ)
            </label>
            <input
              type="text"
              value={parentNicknames}
              onChange={e => setParentNicknames(e.target.value)}
              placeholder="เช่น พ่อต้น & แม่เก๋"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-pink-400"
            />
          </div>

          {/* 2. GENDER */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              เพศของเด็ก <span className="text-pink-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setGender('boy')}
                className={`py-2 px-1 text-xs rounded-xl font-bold border transition-all ${
                  gender === 'boy'
                    ? 'bg-sky-500 text-white border-sky-500 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-sky-50'
                }`}
              >
                👦 ชาย
              </button>
              <button
                type="button"
                onClick={() => setGender('girl')}
                className={`py-2 px-1 text-xs rounded-xl font-bold border transition-all ${
                  gender === 'girl'
                    ? 'bg-pink-500 text-white border-pink-500 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-pink-50'
                }`}
              >
                👧 หญิง
              </button>
              <button
                type="button"
                onClick={() => setGender('unspecified')}
                className={`py-2 px-1 text-xs rounded-xl font-bold border transition-all ${
                  gender === 'unspecified'
                    ? 'bg-purple-500 text-white border-purple-500 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-purple-50'
                }`}
              >
                👶 ทั้งหมด
              </button>
            </div>
          </div>

          {/* 3. BIRTH DATE (with CE / BE toggle) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                วันเกิด <span className="text-pink-500">*</span>
              </label>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setBirthYearType('BE')}
                  className={`px-1.5 py-0.5 rounded font-bold ${
                    birthYearType === 'BE' ? 'bg-pink-500 text-white' : 'text-slate-400'
                  }`}
                >
                  พ.ศ.
                </button>
                <button
                  type="button"
                  onClick={() => setBirthYearType('CE')}
                  className={`px-1.5 py-0.5 rounded font-bold ${
                    birthYearType === 'CE' ? 'bg-pink-500 text-white' : 'text-slate-400'
                  }`}
                >
                  ค.ศ.
                </button>
              </div>
            </div>
            <input
              type="date"
              value={birthDate}
              onChange={e => setBirthDate(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-pink-400"
            />
          </div>

          {/* 4. BIRTH TIME */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              เวลาเกิด (แยกพุธกลางวัน / กลางคืน)
            </label>
            <input
              type="time"
              value={birthTime}
              onChange={e => setBirthTime(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-pink-400"
            />
          </div>
        </div>

        {/* ROW 2: ZODIAC, SYLLABLES, MEANING */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          
          {/* ZODIAC */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                ราศีเกิด
              </label>
              <button
                type="button"
                onClick={() => setAutoZodiac(!autoZodiac)}
                className="text-[11px] text-pink-600 dark:text-pink-400 hover:underline"
              >
                {autoZodiac ? '(คำนวณอัตโนมัติ ✓)' : '(เลือกเอง)'}
              </button>
            </div>
            <select
              value={selectedZodiac}
              disabled={autoZodiac}
              onChange={e => setSelectedZodiac(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden"
            >
              {ZODIAC_SIGNS.map(z => (
                <option key={z.id} value={z.nameThai}>
                  {z.symbol} {z.nameThai} ({z.nameEng})
                </option>
              ))}
            </select>
          </div>

          {/* SYLLABLES */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              จำนวนพยางค์
            </label>
            <select
              value={syllables}
              onChange={e => setSyllables(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden"
            >
              <option value="all">ทุกจำนวนพยางค์</option>
              <option value="1">1 พยางค์ (กระชับ เช่น พชร, กรณ์)</option>
              <option value="2">2 พยางค์ (ยอดนิยม เช่น กฤติน, ญาดา)</option>
              <option value="3">3 พยางค์ (ไพเราะ เช่น กิตติภพ, ชญานิศ)</option>
              <option value="4">4 พยางค์ขึ้นไป (สง่างาม)</option>
            </select>
          </div>

          {/* MEANING CATEGORY */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              ความหมายที่ต้องการ
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as any)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden"
            >
              {MEANING_CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* STARTING LETTER HORIZONTAL PICKER */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            ตัวอักษรขึ้นต้น (ก - ฮ):
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
            {THAI_LETTERS.map(letter => (
              <button
                type="button"
                key={letter}
                onClick={() => setStartingLetter(letter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  startingLetter === letter
                    ? 'bg-pink-500 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-pink-300'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="filterKalakini"
              checked={filterKalakiniOnly}
              onChange={e => setFilterKalakiniOnly(e.target.checked)}
              className="w-4 h-4 text-pink-500 rounded border-slate-300 focus:ring-pink-400"
            />
            <label htmlFor="filterKalakini" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              คัดกรองเฉพาะชื่อมงคลที่ "ไร้อักษรกาลกิณี" ตามวันเกิด
            </label>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-sky-400 via-pink-400 to-amber-400 text-white shadow-lg shadow-pink-200/50 hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            ค้นหาชื่อมงคล
          </button>
        </div>
      </form>

      {/* THAKSA LETTERS PREVIEW CARD FOR THE SELECTED BIRTH DAY */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-pink-50/70 via-sky-50/70 to-amber-50/70 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 border border-pink-100 dark:border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: thaksaConfig.color }} />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              ตารางทักษาประจำ{dayLabel} {birthTime && `(เวลา ${birthTime} น.)`} • {selectedZodiac}
            </h3>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300">
            {thaksaConfig.celestialBody}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300">
          {thaksaConfig.description}
        </p>

        {/* 8 THAKSA GROUPS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-1 text-xs">
          <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 block">บริวาร (คนเกื้อหนุน)</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
              {thaksaConfig.barivara.join(' ')}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 block">อายุ (สุขภาพ)</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
              {thaksaConfig.ayu.join(' ')}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 block">เดช (อำนาจ)</span>
            <span className="font-bold text-red-600 dark:text-red-400 text-xs">
              {thaksaConfig.dej.join(' ')}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 block">ศรี (โชคลาภ/เสน่ห์)</span>
            <span className="font-bold text-amber-600 dark:text-amber-400 text-xs">
              {thaksaConfig.sri.join(' ')}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 block">มูละ (ทรัพย์สิน)</span>
            <span className="font-bold text-cyan-600 dark:text-cyan-400 text-xs">
              {thaksaConfig.mula.join(' ')}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 block">อุตสาหะ (ขยัน)</span>
            <span className="font-bold text-purple-600 dark:text-purple-400 text-xs">
              {thaksaConfig.utsaha.join(' ')}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 block">มนตรี (ผู้ใหญ่หนุน)</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 text-xs">
              {thaksaConfig.montri.join(' ')}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900">
            <span className="text-[10px] text-rose-500 font-bold block">กาลกิณี (ห้ามใช้!)</span>
            <span className="font-extrabold text-rose-600 dark:text-rose-400 text-xs">
              {thaksaConfig.kalakini.join(' ')}
            </span>
          </div>
        </div>
      </div>

      {/* RESULTS HEADER & SORTING */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 font-['Prompt']">
            ผลการค้นหา ({filteredNames.length} ชื่อมงคล)
          </h2>
          <p className="text-xs text-slate-400">
            {filterKalakiniOnly ? 'แสดงเฉพาะชื่อที่ไร้อักษรกาลกิณีสำหรับวัน' + dayLabel : 'แสดงชื่อทั้งหมด'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">เรียงตาม:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <option value="thaksa_score">คะแนนมงคลสูงสุด</option>
              <option value="popular">ความนิยมสูงสุด</option>
              <option value="alpha">ตัวอักษร ก - ฮ</option>
            </select>
          </div>
        </div>
      </div>

      {/* RESULTS GRID */}
      {paginatedNames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedNames.map(name => (
            <NameCard
              key={name.id}
              name={name}
              onOpenDetails={onOpenDetails}
              selectedDay={dayOfWeek}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-pink-50 dark:bg-pink-950 flex items-center justify-center text-2xl">
            🔍
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            ไม่พบชื่อที่ตรงกับเงื่อนไขทั้งหมด
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            ลองปรับเปลี่ยนตัวอักษรขึ้นต้น หรือผ่อนคลายตัวกรองความหมายเพื่อให้ระบบแสดงชื่ออื่นๆ เพิ่มเติม
          </p>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-pink-500 text-white"
          >
            ล้างการค้นหา
          </button>
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                currentPage === page
                  ? 'bg-pink-500 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
