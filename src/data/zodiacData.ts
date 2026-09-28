import { ZodiacSign } from '../types';

export const ZODIAC_SIGNS: ZodiacSign[] = [
  {
    id: 'aries',
    nameThai: 'ราศีเมษ',
    nameEng: 'Aries',
    symbol: '♈',
    dateRange: '13 เม.ย. - 14 พ.ค.',
    element: 'ไฟ',
    rulerPlanet: 'ดาวอังคาร',
    luckyColors: ['สีแดง', 'สีส้ม', 'สีทอง'],
    luckyNumbers: [1, 9, 14],
    traits: ['ผู้นำ', 'กล้าหาญ', 'กระตือรือร้น', 'ตรงไปตรงมา'],
    description: 'ราศีแห่งการเริ่มต้น พลังงานเปี่ยมล้น มีความเป็นผู้นำสูง กล้าคิดกล้าทำ'
  },
  {
    id: 'taurus',
    nameThai: 'ราศีพฤษภ',
    nameEng: 'Taurus',
    symbol: '♉',
    dateRange: '15 พ.ค. - 14 มิ.ย.',
    element: 'ดิน',
    rulerPlanet: 'ดาวศุกร์',
    luckyColors: ['สีเขียว', 'สีชมพู', 'สีขาว'],
    luckyNumbers: [2, 6, 15],
    traits: ['หนักแน่น', 'ซื่อสัตย์', 'รักสงบ', 'ละเอียดรอบคอบ'],
    description: 'ราศีแห่งความมั่นคง รักความสงบ มีความอดทนเป็นเลิศ และมีความประณีต'
  },
  {
    id: 'gemini',
    nameThai: 'ราศีเมถุน',
    nameEng: 'Gemini',
    symbol: '♊',
    dateRange: '15 มิ.ย. - 15 ก.ค.',
    element: 'ลม',
    rulerPlanet: 'ดาวพุธ',
    luckyColors: ['สีเขียวอ่อน', 'สีเหลือง', 'สีฟ้า'],
    luckyNumbers: [3, 5, 23],
    traits: ['ฉลาดเฉลียว', 'ช่างเจรจา', 'ปรับตัวเก่ง', 'เรียนรู้ไว'],
    description: 'ราศีแห่งปัญญาและวาจา มีไหวพริบยอดเยี่ยม เจรจาโน้มน้าวใจเก่ง'
  },
  {
    id: 'cancer',
    nameThai: 'ราศีกรกฎ',
    nameEng: 'Cancer',
    symbol: '♋',
    dateRange: '16 ก.ค. - 16 ส.ค.',
    element: 'น้ำ',
    rulerPlanet: 'ดวงจันทร์',
    luckyColors: ['สีขาว', 'สีเงิน', 'สีครีม'],
    luckyNumbers: [2, 7, 16],
    traits: ['อบอุ่น', 'รักครอบครัว', 'มีเสน่ห์', 'จิตใจดีงาม'],
    description: 'ราศีแห่งความรักความอบอุ่น มีสัญชาตญาณในการดูแลผู้อื่น จิตใจอ่อนโยน'
  },
  {
    id: 'leo',
    nameThai: 'ราศีสิงห์',
    nameEng: 'Leo',
    symbol: '♌',
    dateRange: '17 ส.ค. - 16 ก.ย.',
    element: 'ไฟ',
    rulerPlanet: 'ดวงอาทิตย์',
    luckyColors: ['สีทอง', 'สีส้ม', 'สีม่วง'],
    luckyNumbers: [1, 4, 19],
    traits: ['สง่างาม', 'ใจกว้าง', 'มีบารมี', 'เปี่ยมความมั่นใจ'],
    description: 'ราศีแห่งราชา มีเกียรติยศและสง่าราศี ผู้คนยำเกรงและเชื่อมั่น'
  },
  {
    id: 'virgo',
    nameThai: 'ราศีกันย์',
    nameEng: 'Virgo',
    symbol: '♍',
    dateRange: '17 ก.ย. - 16 ต.ค.',
    element: 'ดิน',
    rulerPlanet: 'ดาวพุธ',
    luckyColors: ['สีเทา', 'สีเขียวเข้ม', 'สีน้ำตาลอ่อน'],
    luckyNumbers: [5, 12, 25],
    traits: ['มีระเบียบ', 'รอบคอบ', 'เฉลียวฉลาด', 'ช่วยเหลือผู้อื่น'],
    description: 'ราศีแห่งความสมบูรณ์แบบ ช่างสังเกต วิเคราะห์แม่นยำ และมีความรับผิดชอบสูง'
  },
  {
    id: 'libra',
    nameThai: 'ราศีตุลย์',
    nameEng: 'Libra',
    symbol: '♎',
    dateRange: '17 ต.ค. - 15 พ.ย.',
    element: 'ลม',
    rulerPlanet: 'ดาวศุกร์',
    luckyColors: ['สีฟ้าพาสเทล', 'สีชมพู', 'สีขาวมุก'],
    luckyNumbers: [6, 15, 24],
    traits: ['ยุติธรรม', 'มีเสน่ห์', 'รักความสงบ', 'ประนีประนอม'],
    description: 'ราศีแห่งดุลยภาพ ความเป็นธรรม และสุนทรียภาพ รสนิยมดี เข้ากับคนง่าย'
  },
  {
    id: 'scorpio',
    nameThai: 'ราศีพิจิก',
    nameEng: 'Scorpio',
    symbol: '♏',
    dateRange: '16 พ.ย. - 15 ธ.ค.',
    element: 'น้ำ',
    rulerPlanet: 'ดาวอังคาร/ดาวพลูโต',
    luckyColors: ['สีแดงเข้ม', 'สีเลือดหมู', 'สีดำ'],
    luckyNumbers: [8, 9, 18],
    traits: ['มุ่งมั่นลึกซึ้ง', 'มีเสน่ห์ลึกลับ', 'ความจำดีเลิศ', 'จริงใจ'],
    description: 'ราศีแห่งพลังอำนาจและความมุ่งมั่น มีลางสังหรณ์แม่นยำ ใจเด็ดเดี่ยว'
  },
  {
    id: 'sagittarius',
    nameThai: 'ราศีธนู',
    nameEng: 'Sagittarius',
    symbol: '♐',
    dateRange: '16 ธ.ค. - 14 ม.ค.',
    element: 'ไฟ',
    rulerPlanet: 'ดาวพฤหัสบดี',
    luckyColors: ['สีม่วงคราม', 'สีเหลืองบุษราคัม', 'สีส้ม'],
    luckyNumbers: [3, 9, 21],
    traits: ['มองโลกในแง่ดี', 'รักอิสระ', 'ใฝ่หาความรู้', 'ซื่อตรง'],
    description: 'ราศีแห่งคุณธรรมและปัญญา ชื่นชอบการผจญภัยและเรียนรู้สิ่งใหม่ๆ ตลอดเวลา'
  },
  {
    id: 'capricorn',
    nameThai: 'ราศีมังกร',
    nameEng: 'Capricorn',
    symbol: '♑',
    dateRange: '15 ม.ค. - 12 ก.พ.',
    element: 'ดิน',
    rulerPlanet: 'ดาวเสาร์',
    luckyColors: ['สีน้ำเงินเข้ม', 'สีเทาเข้ม', 'สีดำ'],
    luckyNumbers: [4, 8, 22],
    traits: ['อดทนสูง', 'มุ่งมั่นสู่ความสำเร็จ', 'สุขุมรอบคอบ', 'มีวินัย'],
    description: 'ราศีแห่งความสำเร็จระยะยาว หนักแน่น สุขุม และก้าวหน้าอย่างมั่นคง'
  },
  {
    id: 'aquarius',
    nameThai: 'ราศีกุมภ์',
    nameEng: 'Aquarius',
    symbol: '♒',
    dateRange: '13 ก.พ. - 14 มี.ค.',
    element: 'ลม',
    rulerPlanet: 'ดาวมฤตยู/ดาวเสาร์',
    luckyColors: ['สีฟ้าสว่าง', 'สีเทาเงิน', 'สีฟ้าอมเขียว'],
    luckyNumbers: [7, 11, 29],
    traits: ['มีความคิดริเริ่ม', 'รักมนุษยชาติ', 'เป็นตัวของตัวเอง', 'ล้ำสมัย'],
    description: 'ราศีแห่งนักคิดสร้างสรรค์ มีจินตนาการกว้างไกล มีอุดมการณ์สูงส่ง'
  },
  {
    id: 'pisces',
    nameThai: 'ราศีมีน',
    nameEng: 'Pisces',
    symbol: '♓',
    dateRange: '15 มี.ค. - 12 เม.ย.',
    element: 'น้ำ',
    rulerPlanet: 'ดาวพฤหัสบดี/ดาวเนปจูน',
    luckyColors: ['สีเขียวมรกต', 'สีม่วงลาเวนเดอร์', 'สีขาว'],
    luckyNumbers: [2, 6, 18],
    traits: ['เมตตากรุณา', 'มีจินตนาการ', 'อ่อนโยน', 'รักศิลปะ'],
    description: 'ราศีแห่งความเมตตาและศิลปะ มีญาณหยั่งรู้ อ่อนน้อมถ่อมตนและเป็นที่รัก'
  }
];

