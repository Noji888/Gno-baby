export type Gender = 'boy' | 'girl' | 'unspecified';

export type DayOfWeek = 
  | 'sunday' 
  | 'monday' 
  | 'tuesday' 
  | 'wednesday_day' 
  | 'wednesday_night' 
  | 'thursday' 
  | 'friday' 
  | 'saturday';

export type MeaningCategory = 
  | 'success' // ความสำเร็จ
  | 'love' // ความรัก
  | 'wisdom' // ความฉลาด/ปัญญา
  | 'wealth' // ความมั่งคั่ง/ร่ำรวย
  | 'happiness' // ความสุข
  | 'health' // สุขภาพ/อายุยืน
  | 'honor' // เกียรติยศ/อำนาจ
  | 'prosperity'; // ความเจริญก้าวหน้า

export interface BabyName {
  id: string;
  name: string; // ชื่อภาษาไทย เช่น "กิตติภพ"
  reading: string; // คำอ่าน เช่น "กิด-ติ-พบ"
  meaning: string; // ความหมาย เช่น "ผู้มีชื่อเสียงในโลก"
  gender: 'boy' | 'girl' | 'unspecified';
  startingLetter: string; // ก, ข, ค ...
  syllables: number; // 1, 2, 3, 4
  category: MeaningCategory;
  recommendedDays: DayOfWeek[]; // วันเกิดที่แนะนำตามทักษา
  zodiacSign: string; // ราศีที่เกี่ยวข้อง เช่น "เมษ", "สิงห์"
  searchCount: number;
  favoriteCount: number;
  origin?: string; // รากศัพท์ เช่น บาลี-สันสกฤต
  thaksaNotes?: string; // เหตุผลที่แนะนำตามทักษา
  createdAt: string;
}

export interface User {
  id: string; // Firebase UID or local ID
  memberId: string; // e.g. "GNO-M000001" or "GNO-A000001"
  email: string;
  name: string;
  nickname?: string;
  role: 'member' | 'admin';
  avatar?: string;
  phone?: string;
  expectedDueDate?: string;
  status: 'active' | 'suspended';
  createdAt: string;
  lastLoginAt: string;
}

export interface FavoriteItem {
  id: string;
  userId: string;
  babyNameId: string;
  note?: string;
  createdAt: string;
}

export interface SearchHistoryItem {
  id: string;
  userId: string;
  gender?: Gender;
  birthDate?: string;
  dayOfWeek?: DayOfWeek;
  zodiac?: string;
  startingLetter?: string;
  syllables?: number;
  category?: MeaningCategory;
  keyword?: string;
  resultsCount: number;
  timestamp: string;
}

export interface ThaksaDayConfig {
  day: DayOfWeek;
  thaiName: string;
  description: string;
  color: string;
  celestialBody: string;
  // 8 Thaksa properties with letters:
  barivara: string[]; // บริวาร
  ayu: string[]; // อายุ
  dej: string[]; // เดช
  sri: string[]; // ศรี
  mula: string[]; // มูละ
  utsaha: string[]; // อุตสาหะ
  montri: string[]; // มนตรี
  kalakini: string[]; // กาลกิณี (ห้ามใช้)
}

export interface ZodiacSign {
  id: string;
  nameThai: string; // เช่น "ราศีเมษ"
  nameEng: string; // "Aries"
  symbol: string; // "♈"
  dateRange: string; // "13 เม.ย. - 13 พ.ค."
  element: 'ไฟ' | 'ดิน' | 'ลม' | 'น้ำ';
  rulerPlanet: string;
  luckyColors: string[];
  luckyNumbers: number[];
  traits: string[];
  description: string;
}

export interface AdminLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  details: string;
  target?: string;
  timestamp: string;
}

export interface SystemSettings {
  siteName: string;
  siteTagline: string;
  contactEmail: string;
  itemsPerPage: number;
  allowPublicSearch: boolean;
  enableAiSuggestions: boolean;
  firebaseProjectId?: string;
  firebaseApiKey?: string;
  firebaseAuthDomain?: string;
  firebaseStorageBucket?: string;
  firebaseMessagingSenderId?: string;
  firebaseAppId?: string;
  maintenanceMode: boolean;
  disclaimerText: string;
}
