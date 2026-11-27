const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.json');
const seedPath = path.join(__dirname, 'seed_students.json');

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// 1. Fix shifted transportMonthlyFee / transportFee for LKG students
const lkgRateFixes = {
  '6': { transportMonthlyFee: 850, transportFee: 9350 }, // KARUNASHAKAR (KARNASAGAR . S)
  '7': { transportMonthlyFee: 750, transportFee: 8250 }, // MAKIZHNAN . C
  '8': { transportMonthlyFee: 900, transportFee: 9900 }, // NAHELESH PANDI (NAGILESH PANDI . N)
  '9': { transportMonthlyFee: 850, transportFee: 9350 }  // NAVIN . D.G
};

for (const [id, fix] of Object.entries(lkgRateFixes)) {
  const s = db.students.find(st => st.id === id && st.grade === 'LKG');
  if (s) {
    s.transportOpted = true;
    s.transportMonthlyFee = fix.transportMonthlyFee;
    s.transportFee = fix.transportFee;
  }
}

// 1b. Ensure all 27 LKG register students appear in the Van Fees Register
const all27LkgIds = [
  '1', '14', '2', 'LKG-04', '3', '4', '6', '7', '8', '9', '10', '12', '13',
  '11', '15', '16', '20', 'LKG-20', '19', '18', '17',
  'LKG-25', 'LKG-26', 'LKG-27', 'LKG-29', 'LKG-30', 'LKG-31'
];

all27LkgIds.forEach(id => {
  const s = db.students.find(st => st.id === id && st.grade === 'LKG');
  if (s && !s.transportOpted) {
    s.transportOpted = true;
    if (!s.transportMonthlyFee) s.transportMonthlyFee = 0;
    if (!s.transportFee) s.transportFee = 0;
  }
});

// 2. Exact LKG Van Fee entries from the register image
const lkgVanEntries = [
  // 1. ANBUNILAVAN . R
  { studentId: '1', month: 'June', date: '2026-07-20', amount: 375 },
  { studentId: '1', month: 'July', date: '2026-07-20', amount: 375 },
  { studentId: '1', month: 'August', date: '2026-11-03', amount: 375 },
  { studentId: '1', month: 'September', date: '2026-11-03', amount: 375 },
  { studentId: '1', month: 'October', date: '2026-11-03', amount: 375 },
  { studentId: '1', month: 'November', date: '2026-11-03', amount: 375 },

  // 2. DHARSHIK . T (id: 14)
  { studentId: '14', month: 'June', date: '2026-08-13', amount: 850 },
  { studentId: '14', month: 'July', date: '2026-08-13', amount: 850 },
  { studentId: '14', month: 'August', date: '2026-08-13', amount: 850 },
  { studentId: '14', month: 'September', date: '2026-11-06', amount: 850 },
  { studentId: '14', month: 'October', date: '2026-11-06', amount: 850 },

  // 3. DHARSHITH . G (id: 2) -> blank
  // 4. HARSHA MITHRAN . K (id: LKG-04) -> '-'
  // 5. HASWANTH . S (id: 3) -> '-'

  // 6. JEEVA . P (id: 4)
  { studentId: '4', month: 'June', date: '2026-07-13', amount: 850 },
  { studentId: '4', month: 'July', date: '2026-07-13', amount: 850 },
  { studentId: '4', month: 'August', date: '2026-09-09', amount: 800 },
  { studentId: '4', month: 'September', date: '2026-09-09', amount: 800 },
  { studentId: '4', month: 'October', date: '2026-11-27', amount: 800 },

  // 7. KARNASAGAR . S / KARUNASHAKAR (id: 6)
  { studentId: '6', month: 'June', date: '2026-07-29', amount: 850 },
  { studentId: '6', month: 'July', date: '2026-07-29', amount: 850 },

  // 8. MAKIZHNAN . C (id: 7)
  { studentId: '7', month: 'June', date: '2026-07-22', amount: 750 },
  { studentId: '7', month: 'July', date: '2026-10-20', amount: 750 },
  { studentId: '7', month: 'August', date: '2026-11-10', amount: 750 },

  // 9. NAGILESH PANDI . N / NAHELESH PANDI (id: 8)
  { studentId: '8', month: 'June', date: '2026-08-18', amount: 900 },
  { studentId: '8', month: 'July', date: '2026-08-18', amount: 900 },
  { studentId: '8', month: 'August', date: '2026-08-18', amount: 900 },

  // 10. NAVIN . D.G (id: 9)
  { studentId: '9', month: 'June', date: '2026-07-24', amount: 850 },
  { studentId: '9', month: 'July', date: '2026-07-24', amount: 850 },
  { studentId: '9', month: 'August', date: '2026-09-03', amount: 850 },
  { studentId: '9', month: 'September', date: '2026-10-12', amount: 850 },

  // 11. PRAJESH VISHNU . R (id: 10)
  { studentId: '10', month: 'June', date: '2026-07-23', amount: 900 },
  { studentId: '10', month: 'July', date: '2026-07-23', amount: 900 },
  { studentId: '10', month: 'August', date: '2026-09-21', amount: 900 },
  { studentId: '10', month: 'September', date: '2026-09-21', amount: 900 },
  { studentId: '10', month: 'October', date: '2026-10-29', amount: 900 },

  // 12. SAI SARAN . M / SAI SHARAN (id: 12)
  { studentId: '12', month: 'June', date: '2026-08-28', amount: 750 },
  { studentId: '12', month: 'July', date: '2026-08-28', amount: 750 },

  // 13. SHARVIN . B / SARVIN (id: 13)
  { studentId: '13', month: 'June', date: '2026-08-04', amount: 850 },
  { studentId: '13', month: 'July', date: '2026-08-04', amount: 850 },
  { studentId: '13', month: 'August', date: '2026-09-21', amount: 850 },
  { studentId: '13', month: 'September', date: '2026-09-21', amount: 850 },

  // 14. TAMIL MARAN . S / TAMILMARAN (id: 11)
  { studentId: '11', month: 'June', date: '2026-07-24', amount: 900 },
  { studentId: '11', month: 'July', date: '2026-07-24', amount: 900 },
  { studentId: '11', month: 'August', date: '2026-08-05', amount: 900 },
  { studentId: '11', month: 'September', date: '2026-08-31', amount: 900 },
  { studentId: '11', month: 'October', date: '2026-11-18', amount: 900 },
  { studentId: '11', month: 'November', date: '2026-11-18', amount: 900 },

  // 15. VAIJITH . K (id: 15)
  { studentId: '15', month: 'June', date: '2026-08-10', amount: 850 },
  { studentId: '15', month: 'July', date: '2026-08-10', amount: 850 },
  { studentId: '15', month: 'August', date: '2026-08-10', amount: 850 },

  // 16. APARNA . G (id: 16)
  { studentId: '16', month: 'June', date: '2026-08-04', amount: 850 },
  { studentId: '16', month: 'July', date: '2026-08-04', amount: 850 },
  { studentId: '16', month: 'August', date: '2026-08-24', amount: 850 },
  { studentId: '16', month: 'September', date: '2026-09-10', amount: 850 },

  // 17. RITHANYA . R (id: 20)
  { studentId: '20', month: 'June', date: '2026-08-21', amount: 900 },
  { studentId: '20', month: 'July', date: '2026-08-21', amount: 900 },
  { studentId: '20', month: 'August', date: '2026-08-21', amount: 900 },

  // 18. SHALINI . K (id: LKG-20) -> '-'

  // 19. SAINDHAVI . P (id: 19)
  { studentId: '19', month: 'June', date: '2026-06-24', amount: 850 },
  { studentId: '19', month: 'July', date: '2026-08-05', amount: 850 },
  { studentId: '19', month: 'August', date: '2026-08-05', amount: 850 },
  { studentId: '19', month: 'September', date: '2026-09-23', amount: 850 },
  { studentId: '19', month: 'October', date: '2026-10-12', amount: 850 },
  { studentId: '19', month: 'November', date: '2026-10-23', amount: 850 },

  // 20. SRI MERSHIKA . M.K / SRIMERSHIKA (id: 18)
  { studentId: '18', month: 'June', date: '2026-07-13', amount: 850 },
  { studentId: '18', month: 'July', date: '2026-07-13', amount: 850 },
  { studentId: '18', month: 'August', date: '2026-10-15', amount: 850 },
  { studentId: '18', month: 'September', date: '2026-10-15', amount: 850 },
  { studentId: '18', month: 'October', date: '2026-10-15', amount: 850 },

  // 21. DHARSHANA . M / DARSHANA (id: 17) — June is '-'
  { studentId: '17', month: 'July', date: '2026-06-29', amount: 900 },
  { studentId: '17', month: 'August', date: '2026-08-24', amount: 900 },
  { studentId: '17', month: 'September', date: '2026-10-29', amount: 900 },
  { studentId: '17', month: 'October', date: '2026-10-29', amount: 900 },
  { studentId: '17', month: 'November', date: '2026-10-29', amount: 900 }
];

