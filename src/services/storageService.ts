import { 
  BabyName, 
  User, 
  FavoriteItem, 
  SearchHistoryItem, 
  ThaksaDayConfig, 
  ZodiacSign, 
  AdminLog, 
  SystemSettings,
  DayOfWeek,
  MeaningCategory
} from '../types';
import { INITIAL_BABY_NAMES } from '../data/initialBabyNames';
import { THAKSA_DAYS } from '../data/thaksaData';
import { ZODIAC_SIGNS } from '../data/zodiacData';

const STORAGE_KEYS = {
  BABY_NAMES: 'gno_baby_names_v2',
  USERS: 'gno_users_v2',
  FAVORITES: 'gno_favorites_v2',
  SEARCH_HISTORY: 'gno_search_history_v2',
  THAKSA_CONFIG: 'gno_thaksa_config_v2',
  ZODIAC_CONFIG: 'gno_zodiac_config_v2',
  ADMIN_LOGS: 'gno_admin_logs_v2',
  SYSTEM_SETTINGS: 'gno_system_settings_v2',
  CURRENT_USER: 'gno_current_user_v2',
  COMPARE_LIST: 'gno_compare_list_v2'
};

const DEFAULT_SETTINGS: SystemSettings = {
  siteName: 'GNO BABY',
  siteTagline: 'ระบบตั้งชื่อเด็กตามวันเกิดและราศี ด้วยหลักทักษาปกรณ์มงคล',
  contactEmail: 'contact@gnobaby.thai',
  itemsPerPage: 12,
  allowPublicSearch: true,
  enableAiSuggestions: true,
  maintenanceMode: false,
  disclaimerText: 'การคำนวณชื่อมงคลนี้เป็นความเชื่อตามหลักโหราศาสตร์ไทยทักษาปกรณ์โบราณ ไม่สามารถรับประกันผลลัพธ์ในชีวิตจริง ควรใช้วิจารณญาณประกอบการตัดสินใจ'
};

