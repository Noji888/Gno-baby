import { DayOfWeek, ThaksaDayConfig, BabyName } from '../types';
import { storage } from './storageService';

export interface ThaksaAnalysis {
  day: DayOfWeek;
  dayThaiName: string;
  isKalakiniFree: boolean;
  kalakiniLettersFound: string[];
  startingLetterCategory: 'sri' | 'dej' | 'montri' | 'barivara' | 'ayu' | 'mula' | 'utsaha' | 'kalakini' | 'unknown';
  auspiciousLettersCount: number;
  score: number; // 0 - 100
  summaryReason: string;
  categoryBreakdown: {
    sri: string[];
    dej: string[];
    montri: string[];
    barivara: string[];
    ayu: string[];
    mula: string[];
    utsaha: string[];
    kalakini: string[];
  };
}

export function determineDayOfWeek(date: Date, timeStr?: string): DayOfWeek {
  const dayIndex = date.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday

  if (dayIndex === 3) {
    // Wednesday: Check time
    if (timeStr) {
      const [hours] = timeStr.split(':').map(Number);
      if (hours >= 18 || hours < 6) {
        return 'wednesday_night';
      }
    }
    return 'wednesday_day';
  }

  const days: DayOfWeek[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday_day',
    'thursday',
    'friday',
    'saturday'
  ];

  return days[dayIndex];
}

export function getCleanConsonants(thaiWord: string): string[] {
  // Extract consonants and primary vowels from Thai string
  const chars = thaiWord.split('');
  return chars.filter(c => c.trim().length > 0);
}

export function analyzeNameThaksa(name: string, day: DayOfWeek): ThaksaAnalysis {
  const configs = storage.getThaksaConfig();
  const config = configs[day];

  const letters = getCleanConsonants(name);
  const startingLetter = letters[0] || '';

  const breakdown = {
    sri: [] as string[],
    dej: [] as string[],
    montri: [] as string[],
    barivara: [] as string[],
    ayu: [] as string[],
    mula: [] as string[],
    utsaha: [] as string[],
    kalakini: [] as string[]
  };

  letters.forEach(char => {
    if (config.kalakini.includes(char)) breakdown.kalakini.push(char);
    if (config.sri.includes(char)) breakdown.sri.push(char);
    if (config.dej.includes(char)) breakdown.dej.push(char);
    if (config.montri.includes(char)) breakdown.montri.push(char);
    if (config.barivara.includes(char)) breakdown.barivara.push(char);
    if (config.ayu.includes(char)) breakdown.ayu.push(char);
    if (config.mula.includes(char)) breakdown.mula.push(char);
    if (config.utsaha.includes(char)) breakdown.utsaha.push(char);
  });

  const isKalakiniFree = breakdown.kalakini.length === 0;

  // Determine starting letter category
  let startingCategory: ThaksaAnalysis['startingLetterCategory'] = 'unknown';
  if (config.sri.includes(startingLetter)) startingCategory = 'sri';
  else if (config.dej.includes(startingLetter)) startingCategory = 'dej';
  else if (config.montri.includes(startingLetter)) startingCategory = 'montri';
  else if (config.barivara.includes(startingLetter)) startingCategory = 'barivara';
  else if (config.ayu.includes(startingLetter)) startingCategory = 'ayu';
  else if (config.mula.includes(startingLetter)) startingCategory = 'mula';
  else if (config.utsaha.includes(startingLetter)) startingCategory = 'utsaha';
  else if (config.kalakini.includes(startingLetter)) startingCategory = 'kalakini';

  // Score calculation
  let score = 70;
  if (!isKalakiniFree) {
    score -= 40;
  } else {
    score += 15;
  }
  if (startingCategory === 'sri' || startingCategory === 'dej' || startingCategory === 'montri') {
    score += 15;
  }

  score = Math.min(100, Math.max(20, score));

  // Reason summary
  let reason = '';
  if (!isKalakiniFree) {
    reason = `มีอักษรกาลกิณี (${breakdown.kalakini.join(', ')}) ซึ่งตามตำราทักษาโบราณแนะนำให้หลีกเลี่ยงสำหรับผู้เกิด${config.thaiName}`;
  } else {
    const highlights: string[] = [];
    if (breakdown.sri.length > 0) highlights.push(`เสริมศรี (${breakdown.sri.join(', ')}) นำพาโชคลาภความร่ำรวย`);
    if (breakdown.dej.length > 0) highlights.push(`มีเดช (${breakdown.dej.join(', ')}) เสริมอำนาจบารมี`);
    if (breakdown.montri.length > 0) highlights.push(`มีมนตรี (${breakdown.montri.join(', ')}) มีผู้ใหญ่เกื้อหนุน`);
    if (breakdown.ayu.length > 0) highlights.push(`มีอายุ (${breakdown.ayu.join(', ')}) เสริมสุขภาพพลานามัย`);

    reason = `เป็นมงคลแท้ ไร้อักษรกาลกิณี ${highlights.slice(0, 2).join(' ')} เหมาะสมอย่างยิ่งสำหรับผู้เกิด${config.thaiName}`;
  }

  return {
    day,
    dayThaiName: config.thaiName,
    isKalakiniFree,
    kalakiniLettersFound: breakdown.kalakini,
    startingLetterCategory: startingCategory,
    auspiciousLettersCount: breakdown.sri.length + breakdown.dej.length + breakdown.montri.length,
    score,
    summaryReason: reason,
    categoryBreakdown: breakdown
  };
}
