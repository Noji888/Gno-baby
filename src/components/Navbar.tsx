import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Baby, 
  Heart, 
  Search, 
  Flame, 
  Dices, 
  GitCompare, 
  Moon, 
  Sun, 
  Menu, 
  X, 
  User as UserIcon, 
  ShieldCheck, 
  LogOut 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storageService';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenRandomModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenRandomModal }) => {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const logoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const compareCount = storage.getCompareList().length;
  const favoriteCount = currentUser ? storage.getFavorites(currentUser.id).length : 0;

  const handleNav = (tab: string) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const handleLogoClick = () => {
    setLogoClicks(prev => {
      const next = prev + 1;
      if (next >= 5) {
        handleNav('admin_login');
        return 0;
      }
      return next;
    });

    if (logoTimerRef.current) clearTimeout(logoTimerRef.current);
    logoTimerRef.current = setTimeout(() => {
      setLogoClicks(0);
    }, 2500);

    handleNav('home');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-pink-100 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* LOGO (With discreet 5-click admin entry) */}
          <div 
            onClick={handleLogoClick} 
            className="flex items-center gap-2.5 cursor-pointer group"
            title="GNO BABY"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-300 via-pink-300 to-amber-200 flex items-center justify-center shadow-md shadow-pink-200/50 dark:shadow-none group-hover:scale-105 transition-transform">
              <span className="text-xl">⭐</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-sky-500 via-pink-500 to-amber-500 bg-clip-text text-transparent font-['Prompt']">
                  GNO BABY
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300 border border-pink-200/60 dark:border-pink-800">
                  ชื่อมงคล
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                ระบบตั้งชื่อเด็กตามวันเกิดและราศี
              </p>
            </div>
          </div>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            <button
              onClick={() => handleNav('home')}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                currentTab === 'home'
                  ? 'bg-pink-50 text-pink-600 dark:bg-slate-800 dark:text-pink-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              หน้าแรก
            </button>
            <button
              onClick={() => handleNav('search')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                currentTab === 'search'
                  ? 'bg-sky-50 text-sky-600 dark:bg-slate-800 dark:text-sky-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Search className="w-4 h-4" />
              ค้นหาชื่อมงคล
            </button>
            <button
              onClick={() => handleNav('popular')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                currentTab === 'popular'
                  ? 'bg-amber-50 text-amber-600 dark:bg-slate-800 dark:text-amber-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-500" />
              ชื่อยอดนิยม
            </button>
            <button
              onClick={onOpenRandomModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-all"
            >
              <Dices className="w-4 h-4 text-purple-500" />
              สุ่มชื่อ
            </button>
            <button
              onClick={() => handleNav('compare')}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                currentTab === 'compare'
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <GitCompare className="w-4 h-4 text-indigo-500" />
              เปรียบเทียบ
              {compareCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[11px] font-bold flex items-center justify-center">
                  {compareCount}
                </span>
              )}
            </button>
            <button
              onClick={() => handleNav('favorites')}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                currentTab === 'favorites'
                  ? 'bg-rose-50 text-rose-600 dark:bg-slate-800 dark:text-rose-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-500" />
              ชื่อที่บันทึก
              {favoriteCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center">
                  {favoriteCount}
                </span>
              )}
            </button>

            {/* ONLY DISPLAYED WHEN AUTHENTICATED AS ADMIN */}
            {isAdmin && (
              <button
                onClick={() => handleNav('admin_dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  currentTab === 'admin_dashboard'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-200/50'
                    : 'bg-amber-50/80 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                แดชบอร์ดแอดมิน
              </button>
            )}
          </nav>

          {/* RIGHT UTILITIES & AUTH */}
          <div className="flex items-center gap-2">
            
            {/* THEME TOGGLE */}
            <button
              onClick={toggleTheme}
              aria-label="เปลี่ยนธีม"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* USER / AUTH */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-pink-200 dark:border-slate-700 bg-gradient-to-r from-pink-50 to-sky-50 dark:from-slate-800 dark:to-slate-800 hover:shadow-xs transition-all text-left"
                >
                  <span className="text-xl">{currentUser.avatar || '👶'}</span>
                  <div className="hidden sm:block">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 max-w-[120px] truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-pink-600 dark:text-pink-400 font-mono font-medium">
                      {currentUser.memberId}
                    </p>
                  </div>
                </button>

                {/* DROPDOWN */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-50 animate-in fade-in-50 zoom-in-95">
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-xs text-slate-400">เข้าสู่ระบบในชื่อ</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                        {currentUser.name}
                      </p>
                      <span className="inline-block mt-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 font-semibold">
                        {currentUser.memberId}
                      </span>
                    </div>

                    <button
                      onClick={() => handleNav('profile')}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <UserIcon className="w-4 h-4 text-sky-500" />
                      โปรไฟล์สมาชิก
                    </button>

                    <button
                      onClick={() => handleNav('favorites')}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <Heart className="w-4 h-4 text-rose-500" />
                      ชื่อที่บันทึกไว้ ({favoriteCount})
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => handleNav('admin_dashboard')}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-600 dark:text-amber-400 font-semibold hover:bg-amber-50 dark:hover:bg-amber-950/40"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-500" />
                        แดชบอร์ดแอดมิน
                      </button>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-700 my-1" />

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <LogOut className="w-4 h-4" />
                      ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('login')}
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                >
                  เข้าสู่ระบบ
                </button>
                <button
                  onClick={() => handleNav('register')}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-sky-400 via-pink-400 to-amber-400 text-white shadow-md shadow-pink-200/50 hover:opacity-95 hover:shadow-lg transition-all"
                >
                  สมัครสมาชิก
                </button>
              </div>
            )}

            {/* MOBILE MENU TOGGLE */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-2 animate-in slide-in-from-top-2">
          <button
            onClick={() => handleNav('home')}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            หน้าแรก
          </button>
          <button
            onClick={() => handleNav('search')}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-sky-500" />
              ค้นหาชื่อมงคล
            </span>
          </button>
          <button
            onClick={() => handleNav('popular')}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
          >
            <Flame className="w-4 h-4 text-amber-500" />
            ชื่อยอดนิยม
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenRandomModal();
            }}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 flex items-center gap-2"
          >
            <Dices className="w-4 h-4" />
            สุ่มชื่อเด็กมงคล
          </button>
          <button
            onClick={() => handleNav('compare')}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-indigo-500" />
              เปรียบเทียบชื่อ
            </span>
            {compareCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-500 text-white text-xs">
                {compareCount}
              </span>
            )}
          </button>
          <button
            onClick={() => handleNav('favorites')}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              ชื่อที่บันทึก
            </span>
            {favoriteCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-xs">
                {favoriteCount}
              </span>
            )}
          </button>

          {isAdmin && (
            <button
              onClick={() => handleNav('admin_dashboard')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              ระบบหลังบ้าน แอดมิน
            </button>
          )}

          {!currentUser && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => handleNav('login')}
                className="w-full py-2.5 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              >
                เข้าสู่ระบบสมาชิก
              </button>
              <button
                onClick={() => handleNav('register')}
                className="w-full py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-sky-400 via-pink-400 to-amber-400 text-white"
              >
                สมัครสมาชิกใหม่
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