class StorageService {
  // Listeners for reactivity
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initDefaultData();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => {
      try { fn(); } catch (e) { console.error(e); }
    });
  }

  private initDefaultData() {
    if (!localStorage.getItem(STORAGE_KEYS.BABY_NAMES)) {
      localStorage.setItem(STORAGE_KEYS.BABY_NAMES, JSON.stringify(INITIAL_BABY_NAMES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.THAKSA_CONFIG)) {
      localStorage.setItem(STORAGE_KEYS.THAKSA_CONFIG, JSON.stringify(THAKSA_DAYS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ZODIAC_CONFIG)) {
      localStorage.setItem(STORAGE_KEYS.ZODIAC_CONFIG, JSON.stringify(ZODIAC_SIGNS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SYSTEM_SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SYSTEM_SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      // Create initial demo member and initial admin
      const initialUsers: User[] = [
        {
          id: 'admin-001',
          memberId: 'GNO-A000001',
          email: 'admin@gnobaby.thai',
          name: 'ผู้ดูแลระบบสูงสุด',
          nickname: 'แอดมิน',
          role: 'admin',
          avatar: '👨‍💼',
          phone: '0812345678',
          status: 'active',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        },
        {
          id: 'member-001',
          memberId: 'GNO-M000001',
          email: 'parent@example.com',
          name: 'คุณพ่อนักคิด & คุณแม่สายหวาน',
          nickname: 'ครอบครัวสุขสันต์',
          role: 'member',
          avatar: '👨‍👩‍👧',
          phone: '0898765432',
          expectedDueDate: '2026-11-15',
          status: 'active',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
      // Store default passkeys in secure local auth store
      localStorage.setItem('gno_auth_hashes', JSON.stringify({
        'admin@gnobaby.thai': 'Admin@123456',
        'GNO-A000001': 'Admin@123456',
        'parent@example.com': 'Password123'
      }));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ADMIN_LOGS)) {
      const initialLogs: AdminLog[] = [
        {
          id: 'log-001',
          adminId: 'GNO-A000001',
          adminName: 'ผู้ดูแลระบบสูงสุด',
          action: 'INIT_SYSTEM',
          details: 'ติดตั้งระบบและนำเข้าข้อมูลตั้งต้น 200 ชื่อภาษาไทยสำเร็จ',
          timestamp: new Date().toISOString()
        }
      ];
      localStorage.setItem(STORAGE_KEYS.ADMIN_LOGS, JSON.stringify(initialLogs));
    }
  }

  // --- BABY NAMES ---
  public getBabyNames(): BabyName[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BABY_NAMES);
    return raw ? JSON.parse(raw) : INITIAL_BABY_NAMES;
  }

  public getBabyNameById(id: string): BabyName | undefined {
    return this.getBabyNames().find(n => n.id === id);
  }

  public addBabyName(nameData: Omit<BabyName, 'id' | 'searchCount' | 'favoriteCount' | 'createdAt'>): BabyName {
    const names = this.getBabyNames();
    const newName: BabyName = {
      ...nameData,
      id: `custom-${Date.now()}`,
      searchCount: 0,
      favoriteCount: 0,
      createdAt: new Date().toISOString()
    };
    names.unshift(newName);
    localStorage.setItem(STORAGE_KEYS.BABY_NAMES, JSON.stringify(names));
    this.addAdminLog('ADD_NAME', `เพิ่มชื่อเด็กใหม่: ${newName.name} (${newName.gender})`, newName.id);
    this.notify();
    return newName;
  }

  public updateBabyName(id: string, updates: Partial<BabyName>): boolean {
    const names = this.getBabyNames();
    const index = names.findIndex(n => n.id === id);
    if (index === -1) return false;
    names[index] = { ...names[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.BABY_NAMES, JSON.stringify(names));
    this.addAdminLog('UPDATE_NAME', `แก้ไขชื่อเด็ก: ${names[index].name}`, id);
    this.notify();
    return true;
  }

  public deleteBabyName(id: string): boolean {
    const names = this.getBabyNames();
    const target = names.find(n => n.id === id);
    const filtered = names.filter(n => n.id !== id);
    if (names.length === filtered.length) return false;
    localStorage.setItem(STORAGE_KEYS.BABY_NAMES, JSON.stringify(filtered));
    if (target) {
      this.addAdminLog('DELETE_NAME', `ลบชื่อเด็ก: ${target.name}`, id);
    }
    this.notify();
    return true;
  }

  public incrementSearchCount(id: string) {
    const names = this.getBabyNames();
    const item = names.find(n => n.id === id);
    if (item) {
      item.searchCount = (item.searchCount || 0) + 1;
      localStorage.setItem(STORAGE_KEYS.BABY_NAMES, JSON.stringify(names));
      this.notify();
    }
  }

  public importNamesFromCSV(csvText: string): { successCount: number; errors: string[] } {
    const lines = csvText.split('\n').filter(l => l.trim().length > 0);
    if (lines.length <= 1) return { successCount: 0, errors: ['ไฟล์ CSV ว่างเปล่าหรือไม่มีข้อมูล'] };

    const names = this.getBabyNames();
    let count = 0;
    const errors: string[] = [];

    // Format: name,reading,meaning,gender,startingLetter,syllables,category,zodiacSign
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length < 3) {
        errors.push(`บรรทัดที่ ${i + 1}: ข้อมูลไม่ครบถ้วน`);
        continue;
      }
      const [name, reading, meaning, genderStr, startingLetter, syllablesStr, category, zodiacSign] = parts;
      if (!name || !meaning) continue;

      const gender = (genderStr === 'girl' || genderStr === 'boy') ? genderStr : 'boy';
      const syllables = parseInt(syllablesStr) || 2;
      const letter = startingLetter || name.charAt(0);

      const exists = names.some(n => n.name === name);
      if (!exists) {
        names.push({
          id: `imp-${Date.now()}-${count}`,
          name,
          reading: reading || name,
          meaning,
          gender,
          startingLetter: letter,
          syllables,
          category: (category as any) || 'success',
          recommendedDays: ['monday', 'friday', 'sunday'],
          zodiacSign: zodiacSign || 'ราศีเมษ',
          searchCount: 0,
          favoriteCount: 0,
          origin: 'นำเข้าจาก CSV',
          thaksaNotes: 'ชื่อมงคลนำเข้า',
          createdAt: new Date().toISOString()
        });
        count++;
      }
    }

    localStorage.setItem(STORAGE_KEYS.BABY_NAMES, JSON.stringify(names));
    this.addAdminLog('IMPORT_CSV', `นำเข้าข้อมูลชื่อเด็กจาก CSV จำนวน ${count} ชื่อ`);
    this.notify();
    return { successCount: count, errors };
  }

  public exportNamesToCSV(): string {
    const names = this.getBabyNames();
    const headers = ['ID', 'ชื่อภาษาไทย', 'คำอ่าน', 'ความหมาย', 'เพศ', 'อักษรต้น', 'พยางค์', 'หมวดหมู่', 'ราศี', 'จำนวนค้นหา', 'จำนวนบันทึก'];
    const rows = names.map(n => [
      `"${n.id}"`,
      `"${n.name}"`,
      `"${n.reading}"`,
      `"${n.meaning.replace(/"/g, '""')}"`,
      `"${n.gender}"`,
      `"${n.startingLetter}"`,
      n.syllables,
      `"${n.category}"`,
      `"${n.zodiacSign}"`,
      n.searchCount,
      n.favoriteCount
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  // --- USERS & AUTH ---
  public getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : [];
  }

  public getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  public getUserByEmailOrMemberId(identifier: string): User | undefined {
    const trimmed = identifier.trim().toLowerCase();
    return this.getUsers().find(u => 
      u.email.toLowerCase() === trimmed || 
      u.memberId.toLowerCase() === trimmed
    );
  }

  public registerUser(data: { name: string; email: string; password: string; nickname?: string; phone?: string }): { user?: User; error?: string } {
    const users = this.getUsers();
    if (users.some(u => u.email.toLowerCase() === data.email.trim().toLowerCase())) {
      return { error: 'อีเมลนี้ถูกใช้งานแล้วในระบบ' };
    }

    // Generate unique Member ID: GNO-M000001
    const memberCount = users.filter(u => u.role === 'member').length + 1;
    const memberId = `GNO-M${String(memberCount).padStart(6, '0')}`;

    const newUser: User = {
      id: `usr-${Date.now()}`,
      memberId,
      email: data.email.trim().toLowerCase(),
      name: data.name.trim(),
      nickname: data.nickname?.trim(),
      phone: data.phone?.trim(),
      role: 'member',
      avatar: '👶',
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // Save password
    const hashes = JSON.parse(localStorage.getItem('gno_auth_hashes') || '{}');
    hashes[newUser.email] = data.password;
    localStorage.setItem('gno_auth_hashes', JSON.stringify(hashes));

    this.setCurrentUser(newUser);
    this.notify();
    return { user: newUser };
  }

  public authenticate(identifier: string, pass: string): { user?: User; error?: string } {
    const user = this.getUserByEmailOrMemberId(identifier);
    if (!user) {
      return { error: 'ไม่พบบัญชีผู้ใช้งานนี้ในระบบ กรุณาตรวจสอบอีเมลหรือรหัสสมาชิก' };
    }

    if (user.status === 'suspended') {
      return { error: 'บัญชีนี้ถูกระงับการใช้งานชั่วคราว กรุณาติดต่อผู้ดูแลระบบ' };
    }

    const hashes = JSON.parse(localStorage.getItem('gno_auth_hashes') || '{}');
    const stored = hashes[user.email] || hashes[user.memberId];

    if (!stored || stored !== pass) {
      return { error: 'รหัสผ่านไม่ถูกต้อง' };
    }

    user.lastLoginAt = new Date().toISOString();
    this.updateUser(user.id, { lastLoginAt: user.lastLoginAt });
    this.setCurrentUser(user);
    return { user };
  }

  public authenticateAdminPin(pin: string): { user?: User; error?: string } {
    if (pin.trim() !== '1111') {
      return { error: 'รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' };
    }

    let admin = this.getUsers().find(u => u.role === 'admin');
    if (!admin) {
      admin = {
        id: 'admin-001',
        memberId: 'GNO-A000001',
        email: 'admin@gnobaby.thai',
        name: 'ผู้ดูแลระบบ',
        nickname: 'แอดมิน',
        role: 'admin',
        avatar: '👨‍💼',
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      const users = this.getUsers();
      users.unshift(admin);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }

    admin.lastLoginAt = new Date().toISOString();
    this.updateUser(admin.id, { lastLoginAt: admin.lastLoginAt });
    this.setCurrentUser(admin);
    this.addAdminLog('ADMIN_LOGIN_PIN', 'เข้าสู่ระบบผู้ดูแลระบบด้วยรหัส PIN สำเร็จ');
    return { user: admin };
  }

  public updateUser(userId: string, updates: Partial<User>): boolean {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return false;
    users[idx] = { ...users[idx], ...updates };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      this.setCurrentUser(users[idx]);
    }
    this.notify();
    return true;
  }

  public updateUserPassword(emailOrMemberId: string, newPass: string): boolean {
    const hashes = JSON.parse(localStorage.getItem('gno_auth_hashes') || '{}');
    hashes[emailOrMemberId] = newPass;
    const user = this.getUserByEmailOrMemberId(emailOrMemberId);
    if (user) {
      hashes[user.email] = newPass;
      hashes[user.memberId] = newPass;
    }
    localStorage.setItem('gno_auth_hashes', JSON.stringify(hashes));
    return true;
  }

  public getCurrentUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  }

  public setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    this.notify();
  }

  // --- FAVORITES ---
  public getFavorites(userId?: string): FavoriteItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    const list: FavoriteItem[] = raw ? JSON.parse(raw) : [];
    if (userId) {
      return list.filter(f => f.userId === userId);
    }
    return list;
  }

  public isFavorite(userId: string, babyNameId: string): boolean {
    return this.getFavorites(userId).some(f => f.babyNameId === babyNameId);
  }

  public toggleFavorite(userId: string, babyNameId: string, note?: string): boolean {
    const list = this.getFavorites();
    const existingIndex = list.findIndex(f => f.userId === userId && f.babyNameId === babyNameId);

    const names = this.getBabyNames();
    const targetName = names.find(n => n.id === babyNameId);

    if (existingIndex >= 0) {
      // remove
      list.splice(existingIndex, 1);
      if (targetName && targetName.favoriteCount > 0) {
        targetName.favoriteCount--;
      }
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(list));
      localStorage.setItem(STORAGE_KEYS.BABY_NAMES, JSON.stringify(names));
      this.notify();
      return false; // not favorited
    } else {
      // add
      const newFav: FavoriteItem = {
        id: `fav-${Date.now()}`,
        userId,
        babyNameId,
        note: note || '',
        createdAt: new Date().toISOString()
      };
      list.unshift(newFav);
      if (targetName) {
        targetName.favoriteCount = (targetName.favoriteCount || 0) + 1;
      }
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(list));
      localStorage.setItem(STORAGE_KEYS.BABY_NAMES, JSON.stringify(names));
      this.notify();
      return true; // now favorited
    }
  }

  public updateFavoriteNote(userId: string, babyNameId: string, note: string): boolean {
    const list = this.getFavorites();
    const item = list.find(f => f.userId === userId && f.babyNameId === babyNameId);
    if (item) {
      item.note = note;
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(list));
      this.notify();
      return true;
    }
    return false;
  }

  // --- SEARCH HISTORY ---
  public getSearchHistory(userId?: string): SearchHistoryItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
    const list: SearchHistoryItem[] = raw ? JSON.parse(raw) : [];
    if (userId) {
      return list.filter(h => h.userId === userId);
    }
    return list;
  }

  public addSearchHistory(entry: Omit<SearchHistoryItem, 'id' | 'timestamp'>): SearchHistoryItem {
    const list = this.getSearchHistory();
    const newEntry: SearchHistoryItem = {
      ...entry,
      id: `hist-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    list.unshift(newEntry);
    // keep max 50 items
    if (list.length > 50) list.pop();
    localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(list));
    this.notify();
    return newEntry;
  }

  public clearSearchHistory(userId: string) {
    const list = this.getSearchHistory().filter(h => h.userId !== userId);
    localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(list));
    this.notify();
  }

  // --- NAME COMPARISON ---
  public getCompareList(): string[] {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPARE_LIST);
    return raw ? JSON.parse(raw) : [];
  }

  public toggleCompare(nameId: string): boolean {
    let list = this.getCompareList();
    if (list.includes(nameId)) {
      list = list.filter(id => id !== nameId);
      localStorage.setItem(STORAGE_KEYS.COMPARE_LIST, JSON.stringify(list));
      this.notify();
      return false;
    } else {
      if (list.length >= 4) {
        list.shift(); // keep max 4 for side-by-side compare
      }
      list.push(nameId);
      localStorage.setItem(STORAGE_KEYS.COMPARE_LIST, JSON.stringify(list));
      this.notify();
      return true;
    }
  }

  public clearCompareList() {
    localStorage.removeItem(STORAGE_KEYS.COMPARE_LIST);
    this.notify();
  }

  // --- THAKSA & ZODIAC CONFIGS ---
  public getThaksaConfig(): Record<DayOfWeek, ThaksaDayConfig> {
    const raw = localStorage.getItem(STORAGE_KEYS.THAKSA_CONFIG);
    return raw ? JSON.parse(raw) : THAKSA_DAYS;
  }

  public updateThaksaDay(day: DayOfWeek, config: ThaksaDayConfig) {
    const all = this.getThaksaConfig();
    all[day] = config;
    localStorage.setItem(STORAGE_KEYS.THAKSA_CONFIG, JSON.stringify(all));
    this.addAdminLog('UPDATE_THAKSA', `ปรับปรุงตารางอักษรมงคล: ${config.thaiName}`);
    this.notify();
  }

  public getZodiacSigns(): ZodiacSign[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ZODIAC_CONFIG);
    return raw ? JSON.parse(raw) : ZODIAC_SIGNS;
  }

  public updateZodiacSign(id: string, updates: Partial<ZodiacSign>) {
    const list = this.getZodiacSigns();
    const idx = list.findIndex(z => z.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      localStorage.setItem(STORAGE_KEYS.ZODIAC_CONFIG, JSON.stringify(list));
      this.addAdminLog('UPDATE_ZODIAC', `ปรับปรุงข้อมูลราศี: ${list[idx].nameThai}`);
      this.notify();
    }
  }

  // --- ADMIN LOGS ---
  public getAdminLogs(): AdminLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_LOGS);
    return raw ? JSON.parse(raw) : [];
  }

  public addAdminLog(action: string, details: string, target?: string) {
    const current = this.getCurrentUser();
    const logs = this.getAdminLogs();
    const newLog: AdminLog = {
      id: `log-${Date.now()}`,
      adminId: current?.memberId || 'SYSTEM',
      adminName: current?.name || 'ระบบอัตโนมัติ',
      action,
      details,
      target,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    if (logs.length > 200) logs.pop();
    localStorage.setItem(STORAGE_KEYS.ADMIN_LOGS, JSON.stringify(logs));
    this.notify();
  }

  // --- SYSTEM SETTINGS ---
  public getSettings(): SystemSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SYSTEM_SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  }

  public updateSettings(settings: Partial<SystemSettings>) {
    const current = this.getSettings();
    const merged = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SYSTEM_SETTINGS, JSON.stringify(merged));
    this.addAdminLog('UPDATE_SETTINGS', 'ปรับปรุงการตั้งค่าระบบ');
    this.notify();
  }

  // --- BATCH ACTIONS ON BABY NAMES ---
  public batchDeleteBabyNames(ids: string[]): number {
    const names = this.getBabyNames();
    const idSet = new Set(ids);
    const filtered = names.filter(n => !idSet.has(n.id));
    const deletedCount = names.length - filtered.length;
    localStorage.setItem(STORAGE_KEYS.BABY_NAMES, JSON.stringify(filtered));
    this.addAdminLog('BATCH_DELETE_NAMES', `ลบชื่อเด็กพร้อมกัน ${deletedCount} ชื่อ`);
    this.notify();
    return deletedCount;
  }

  public batchUpdateCategory(ids: string[], newCategory: MeaningCategory): number {
    const names = this.getBabyNames();
    const idSet = new Set(ids);
    let updatedCount = 0;
    names.forEach(n => {
      if (idSet.has(n.id)) {
        n.category = newCategory;
        updatedCount++;
      }
    });
    localStorage.setItem(STORAGE_KEYS.BABY_NAMES, JSON.stringify(names));
    this.addAdminLog('BATCH_UPDATE_CATEGORY', `เปลี่ยนหมวดหมู่ ${updatedCount} ชื่อเป็น ${newCategory}`);
    this.notify();
    return updatedCount;
  }

  public deleteUser(userId: string): boolean {
    const users = this.getUsers();
    const target = users.find(u => u.id === userId);
    if (!target || target.role === 'admin') return false; // Prevent deleting root admin
    const filtered = users.filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
    this.addAdminLog('DELETE_USER', `ลบผู้ใช้งาน ${target.name} (${target.memberId})`);
    this.notify();
    return true;
  }

  public resetThaksaDay(day: DayOfWeek) {
    const all = this.getThaksaConfig();
    all[day] = THAKSA_DAYS[day];
    localStorage.setItem(STORAGE_KEYS.THAKSA_CONFIG, JSON.stringify(all));
    this.addAdminLog('RESET_THAKSA_DAY', `คืนค่าอักษรทักษาเริ่มต้น: ${THAKSA_DAYS[day].thaiName}`);
    this.notify();
  }

  // --- FULL BACKUP AND RESTORE ---
  public exportFullBackupJSON(): string {
    const backupData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      babyNames: this.getBabyNames(),
      users: this.getUsers(),
      favorites: this.getFavorites(),
      searchHistory: this.getSearchHistory(),
      thaksaConfig: this.getThaksaConfig(),
      zodiacConfig: this.getZodiacSigns(),
      systemSettings: this.getSettings(),
      adminLogs: this.getAdminLogs()
    };
    return JSON.stringify(backupData, null, 2);
  }

  public importFullBackupJSON(jsonStr: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.babyNames || !Array.isArray(data.babyNames)) {
        return { success: false, message: 'รูปแบบไฟล์สำรองข้อมูลไม่ถูกต้อง (ไม่พบข้อมูล babyNames)' };
      }
      if (data.babyNames) localStorage.setItem(STORAGE_KEYS.BABY_NAMES, JSON.stringify(data.babyNames));
      if (data.thaksaConfig) localStorage.setItem(STORAGE_KEYS.THAKSA_CONFIG, JSON.stringify(data.thaksaConfig));
      if (data.zodiacConfig) localStorage.setItem(STORAGE_KEYS.ZODIAC_CONFIG, JSON.stringify(data.zodiacConfig));
      if (data.systemSettings) localStorage.setItem(STORAGE_KEYS.SYSTEM_SETTINGS, JSON.stringify(data.systemSettings));
      if (data.users && Array.isArray(data.users)) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));

      this.addAdminLog('RESTORE_BACKUP', `กู้คืนข้อมูลสำรองสำเร็จ (${data.babyNames.length} ชื่อ)`);
      this.notify();
      return { success: true, message: `กู้คืนข้อมูลสำเร็จ (${data.babyNames.length} ชื่อ, ${data.users?.length || 0} สมาชิก)` };
    } catch (err: any) {
      return { success: false, message: `ไม่สามารถนำเข้าได้: ${err.message}` };
    }
  }

  // --- DATABASE RESET / SEED ---
  public resetToDefault() {
    localStorage.setItem(STORAGE_KEYS.BABY_NAMES, JSON.stringify(INITIAL_BABY_NAMES));
    localStorage.setItem(STORAGE_KEYS.THAKSA_CONFIG, JSON.stringify(THAKSA_DAYS));
    localStorage.setItem(STORAGE_KEYS.ZODIAC_CONFIG, JSON.stringify(ZODIAC_SIGNS));
    this.addAdminLog('RESET_DATABASE', 'รีเซ็ตฐานข้อมูลชื่อ 200 ชื่อและตารางตั้งต้น');
    this.notify();
  }
}

export const storage = new StorageService();