// 3. Remove only LKG van fee payments; keep all other payments untouched
const keptPayments = db.payments.filter(p => {
  const isLkg = p.grade === 'LKG';
  const isVan = p.feeCategories && p.feeCategories.includes('Transport / Van Fees');
  return !(isLkg && isVan);
});

const removedCount = db.payments.length - keptPayments.length;

// Find max existing V-receipt number to avoid collisions
let maxVSeq = 3000;
keptPayments.forEach(p => {
  const m = String(p.receiptNo || '').match(/REC-2026-V(\d+)/);
  if (m) {
    const num = parseInt(m[1], 10);
    if (num >= maxVSeq) maxVSeq = num + 1;
  }
});

const newLkgVanPayments = lkgVanEntries.map(entry => {
  const s = db.students.find(st => st.id === entry.studentId && st.grade === 'LKG');
  if (!s) {
    throw new Error(`Missing LKG student with id=${entry.studentId}`);
  }
  const receiptNo = `REC-2026-V${maxVSeq++}`;
  return {
    receiptNo,
    studentId: s.id,
    studentName: s.name,
    grade: s.grade,
    date: entry.date,
    term: `${entry.month} Van Fee`,
    feeCategories: ['Transport / Van Fees'],
    amount: entry.amount,
    paymentMethod: 'Cash',
    transactionId: `VAN-${receiptNo}`,
    remarks: `Van fee for ${entry.month} (Paid on ${entry.date.substring(5)})`,
    receivedBy: 'School Transport Office',
    boardingArea: s.boardingArea || 'School Van Route',
    transportPaymentMode: 'Monthly',
    transportMonth: `${entry.month} 2026`,
    transportFee: entry.amount,
    transportOpted: true
  };
});

db.payments = [...keptPayments, ...newLkgVanPayments];
db.payments.sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
fs.writeFileSync(seedPath, JSON.stringify(db.students, null, 2), 'utf8');

console.log(`Removed ${removedCount} old LKG van payments.`);
console.log(`Inserted ${newLkgVanPayments.length} corrected LKG van payments.`);
console.log(`Total payments in DB: ${db.payments.length}`);
