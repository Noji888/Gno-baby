import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Database, 
  PlusCircle, 
  Compass, 
  Table, 
  BarChart3, 
  Settings, 
  LogOut, 
  Search, 
  Download, 
  Upload, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  ShieldCheck, 
  RefreshCw,
  Sparkles,
  FileSpreadsheet,
  AlertTriangle,
  Server,
  UserPlus,
  Eye,
  KeyRound,
  FileDown,
  CheckSquare,
  Square,
  Tag
} from 'lucide-react';
import { BabyName, DayOfWeek, Gender, MeaningCategory, User as UserType, ZodiacSign, ThaksaDayConfig } from '../types';
import { storage } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { testFirestoreConnection } from '../services/firebaseService';
import { analyzeNameThaksa } from '../services/thaksaCalculator';

interface AdminDashboardViewProps {
  setCurrentTab: (tab: string) => void;
  onOpenDetails: (name: BabyName) => void;
}

type AdminSidebarTab = 
  | 'overview' 
  | 'members' 
  | 'names' 
  | 'add_name' 
  | 'zodiac' 
  | 'thaksa' 
  | 'reports' 
  | 'settings';

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ setCurrentTab, onOpenDetails }) => {
  const { currentUser, logout, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminSidebarTab>('overview');

  // Overview Timeframe
  const [overviewRange, setOverviewRange] = useState<'7d' | '30d' | '1y'>('7d');

  // Baby Names state
  const [nameSearch, setNameSearch] = useState('');
  const [nameGenderFilter, setNameGenderFilter] = useState<'all' | 'boy' | 'girl'>('all');
  const [nameCategoryFilter, setNameCategoryFilter] = useState<string>('all');
  const [namePage, setNamePage] = useState(1);
  const namesPerPage = 10;
  const [selectedNameIds, setSelectedNameIds] = useState<string[]>([]);
  const [editingName, setEditingName] = useState<BabyName | null>(null);

  // Batch action category
  const [batchCategory, setBatchCategory] = useState<MeaningCategory>('success');

  // New name form state
  const [newName, setNewName] = useState({
    name: '',
    reading: '',
    meaning: '',
    gender: 'boy' as Gender,
    startingLetter: 'ก',
    syllables: 2,
    category: 'success' as MeaningCategory,
    recommendedDays: ['monday', 'friday'] as DayOfWeek[],
    zodiacSign: 'ราศีเมษ',
    origin: '',
    thaksaNotes: ''
  });

  // Members state
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<UserType | null>(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [newMemberModalOpen, setNewMemberModalOpen] = useState(false);
  const [newMemberData, setNewMemberData] = useState({
    name: '',
    nickname: '',
    email: '',
    phone: '',
    password: 'Password123',
    role: 'member' as 'member' | 'admin'
  });

  // CSV Import Modal state
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');

  // Thaksa edit state
  const [selectedThaksaDay, setSelectedThaksaDay] = useState<DayOfWeek>('sunday');
  const [newLetterInput, setNewLetterInput] = useState('');
  const [newLetterCategory, setNewLetterCategory] = useState<keyof ThaksaDayConfig>('sri');

  // Zodiac Edit state
  const [editingZodiac, setEditingZodiac] = useState<ZodiacSign | null>(null);

  // Firebase testing state
  const [testingFirebase, setTestingFirebase] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState<string | null>(null);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-white dark:bg-slate-800 border border-rose-200 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          ต้องใช้สิทธิ์ผู้ดูแลระบบ (Admin)
        </h2>
        <p className="text-xs text-slate-500">
          คุณต้องเข้าสู่ระบบด้วยบัญชีแอดมินเพื่อเข้าถึงแดชบอร์ดนี้
        </p>
        <button
          onClick={() => setCurrentTab('admin_login')}
          className="px-6 py-2 rounded-xl text-xs font-bold bg-amber-500 text-white"
        >
          ไปหน้าเข้าสู่ระบบแอดมิน
        </button>
      </div>
    );
  }

  const allNames = storage.getBabyNames();
  const allUsers = storage.getUsers();
  const allFavorites = storage.getFavorites();
  const allLogs = storage.getAdminLogs();
  const settings = storage.getSettings();
  const thaksaConfigs = storage.getThaksaConfig();
  const zodiacSigns = storage.getZodiacSigns();

  // Filtered names for table
  const filteredNames = useMemo(() => {
    return allNames.filter(n => {
      if (nameGenderFilter !== 'all' && n.gender !== nameGenderFilter) return false;
      if (nameCategoryFilter !== 'all' && n.category !== nameCategoryFilter) return false;
      if (nameSearch.trim().length > 0) {
        const q = nameSearch.toLowerCase();
        return n.name.toLowerCase().includes(q) || n.reading.toLowerCase().includes(q) || n.meaning.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allNames, nameGenderFilter, nameCategoryFilter, nameSearch]);

  const totalNamePages = Math.ceil(filteredNames.length / namesPerPage) || 1;
  const paginatedNames = filteredNames.slice((namePage - 1) * namesPerPage, namePage * namesPerPage);

  // Filtered members for table
  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => {
      if (memberSearch.trim().length > 0) {
        const q = memberSearch.toLowerCase();
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.memberId.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allUsers, memberSearch]);

  // Real-time Thaksa check while typing in Add Name form
  const liveThaksaCheck = useMemo(() => {
    if (!newName.name.trim()) return null;
    const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday_day', 'wednesday_night', 'thursday', 'friday', 'saturday'];
    return days.map(d => ({
      day: d,
      result: analyzeNameThaksa(newName.name, d)
    }));
  }, [newName.name]);

  // Handlers
  const handleDeleteName = (id: string, nameThai: string) => {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบชื่อ "${nameThai}" ออกจากฐานข้อมูล?`)) {
      storage.deleteBabyName(id);
      setSelectedNameIds(prev => prev.filter(x => x !== id));
      showToast(`ลบชื่อ "${nameThai}" แล้ว`, 'info');
    }
  };

  const handleSelectAllNames = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedNameIds(paginatedNames.map(n => n.id));
    } else {
      setSelectedNameIds([]);
    }
  };

  const handleToggleSelectName = (id: string) => {
    setSelectedNameIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBatchDelete = () => {
    if (selectedNameIds.length === 0) return;
    if (confirm(`คุณต้องการลบชื่อที่เลือกทั้ง ${selectedNameIds.length} รายการใช่หรือไม่?`)) {
      const count = storage.batchDeleteBabyNames(selectedNameIds);
      setSelectedNameIds([]);
      showToast(`ลบชื่อสำเร็จ ${count} รายการ`, 'success');
    }
  };

  const handleBatchChangeCategory = () => {
    if (selectedNameIds.length === 0) return;
    const count = storage.batchUpdateCategory(selectedNameIds, batchCategory);
    showToast(`อัปเดตหมวดหมู่ ${count} รายการสำเร็จแล้ว`, 'success');
  };

  const handleCreateName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.name || !newName.reading || !newName.meaning) {
      showToast('กรุณากรอกชื่อ คำอ่าน และความหมายให้ครบถ้วน', 'error');
      return;
    }
    const created = storage.addBabyName(newName);
    showToast(`เพิ่มชื่อ "${created.name}" ในระบบแล้ว`, 'success');
    setNewName({
      name: '',
      reading: '',
      meaning: '',
      gender: 'boy',
      startingLetter: 'ก',
      syllables: 2,
      category: 'success',
      recommendedDays: ['monday'],
      zodiacSign: 'ราศีเมษ',
      origin: '',
      thaksaNotes: ''
    });
    setActiveTab('names');
  };

  const handleUpdateNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingName) return;
    storage.updateBabyName(editingName.id, editingName);
    showToast(`อัปเดตชื่อ "${editingName.name}" เรียบร้อยแล้ว`, 'success');
    setEditingName(null);
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    const res = storage.registerUser({
      name: newMemberData.name,
      nickname: newMemberData.nickname,
      email: newMemberData.email,
      phone: newMemberData.phone,
      password: newMemberData.password
    });
    if (res.user) {
      if (newMemberData.role === 'admin') {
        storage.updateUser(res.user.id, { role: 'admin' });
      }
      setNewMemberModalOpen(false);
      showToast(`สร้างสมาชิกใหม่สำเร็จ: ${res.user.memberId}`, 'success');
    } else {
      showToast(res.error || 'สร้างสมาชิกไม่สำเร็จ', 'error');
    }
  };

  const handleToggleUserStatus = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    storage.updateUser(userId, { status: newStatus });
    showToast(`เปลี่ยนสถานะสมาชิกเป็น ${newStatus} แล้ว`, 'success');
  };

  const handleExportCSV = () => {
    const csv = storage.exportNamesToCSV();
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GNO_BABY_names_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast('ดาวน์โหลดไฟล์ CSV เรียบร้อยแล้ว', 'success');
  };

  const handleImportCSVSubmit = () => {
    if (!csvText.trim()) return;
    const res = storage.importNamesFromCSV(csvText);
    setCsvModalOpen(false);
    setCsvText('');
    showToast(`นำเข้าสำเร็จ ${res.successCount} ชื่อ`, 'success');
  };

  const handleExportFullBackup = () => {
    const jsonStr = storage.exportFullBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GNO_BABY_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast('ดาวน์โหลดไฟล์สำรองข้อมูล JSON แล้ว', 'success');
  };

  const handleImportFullBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = storage.importFullBackupJSON(content);
        if (res.success) showToast(res.message, 'success');
        else showToast(res.message, 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleTestFirebase = async () => {
    setTestingFirebase(true);
    setFirebaseStatus('กำลังทดสอบการเชื่อมต่อ...');
    const res = await testFirestoreConnection();
    setTestingFirebase(false);
    setFirebaseStatus(res.message);
    if (res.connected) showToast(res.message, 'success');
    else showToast(res.message, 'info');
  };

  // Add letter to thaksa day
  const handleAddThaksaLetter = () => {
    if (!newLetterInput.trim()) return;
    const dayConf = thaksaConfigs[selectedThaksaDay];
    const targetArr = [...(dayConf[newLetterCategory] as string[])];
    if (!targetArr.includes(newLetterInput.trim())) {
      targetArr.push(newLetterInput.trim());
      storage.updateThaksaDay(selectedThaksaDay, {
        ...dayConf,
        [newLetterCategory]: targetArr
      });
      setNewLetterInput('');
      showToast(`เพิ่มอักษร "${newLetterInput.trim()}" สำเร็จ`, 'success');
    }
  };

  // Remove letter from thaksa day
  const handleRemoveThaksaLetter = (cat: keyof ThaksaDayConfig, letter: string) => {
    const dayConf = thaksaConfigs[selectedThaksaDay];
    const targetArr = (dayConf[cat] as string[]).filter(l => l !== letter);
    storage.updateThaksaDay(selectedThaksaDay, {
      ...dayConf,
      [cat]: targetArr
    });
    showToast(`ลบอักษร "${letter}" แล้ว`, 'info');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[750px]">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full lg:w-64 bg-white dark:bg-slate-800/90 rounded-3xl p-4 border border-slate-200 dark:border-slate-700 shadow-md shrink-0 flex flex-col justify-between">
        <div className="space-y-2">
          {/* ADMIN BADGE */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">👨‍💼</span>
              <div>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  {currentUser?.name || 'ผู้ดูแลระบบ'}
                </p>
                <p className="text-[10px] font-mono text-amber-700 dark:text-amber-400 font-semibold">
                  {currentUser?.memberId || 'GNO-A000001'}
                </p>
              </div>
            </div>
          </div>

          {/* MENU ITEMS */}
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-200/50'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            ภาพรวมระบบ
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
              activeTab === 'members'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-200/50'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Users className="w-4 h-4" />
              จัดการสมาชิก
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
              {allUsers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('names')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
              activeTab === 'names'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-200/50'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Database className="w-4 h-4" />
              ฐานข้อมูลชื่อเด็ก
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
              {allNames.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('add_name')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
              activeTab === 'add_name'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-200/50'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            เพิ่ม / แก้ไขชื่อเด็ก
          </button>

          <button
            onClick={() => setActiveTab('thaksa')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
              activeTab === 'thaksa'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-200/50'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Table className="w-4 h-4" />
            ตารางอักษรมงคล (ทักษา)
          </button>

          <button
            onClick={() => setActiveTab('zodiac')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
              activeTab === 'zodiac'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-200/50'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Compass className="w-4 h-4" />
            จัดการข้อมูลราศี
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
              activeTab === 'reports'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-200/50'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            รายงานและสถิติ
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-200/50'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            ตั้งค่าระบบ & Firebase
          </button>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-2">
          <button
            onClick={() => setCurrentTab('home')}
            className="w-full text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-1"
          >
            ← กลับสู่หน้าบ้านเว็บไซต์
          </button>
          <button
            onClick={() => {
              logout();
              setCurrentTab('home');
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl"
          >
            <LogOut className="w-3.5 h-3.5" />
            ออกจากระบบแอดมิน
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 font-['Prompt']">
                  ภาพรวมระบบ GNO BABY
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  สถิติสรุปภาพรวมฐานข้อมูลชื่อเด็ก สมาชิก และกิจกรรมในระบบ
                </p>
              </div>

              {/* TIMEFRAME SELECTOR */}
              <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setOverviewRange('7d')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${overviewRange === '7d' ? 'bg-white dark:bg-slate-700 shadow-xs text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}
                >
                  7 วัน
                </button>
                <button
                  onClick={() => setOverviewRange('30d')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${overviewRange === '30d' ? 'bg-white dark:bg-slate-700 shadow-xs text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}
                >
                  30 วัน
                </button>
                <button
                  onClick={() => setOverviewRange('1y')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${overviewRange === '1y' ? 'bg-white dark:bg-slate-700 shadow-xs text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}
                >
                  1 ปี
                </button>
              </div>
            </div>

            {/* 5 STATS CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800">
                <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium block">จำนวนชื่อเด็ก</span>
                <span className="text-3xl font-black text-sky-900 dark:text-sky-100">{allNames.length}</span>
                <span className="text-[10px] text-sky-500 block mt-1">100 ชาย / 100 หญิง</span>
              </div>

              <div className="p-4 rounded-2xl bg-pink-50 dark:bg-pink-950/50 border border-pink-200 dark:border-pink-800">
                <span className="text-[11px] text-pink-600 dark:text-pink-400 font-medium block">สมาชิกทั้งหมด</span>
                <span className="text-3xl font-black text-pink-900 dark:text-pink-100">{allUsers.length}</span>
                <span className="text-[10px] text-pink-500 block mt-1">มี Member ID</span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800">
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium block">การค้นหาทั้งหมด</span>
                <span className="text-3xl font-black text-amber-900 dark:text-amber-100">
                  {allNames.reduce((acc, curr) => acc + (curr.searchCount || 0), 0)}
                </span>
                <span className="text-[10px] text-amber-500 block mt-1">ครั้ง</span>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800">
                <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium block">การบันทึกโปรด</span>
                <span className="text-3xl font-black text-rose-900 dark:text-rose-100">
                  {allFavorites.length}
                </span>
                <span className="text-[10px] text-rose-500 block mt-1">รายการ</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block">สถานะระบบ</span>
                <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">ปกติ (Online)</span>
                <span className="text-[10px] text-emerald-500 block mt-1">Local + Cloud Sync</span>
              </div>
            </div>

            {/* QUICK ACTIONS ROW */}
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-slate-900 border border-amber-100 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                ⚡ การดำเนินการด่วน:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('add_name')}
                  className="px-3 py-1.5 rounded-xl font-bold bg-amber-500 text-white shadow-xs"
                >
                  + เพิ่มชื่อใหม่
                </button>
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 rounded-xl font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  ส่งออก CSV
                </button>
                <button
                  onClick={handleExportFullBackup}
                  className="px-3 py-1.5 rounded-xl font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  สำรองข้อมูล JSON
                </button>
              </div>
            </div>

            {/* CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* SEARCH TRAFFIC (SVG BARS) */}
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    สถิติการค้นหารายวัน (7 วันล่าสุด)
                  </h3>
                  <span className="text-[11px] font-bold text-pink-500">+18% สัปดาห์นี้</span>
                </div>
                
                <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2">
                  {[
                    { day: 'จ.', val: 45 },
                    { day: 'อ.', val: 62 },
                    { day: 'พ.', val: 80 },
                    { day: 'พฤ.', val: 75 },
                    { day: 'ศ.', val: 95 },
                    { day: 'ส.', val: 120 },
                    { day: 'อา.', val: 110 }
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <span className="text-[10px] text-slate-400 font-mono">{bar.val}</span>
                      <div 
                        className="w-full bg-gradient-to-t from-sky-400 to-pink-400 rounded-t-lg transition-all"
                        style={{ height: `${(bar.val / 120) * 80}%` }}
                      />
                      <span className="text-[10px] font-bold text-slate-500">{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* MONTHLY REGISTRATIONS */}
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    สถิติการสมัครสมาชิกใหม่รายเดือน (ปีนี้)
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-500">อัตราเติบโตสูง</span>
                </div>

                <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2">
                  {[
                    { m: 'ม.ค.', v: 20 },
                    { m: 'ก.พ.', v: 35 },
                    { m: 'มี.ค.', v: 48 },
                    { m: 'เม.ย.', v: 65 },
                    { m: 'พ.ค.', v: 85 },
                    { m: 'มิ.ย.', v: 110 }
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <span className="text-[10px] text-slate-400 font-mono">{bar.v}</span>
                      <div 
                        className="w-full bg-gradient-to-t from-amber-400 to-pink-500 rounded-t-lg transition-all"
                        style={{ height: `${(bar.v / 110) * 80}%` }}
                      />
                      <span className="text-[10px] font-bold text-slate-500">{bar.m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RECENT ADMIN LOGS */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                บันทึกกิจกรรมหลังบ้านล่าสุด (Admin Logs)
              </h3>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 max-h-48 overflow-y-auto">
                {allLogs.slice(0, 10).map(log => (
                  <div key={log.id} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 mr-2">[{log.action}]</span>
                      <span className="text-slate-600 dark:text-slate-400">{log.details}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                      {new Date(log.timestamp).toLocaleTimeString('th-TH')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MEMBERS MANAGEMENT */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 font-['Prompt']">
                  จัดการสมาชิก ({filteredUsers.length} รายการ)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ตรวจสอบรายชื่อสมาชิก รหัส Member ID และสถานะการใช้งาน
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setNewMemberModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-pink-500 hover:bg-pink-600 text-white shadow-xs"
                >
                  <UserPlus className="w-4 h-4" />
                  เพิ่มสมาชิกใหม่
                </button>

                <div className="relative w-48 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={e => setMemberSearch(e.target.value)}
                    placeholder="ค้นหาชื่อ, อีเมล หรือ Member ID..."
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-500">
                    <th className="p-3">Member ID</th>
                    <th className="p-3">ชื่อ - นามสกุล</th>
                    <th className="p-3">อีเมล</th>
                    <th className="p-3">เบอร์โทร</th>
                    <th className="p-3">บทบาท</th>
                    <th className="p-3">สถานะ</th>
                    <th className="p-3">วันที่สมัคร</th>
                    <th className="p-3 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-mono font-bold text-pink-600 dark:text-pink-400">
                        {user.memberId}
                      </td>
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">
                        {user.name} {user.nickname && `(${user.nickname})`}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {user.email}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {user.phone || '-'}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          user.role === 'admin'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          user.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {user.status === 'active' ? 'ปกติ' : 'ระงับ'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">
                        {new Date(user.createdAt).toLocaleDateString('th-TH')}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedUserForDetail(user);
                              setUserModalOpen(true);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-sky-500"
                            title="ดูประวัติการค้นหาและชื่อโปรด"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleUserStatus(user.id, user.status)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                                user.status === 'active'
                                  ? 'text-rose-600 hover:bg-rose-50'
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              {user.status === 'active' ? 'ระงับ' : 'ปลดระงับ'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: BABY NAMES DATABASE MANAGEMENT */}
        {activeTab === 'names' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 font-['Prompt']">
                  จัดการฐานข้อมูลชื่อเด็ก ({filteredNames.length} ชื่อ)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  เพิ่ม ลบ แก้ไข และส่งออกข้อมูลเป็น CSV
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  ส่งออก CSV
                </button>
                <button
                  onClick={() => setCsvModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  นำเข้า CSV
                </button>
                <button
                  onClick={() => setActiveTab('add_name')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  เพิ่มชื่อใหม่
                </button>
              </div>
            </div>

            {/* BATCH ACTION BAR IF NAMES SELECTED */}
            {selectedNameIds.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-3 flex-wrap text-xs animate-in slide-in-from-top-1">
                <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold">
                  <CheckSquare className="w-4 h-4 text-indigo-500" />
                  เลือกอยู่ {selectedNameIds.length} รายชื่อ
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={batchCategory}
                    onChange={e => setBatchCategory(e.target.value as MeaningCategory)}
                    className="p-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-xs"
                  >
                    <option value="success">ความสำเร็จ</option>
                    <option value="love">ความรัก</option>
                    <option value="wisdom">ความฉลาด</option>
                    <option value="wealth">ความมั่งคั่ง</option>
                    <option value="happiness">ความสุข</option>
                    <option value="health">สุขภาพ</option>
                    <option value="honor">เกียรติยศ</option>
                    <option value="prosperity">ความเจริญ</option>
                  </select>
                  <button
                    onClick={handleBatchChangeCategory}
                    className="px-3 py-1.5 rounded-lg font-bold bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    เปลี่ยนหมวดหมู่
                  </button>
                  <button
                    onClick={handleBatchDelete}
                    className="px-3 py-1.5 rounded-lg font-bold bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    ลบที่เลือก
                  </button>
                </div>
              </div>
            )}

            {/* ADVANCED FILTER BAR */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={nameSearch}
                  onChange={e => {
                    setNameSearch(e.target.value);
                    setNamePage(1);
                  }}
                  placeholder="ค้นหาชื่อ หรือความหมาย..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* GENDER */}
                <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <button
                    onClick={() => setNameGenderFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold ${nameGenderFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-500'}`}
                  >
                    ทุกเพศ
                  </button>
                  <button
                    onClick={() => setNameGenderFilter('boy')}
                    className={`px-2.5 py-1 rounded-lg font-bold ${nameGenderFilter === 'boy' ? 'bg-sky-500 text-white' : 'text-slate-500'}`}
                  >
                    ชาย
                  </button>
                  <button
                    onClick={() => setNameGenderFilter('girl')}
                    className={`px-2.5 py-1 rounded-lg font-bold ${nameGenderFilter === 'girl' ? 'bg-pink-500 text-white' : 'text-slate-500'}`}
                  >
                    หญิง
                  </button>
                </div>

                {/* CATEGORY */}
                <select
                  value={nameCategoryFilter}
                  onChange={e => setNameCategoryFilter(e.target.value)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                >
                  <option value="all">ทุกหมวดหมู่</option>
                  <option value="success">ความสำเร็จ</option>
                  <option value="love">ความรัก</option>
                  <option value="wisdom">ความฉลาด</option>
                  <option value="wealth">ความมั่งคั่ง</option>
                  <option value="happiness">ความสุข</option>
                  <option value="health">สุขภาพ</option>
                  <option value="honor">เกียรติยศ</option>
                  <option value="prosperity">ความเจริญ</option>
                </select>
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-500">
                    <th className="p-3 w-8">
                      <input
                        type="checkbox"
                        checked={paginatedNames.length > 0 && selectedNameIds.length === paginatedNames.length}
                        onChange={handleSelectAllNames}
                        className="rounded text-amber-500"
                      />
                    </th>
                    <th className="p-3">ชื่อภาษาไทย</th>
                    <th className="p-3">คำอ่าน</th>
                    <th className="p-3">เพศ</th>
                    <th className="p-3">พยางค์</th>
                    <th className="p-3">หมวดหมู่</th>
                    <th className="p-3">ความหมาย</th>
                    <th className="p-3">ราศี</th>
                    <th className="p-3 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedNames.map(item => {
                    const isSelected = selectedNameIds.includes(item.id);
                    return (
                      <tr key={item.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/50 ${isSelected ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''}`}>
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectName(item.id)}
                            className="rounded text-amber-500"
                          />
                        </td>
                        <td className="p-3 font-bold text-slate-900 dark:text-slate-100 text-sm">
                          {item.name}
                        </td>
                        <td className="p-3 font-mono text-pink-600 dark:text-pink-400">
                          [{item.reading}]
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            item.gender === 'boy' ? 'bg-sky-100 text-sky-800' : 'bg-pink-100 text-pink-800'
                          }`}>
                            {item.gender === 'boy' ? 'ชาย' : 'หญิง'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          {item.syllables}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-3 max-w-xs truncate text-slate-600 dark:text-slate-300">
                          {item.meaning}
                        </td>
                        <td className="p-3 text-slate-500 text-[11px]">
                          {item.zodiacSign}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingName(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500"
                              title="แก้ไขชื่อ"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteName(item.id, item.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500"
                              title="ลบชื่อ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-slate-400">
                หน้า {namePage} จาก {totalNamePages}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={namePage === 1}
                  onClick={() => setNamePage(p => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30"
                >
                  ก่อนหน้า
                </button>
                <button
                  disabled={namePage === totalNamePages}
                  onClick={() => setNamePage(p => Math.min(totalNamePages, p + 1))}
                  className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ADD / EDIT BABY NAME */}
        {activeTab === 'add_name' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 font-['Prompt']">
                เพิ่มชื่อเด็กใหม่ในฐานข้อมูล
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                พร้อมระบบวิเคราะห์ความมงคลและกาลกิณีแบบเรียลไทม์ขณะพิมพ์
              </p>
            </div>

            <form onSubmit={handleCreateName} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ชื่อภาษาไทย <span className="text-pink-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newName.name}
                    onChange={e => {
                      const val = e.target.value;
                      setNewName({ 
                        ...newName, 
                        name: val, 
                        startingLetter: val.charAt(0) || 'ก'
                      });
                    }}
                    placeholder="เช่น กฤติน, ญาดา, พชร"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    คำอ่าน <span className="text-pink-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newName.reading}
                    onChange={e => setNewName({ ...newName, reading: e.target.value })}
                    placeholder="เช่น กฺริด-ติน, ยา-ดา, พัด-ชะ-ระ"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              {/* REAL-TIME THAKSA COMPATIBILITY PREVIEW */}
              {liveThaksaCheck && (
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-slate-900 border border-amber-200 dark:border-slate-700 space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    วิเคราะห์ทักษาปกรณ์ 8 วันเกิดแบบเรียลไทม์:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    {liveThaksaCheck.map(chk => (
                      <div 
                        key={chk.day} 
                        className={`p-2 rounded-xl border text-center ${
                          chk.result.isKalakiniFree
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        <span className="block font-bold">{chk.result.dayThaiName.replace(/วัน/g, '')}</span>
                        <span className="text-[10px] block mt-0.5">
                          {chk.result.isKalakiniFree ? '✓ ไร้กาลกิณี' : `มี (${chk.result.kalakiniLettersFound.join(',')})`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ความหมายภาษาไทย <span className="text-pink-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={newName.meaning}
                  onChange={e => setNewName({ ...newName, meaning: e.target.value })}
                  placeholder="ความหมายที่ถูกต้องตามพจนานุกรมและคัมภีร์..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">เพศ</label>
                  <select
                    value={newName.gender}
                    onChange={e => setNewName({ ...newName, gender: e.target.value as Gender })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                  >
                    <option value="boy">เด็กชาย</option>
                    <option value="girl">เด็กหญิง</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">จำนวนพยางค์</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={newName.syllables}
                    onChange={e => setNewName({ ...newName, syllables: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">หมวดหมู่</label>
                  <select
                    value={newName.category}
                    onChange={e => setNewName({ ...newName, category: e.target.value as MeaningCategory })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                  >
                    <option value="success">ความสำเร็จ</option>
                    <option value="love">ความรัก</option>
                    <option value="wisdom">ความฉลาด</option>
                    <option value="wealth">ความมั่งคั่ง</option>
                    <option value="happiness">ความสุข</option>
                    <option value="health">สุขภาพ</option>
                    <option value="honor">เกียรติยศ</option>
                    <option value="prosperity">ความเจริญ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">ราศีที่สมพงศ์</label>
                  <select
                    value={newName.zodiacSign}
                    onChange={e => setNewName({ ...newName, zodiacSign: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                  >
                    {zodiacSigns.map(z => (
                      <option key={z.id} value={z.nameThai}>{z.nameThai}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">รากศัพท์ (Origin)</label>
                  <input
                    type="text"
                    value={newName.origin}
                    onChange={e => setNewName({ ...newName, origin: e.target.value })}
                    placeholder="เช่น บาลี-สันสกฤต"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-white shadow-md transition-all"
              >
                บันทึกชื่อใหม่ลงฐานข้อมูล
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: THAKSA CONFIGURATION */}
        {activeTab === 'thaksa' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 font-['Prompt']">
                  จัดการตารางอักษรมงคลและกาลกิณี (ทักษาปกรณ์)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ปรับปรุงหรือลบตัวอักษรประจำวันเกิด คลิกที่ป้ายตัวอักษรเพื่อลบออกทันที
                </p>
              </div>

              <button
                onClick={() => {
                  storage.resetThaksaDay(selectedThaksaDay);
                  showToast('คืนค่าอักษรตามตำราดั้งเดิมแล้ว', 'success');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                คืนค่ามาตรฐานของวันนี้
              </button>
            </div>

            {/* DAY SELECTOR */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
              {Object.keys(thaksaConfigs).map(dayKey => {
                const conf = thaksaConfigs[dayKey as DayOfWeek];
                return (
                  <button
                    key={dayKey}
                    onClick={() => setSelectedThaksaDay(dayKey as DayOfWeek)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedThaksaDay === dayKey
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {conf.thaiName}
                  </button>
                );
              })}
            </div>

            {/* ADD LETTER TOOL */}
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-slate-900 border border-amber-200 dark:border-slate-700 flex items-center gap-3 flex-wrap text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                เพิ่มอักษรใน {thaksaConfigs[selectedThaksaDay].thaiName}:
              </span>
              <select
                value={newLetterCategory}
                onChange={e => setNewLetterCategory(e.target.value as keyof ThaksaDayConfig)}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
              >
                <option value="sri">หมวด ศรี (โชคลาภ/เสน่ห์)</option>
                <option value="dej">หมวด เดช (อำนาจ/เกียรติยศ)</option>
                <option value="montri">หมวด มนตรี (ผู้อุปถัมภ์)</option>
                <option value="ayu">หมวด อายุ (สุขภาพ)</option>
                <option value="barivara">หมวด บริวาร</option>
                <option value="mula">หมวด มูละ</option>
                <option value="utsaha">หมวด อุตสาหะ</option>
                <option value="kalakini">หมวด กาลกิณี (ห้ามใช้)</option>
              </select>
              <input
                type="text"
                maxLength={4}
                value={newLetterInput}
                onChange={e => setNewLetterInput(e.target.value)}
                placeholder="ระบุอักษร"
                className="w-20 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-bold"
              />
              <button
                type="button"
                onClick={handleAddThaksaLetter}
                className="px-3 py-1.5 rounded-xl font-bold bg-amber-500 text-white hover:bg-amber-600"
              >
                เพิ่มอักษร +
              </button>
            </div>

            {/* VISUAL INTERACTIVE MATRIX */}
            {thaksaConfigs[selectedThaksaDay] && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                
                {/* SRI */}
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 space-y-2">
                  <div className="flex items-center justify-between font-bold text-amber-800 dark:text-amber-300">
                    <span>หมวด ศรี (โชคลาภ/เงินทอง)</span>
                    <span className="text-[10px] font-mono">{thaksaConfigs[selectedThaksaDay].sri.length} ตัว</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {thaksaConfigs[selectedThaksaDay].sri.map(l => (
                      <span 
                        key={l}
                        onClick={() => handleRemoveThaksaLetter('sri', l)}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 text-amber-800 dark:text-amber-200 font-bold cursor-pointer hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="คลิกเพื่อลบ"
                      >
                        {l} ×
                      </span>
                    ))}
                  </div>
                </div>

                {/* DEJ */}
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 space-y-2">
                  <div className="flex items-center justify-between font-bold text-red-800 dark:text-red-300">
                    <span>หมวด เดช (อำนาจ/บารมี)</span>
                    <span className="text-[10px] font-mono">{thaksaConfigs[selectedThaksaDay].dej.length} ตัว</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {thaksaConfigs[selectedThaksaDay].dej.map(l => (
                      <span 
                        key={l}
                        onClick={() => handleRemoveThaksaLetter('dej', l)}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-red-300 text-red-800 dark:text-red-200 font-bold cursor-pointer hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="คลิกเพื่อลบ"
                      >
                        {l} ×
                      </span>
                    ))}
                  </div>
                </div>

                {/* MONTRI */}
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-2">
                  <div className="flex items-center justify-between font-bold text-blue-800 dark:text-blue-300">
                    <span>หมวด มนตรี (ผู้ใหญ่อุปถัมภ์)</span>
                    <span className="text-[10px] font-mono">{thaksaConfigs[selectedThaksaDay].montri.length} ตัว</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {thaksaConfigs[selectedThaksaDay].montri.map(l => (
                      <span 
                        key={l}
                        onClick={() => handleRemoveThaksaLetter('montri', l)}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-blue-300 text-blue-800 dark:text-blue-200 font-bold cursor-pointer hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="คลิกเพื่อลบ"
                      >
                        {l} ×
                      </span>
                    ))}
                  </div>
                </div>

                {/* KALAKINI */}
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-900 space-y-2">
                  <div className="flex items-center justify-between font-bold text-rose-800 dark:text-rose-300">
                    <span>หมวด กาลกิณี (ห้ามใช้!)</span>
                    <span className="text-[10px] font-mono">{thaksaConfigs[selectedThaksaDay].kalakini.length} ตัว</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {thaksaConfigs[selectedThaksaDay].kalakini.map(l => (
                      <span 
                        key={l}
                        onClick={() => handleRemoveThaksaLetter('kalakini', l)}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-rose-400 text-rose-800 dark:text-rose-200 font-bold cursor-pointer hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="คลิกเพื่อลบ"
                      >
                        {l} ×
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* TAB 6: ZODIAC SIGNS MANAGEMENT */}
        {activeTab === 'zodiac' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 font-['Prompt']">
                จัดการข้อมูล 12 ราศีเกิด
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                คลิกปุ่มแก้ไขเพื่อปรับแต่งคุณลักษณะประจำราศี สีมงคล และดาวครองเรือน
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {zodiacSigns.map(z => (
                <div key={z.id} className="p-5 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-3 text-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{z.symbol}</span>
                        <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">{z.nameThai} ({z.nameEng})</h4>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold">
                        ธาตุ{z.element}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] font-mono">{z.dateRange} • ครองโดย {z.rulerPlanet}</p>
                    <p className="text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{z.description}</p>
                    
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      {z.traits.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded-md bg-pink-50 dark:bg-pink-950 text-pink-700 dark:text-pink-300 text-[10px] font-bold">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">สีมงคล: <strong className="text-pink-500">{z.luckyColors.join(', ')}</strong></span>
                    <button
                      onClick={() => setEditingZodiac(z)}
                      className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:bg-amber-100"
                    >
                      แก้ไขราศี
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: REPORTS & ANALYTICS */}
        {activeTab === 'reports' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 font-['Prompt']">
                รายงานและสถิติเชิงลึก
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                การวิเคราะห์สัดส่วนชื่อเด็ก หมวดหมู่ความหมาย และความนิยม
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* GENDER PROPORTION */}
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  สัดส่วนชื่อเด็กตามเพศ
                </h4>
                <div className="flex items-center gap-3">
                  <div className="flex-1 p-4 rounded-2xl bg-sky-100 dark:bg-sky-950 text-center">
                    <span className="block text-2xl font-black text-sky-800 dark:text-sky-200">50%</span>
                    <span className="text-xs text-sky-600">เด็กผู้ชาย (100 ชื่อ)</span>
                  </div>
                  <div className="flex-1 p-4 rounded-2xl bg-pink-100 dark:bg-pink-950 text-center">
                    <span className="block text-2xl font-black text-pink-800 dark:text-pink-200">50%</span>
                    <span className="text-xs text-pink-600">เด็กผู้หญิง (100 ชื่อ)</span>
                  </div>
                </div>
              </div>

              {/* POPULAR MEANINGS BREAKDOWN */}
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  หมวดหมู่ความหมายในฐานข้อมูล
                </h4>
                <div className="space-y-2 text-xs">
                  {[
                    { label: 'ความฉลาด/ปัญญา', pct: 28, color: 'bg-sky-400' },
                    { label: 'ความเจริญ/สิริมงคล', pct: 22, color: 'bg-emerald-400' },
                    { label: 'ความรัก/เมตตา', pct: 18, color: 'bg-pink-400' },
                    { label: 'เกียรติยศ/อำนาจ', pct: 15, color: 'bg-purple-400' },
                    { label: 'ความมั่งคั่ง/ทรัพย์', pct: 17, color: 'bg-amber-400' }
                  ].map((cat, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{cat.label}</span>
                        <span className="text-slate-400 font-mono">{cat.pct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className={`h-full ${cat.color}`} style={{ width: `${cat.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 8: SETTINGS & FIREBASE CONFIG */}
        {activeTab === 'settings' && (
          <div className="space-y-8 max-w-3xl">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 font-['Prompt']">
                ตั้งค่าระบบ & การเชื่อมต่อ Firebase
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                กำหนดค่าเว็บไซต์ ข้อความสงวนสิทธิ์ และการเชื่อมต่อ Cloud Firestore
              </p>
            </div>

            {/* FIREBASE CONNECTION GUIDE & SETUP */}
            <div className="p-6 rounded-3xl bg-amber-50/70 dark:bg-amber-950/40 border-2 border-amber-200 dark:border-amber-900 space-y-4">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                <Server className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm">การเชื่อมต่อ Firebase Backend (Firestore & Auth)</h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                ระบบ GNO BABY ถูกออกแบบให้ทำงานแบบ Hybrid: เมื่อยังไม่มีการระบุข้อมูล Firebase ระบบจะบันทึกและประมวลผลผ่าน Local Persistent Storage พร้อมรายชื่อ 200 รายชื่ออย่างสมบูรณ์แบบ หากคุณต้องการเชื่อมต่อไปยัง Google Cloud Firestore สามารถระบุค่า Configuration ได้ที่นี่:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Firebase Project ID</label>
                  <input
                    type="text"
                    value={settings.firebaseProjectId || ''}
                    onChange={e => storage.updateSettings({ firebaseProjectId: e.target.value })}
                    placeholder="เช่น gno-baby-app"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">API Key</label>
                  <input
                    type="password"
                    value={settings.firebaseApiKey || ''}
                    onChange={e => storage.updateSettings({ firebaseApiKey: e.target.value })}
                    placeholder="AIzaSy..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleTestFirebase}
                  disabled={testingFirebase}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingFirebase ? 'animate-spin' : ''}`} />
                  {testingFirebase ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ Firestore'}
                </button>
                {firebaseStatus && (
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {firebaseStatus}
                  </span>
                )}
              </div>
            </div>

            {/* FULL BACKUP AND RESTORE JSON */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                สำรองและกู้คืนข้อมูลระบบ (Backup & Restore)
              </h3>
              <p className="text-xs text-slate-500">
                ดาวน์โหลดข้อมูลชื่อทั้งหมด 200+ ชื่อ ตารางทักษา และบัญชีสมาชิกเป็นไฟล์ JSON เพื่อสำรองหรือย้ายระบบ
              </p>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={handleExportFullBackup}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  <FileDown className="w-4 h-4" />
                  ดาวน์โหลดไฟล์สำรองข้อมูล (JSON)
                </button>

                <label className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer shadow-xs">
                  <Upload className="w-4 h-4 text-indigo-500" />
                  กู้คืนข้อมูลจากไฟล์ JSON
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFullBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* GENERAL SETTINGS */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                ข้อมูลทั่วไปของเว็บไซต์
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">ชื่อเว็บไซต์</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={e => storage.updateSettings({ siteName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">อีเมลติดต่อ</label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={e => storage.updateSettings({ contactEmail: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-xs">
                  ข้อความชี้แจง (Astrology Disclaimer)
                </label>
                <textarea
                  rows={3}
                  value={settings.disclaimerText}
                  onChange={e => storage.updateSettings({ disclaimerText: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
              </div>
            </div>

            {/* RESET DATABASE */}
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-rose-800 dark:text-rose-200">รีเซ็ตฐานข้อมูลเป็นค่าเริ่มต้น</h4>
                <p className="text-[11px] text-rose-600 dark:text-rose-400">
                  คืนค่าฐานข้อมูลชื่อ 200 รายชื่อแท้ และคืนค่าตารางทักษาเริ่มต้น
                </p>
              </div>
              <button
                onClick={() => {
                  if (confirm('คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตฐานข้อมูลเป็นค่าเริ่มต้น 200 รายชื่อ?')) {
                    storage.resetToDefault();
                    showToast('รีเซ็ตฐานข้อมูลเรียบร้อยแล้ว', 'success');
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
              >
                รีเซ็ตข้อมูล
              </button>
            </div>
          </div>
        )}

      </main>

      {/* CSV IMPORT MODAL */}
      {csvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in-50">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-amber-500" />
                นำเข้าข้อมูลชื่อเด็กจาก CSV
              </h3>
              <button onClick={() => setCsvModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              วางข้อความ CSV ในรูปแบบ: <br />
              <code className="text-pink-600 font-mono text-[11px]">name,reading,meaning,gender,startingLetter,syllables,category,zodiacSign</code>
            </p>

            <textarea
              rows={8}
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              placeholder="กิตติภพ,กิด-ติ-พบ,ผู้มีเกียรติยศชื่อเสียงในโลก,boy,ก,3,honor,ราศีสิงห์"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCsvModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:bg-slate-100"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleImportCSVSubmit}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-white"
              >
                เริ่มนำเข้า
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT NAME MODAL */}
      {editingName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in-50">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                แก้ไขข้อมูลชื่อ: {editingName.name}
              </h3>
              <button onClick={() => setEditingName(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleUpdateNameSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">ชื่อภาษาไทย</label>
                <input
                  type="text"
                  value={editingName.name}
                  onChange={e => setEditingName({ ...editingName, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">คำอ่าน</label>
                <input
                  type="text"
                  value={editingName.reading}
                  onChange={e => setEditingName({ ...editingName, reading: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">ความหมาย</label>
                <textarea
                  rows={2}
                  value={editingName.meaning}
                  onChange={e => setEditingName({ ...editingName, meaning: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">เพศ</label>
                  <select
                    value={editingName.gender}
                    onChange={e => setEditingName({ ...editingName, gender: e.target.value as Gender })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="boy">เด็กชาย</option>
                    <option value="girl">เด็กหญิง</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">ราศี</label>
                  <select
                    value={editingName.zodiacSign}
                    onChange={e => setEditingName({ ...editingName, zodiacSign: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    {zodiacSigns.map(z => (
                      <option key={z.id} value={z.nameThai}>{z.nameThai}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingName(null)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-amber-500 text-white"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW MEMBER MODAL */}
      {newMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in-50">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                เพิ่มสมาชิกใหม่จากหลังบ้าน
              </h3>
              <button onClick={() => setNewMemberModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">ชื่อ - นามสกุล *</label>
                <input
                  type="text"
                  required
                  value={newMemberData.name}
                  onChange={e => setNewMemberData({ ...newMemberData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">อีเมล *</label>
                <input
                  type="email"
                  required
                  value={newMemberData.email}
                  onChange={e => setNewMemberData({ ...newMemberData, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">ชื่อเล่น</label>
                  <input
                    type="text"
                    value={newMemberData.nickname}
                    onChange={e => setNewMemberData({ ...newMemberData, nickname: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">บทบาท</label>
                  <select
                    value={newMemberData.role}
                    onChange={e => setNewMemberData({ ...newMemberData, role: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="member">สมาชิกทั่วไป (Member)</option>
                    <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">รหัสผ่านตั้งต้น</label>
                <input
                  type="text"
                  value={newMemberData.password}
                  onChange={e => setNewMemberData({ ...newMemberData, password: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewMemberModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-pink-500 text-white"
                >
                  สร้างสมาชิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER DETAIL MODAL */}
      {userModalOpen && selectedUserForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in-50">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedUserForDetail.avatar || '👶'}</span>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    {selectedUserForDetail.name}
                  </h3>
                  <span className="font-mono text-xs font-bold text-pink-500">
                    {selectedUserForDetail.memberId}
                  </span>
                </div>
              </div>
              <button onClick={() => setUserModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 text-xs pr-1">
              <div>
                <p className="text-slate-400">อีเมล: <strong className="text-slate-700 dark:text-slate-300">{selectedUserForDetail.email}</strong></p>
                <p className="text-slate-400">เบอร์โทร: <strong className="text-slate-700 dark:text-slate-300">{selectedUserForDetail.phone || '-'}</strong></p>
                <p className="text-slate-400">กำหนดคลอด: <strong className="text-slate-700 dark:text-slate-300">{selectedUserForDetail.expectedDueDate || '-'}</strong></p>
              </div>

              {/* USER'S FAVORITES */}
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">
                  ชื่อที่บันทึกไว้ ({storage.getFavorites(selectedUserForDetail.id).length} ชื่อ):
                </h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {storage.getFavorites(selectedUserForDetail.id).map(fav => {
                    const b = allNames.find(x => x.id === fav.babyNameId);
                    return (
                      <div key={fav.id} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{b?.name || fav.babyNameId}</span>
                        {fav.note && <span className="text-[10px] text-pink-500 italic truncate max-w-xs">{fav.note}</span>}
                      </div>
                    );
                  })}
                  {storage.getFavorites(selectedUserForDetail.id).length === 0 && (
                    <p className="text-slate-400 italic">ไม่มีรายการชื่อที่บันทึก</p>
                  )}
                </div>
              </div>

              {/* USER'S SEARCH HISTORY */}
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">
                  ประวัติการค้นหาล่าสุด ({storage.getSearchHistory(selectedUserForDetail.id).length} ครั้ง):
                </h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {storage.getSearchHistory(selectedUserForDetail.id).slice(0, 5).map(h => (
                    <div key={h.id} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center text-[11px]">
                      <span>{h.keyword ? `"${h.keyword}"` : h.zodiac || h.dayOfWeek || 'ค้นหาทั่วไป'}</span>
                      <span className="text-slate-400 text-[10px]">{new Date(h.timestamp).toLocaleDateString('th-TH')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setUserModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ZODIAC MODAL */}
      {editingZodiac && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in-50">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                แก้ไขข้อมูลราศี: {editingZodiac.nameThai}
              </h3>
              <button onClick={() => setEditingZodiac(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">ดาวครองเรือน</label>
                <input
                  type="text"
                  value={editingZodiac.rulerPlanet}
                  onChange={e => setEditingZodiac({ ...editingZodiac, rulerPlanet: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">คำอธิบาย</label>
                <textarea
                  rows={3}
                  value={editingZodiac.description}
                  onChange={e => setEditingZodiac({ ...editingZodiac, description: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">สีมงคล (คั่นด้วยจุลภาค)</label>
                <input
                  type="text"
                  value={editingZodiac.luckyColors.join(', ')}
                  onChange={e => setEditingZodiac({ ...editingZodiac, luckyColors: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingZodiac(null)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={() => {
                    storage.updateZodiacSign(editingZodiac.id, editingZodiac);
                    showToast(`บันทึกข้อมูลราศี ${editingZodiac.nameThai} แล้ว`, 'success');
                    setEditingZodiac(null);
                  }}
                  className="px-5 py-2 rounded-xl font-bold bg-amber-500 text-white"
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
