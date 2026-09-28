import React from 'react';
import { Heart, ShieldAlert, Sparkles, Star } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  return (
    <footer className="mt-20 border-t border-pink-100 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* BRAND */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-300 to-pink-300 flex items-center justify-center">
                <span>⭐</span>
              </div>
              <span className="font-extrabold text-xl font-['Prompt'] bg-gradient-to-r from-sky-500 to-pink-500 bg-clip-text text-transparent">
                GNO BABY
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              เว็บไซต์แนะนำชื่อเด็กภาษาไทยมงคลตามวัน เดือน ปีเกิด และราศี ด้วยศาสตร์ทักษาปกรณ์โบราณ อบอุ่น ทันสมัย น่ารักสำหรับคุณพ่อคุณแม่ยุคใหม่
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
              เมนูหลัก
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => setCurrentTab('home')} className="hover:text-pink-500 transition-colors">
                  หน้าแรก
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('search')} className="hover:text-pink-500 transition-colors">
                  ค้นหาชื่อเด็กมงคล
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('popular')} className="hover:text-pink-500 transition-colors">
                  ชื่อยอดนิยม 200 รายชื่อ
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('compare')} className="hover:text-pink-500 transition-colors">
                  เปรียบเทียบชื่อเด็ก
                </button>
              </li>
            </ul>
          </div>

          {/* ASTROLOGY */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
              หลักโหราศาสตร์
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>ทักษาปกรณ์ 8 วันเกิด (บริวาร ถึง กาลกิณี)</li>
              <li>12 ราศีนักษัตร ธาตุประจำตัว และดาวครองเรือน</li>
              <li>คำนวณตามปี พ.ศ. และ ค.ศ.</li>
              <li>รากศัพท์บาลี-สันสกฤตแท้</li>
            </ul>
          </div>

          {/* MEMBER & SUPPORT */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
              สำหรับสมาชิก
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => setCurrentTab('login')} className="hover:text-pink-500 transition-colors">
                  เข้าสู่ระบบสมาชิก
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('register')} className="hover:text-pink-500 transition-colors">
                  สมัครสมาชิกเพื่อรับ Member ID
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* DISCLAIMER BOX */}
        <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>ข้อควรทราบ:</strong> การคำนวณชื่อมงคล การตรวจอักษรศรี เดช มนตรี และกาลกิณีในระบบ GNO BABY เป็นความเชื่อตามหลักโหราศาสตร์ไทยทักษาปกรณ์โบราณ ไม่ได้รับประกันผลลัพธ์ในชีวิตจริง โปรดใช้วิจารณญาณประกอบการพิจารณา
          </p>
        </div>

        {/* COPYRIGHT */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} GNO BABY. All rights reserved. มอบความสุขและชื่ออันเป็นสิริมงคลแด่ลูกน้อยของคุณ</p>
          <div className="flex items-center gap-1 text-pink-500">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
            <span>for Parents</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