export function getZodiacByDate(month: number, day: number): ZodiacSign {
  // Thai Astrological Zodiac boundary
  if ((month === 4 && day >= 13) || (month === 5 && day <= 14)) return ZODIAC_SIGNS[0]; // Aries
  if ((month === 5 && day >= 15) || (month === 6 && day <= 14)) return ZODIAC_SIGNS[1]; // Taurus
  if ((month === 6 && day >= 15) || (month === 7 && day <= 15)) return ZODIAC_SIGNS[2]; // Gemini
  if ((month === 7 && day >= 16) || (month === 8 && day <= 16)) return ZODIAC_SIGNS[3]; // Cancer
  if ((month === 8 && day >= 17) || (month === 9 && day <= 16)) return ZODIAC_SIGNS[4]; // Leo
  if ((month === 9 && day >= 17) || (month === 10 && day <= 16)) return ZODIAC_SIGNS[5]; // Virgo
  if ((month === 10 && day >= 17) || (month === 11 && day <= 15)) return ZODIAC_SIGNS[6]; // Libra
  if ((month === 11 && day >= 16) || (month === 12 && day <= 15)) return ZODIAC_SIGNS[7]; // Scorpio
  if ((month === 12 && day >= 16) || (month === 1 && day <= 14)) return ZODIAC_SIGNS[8]; // Sagittarius
  if ((month === 1 && day >= 15) || (month === 2 && day <= 12)) return ZODIAC_SIGNS[9]; // Capricorn
  if ((month === 2 && day >= 13) || (month === 3 && day <= 14)) return ZODIAC_SIGNS[10]; // Aquarius
  return ZODIAC_SIGNS[11]; // Pisces
}
