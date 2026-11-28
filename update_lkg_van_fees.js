const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.json');
const seedPath = path.join(__dirname, 'seed_students.json');

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// ================================================================
// All 27 LKG students from the register image, with correct rates
// Students 22-27 and rows 3,4,5,18 show dashes = van-listed but ₹0 paid
// ================================================================
const lkg27Config = [
  // Register row → DB id, correct monthly rate
  { id: '1',      monthly: 375 },  // 1. ANBUNILAVAN .R
  { id: '14',     monthly: 850 },  // 2. DHARSHIK .T
  { id: '2',      monthly: 0   },  // 3. DHARSHITH .G (blank in register)
  { id: 'LKG-04', monthly: 0   },  // 4. HARSHA MITHRAN .K (dashes)
  { id: '3',      monthly: 0   },  // 5. HASWANTH .S (dashes)
  { id: '4',      monthly: 800 },  // 6. JEEVA .P
  { id: '6',      monthly: 850 },  // 7. KARNASAGAR .S / KARUNASHAKAR
  { id: '7',      monthly: 750 },  // 8. MAKIZHNAN .C
  { id: '8',      monthly: 900 },  // 9. NAGILESH PANDI .N / NAHELESH PANDI
  { id: '9',      monthly: 850 },  // 10. NAVIN .D.G
  { id: '10',     monthly: 900 },  // 11. PRAJESH VISHNU .R
  { id: '12',     monthly: 750 },  // 12. SAI SARAN .M / SAI SHARAN
  { id: '13',     monthly: 850 },  // 13. SHARVIN .B / SARVIN
  { id: '11',     monthly: 900 },  // 14. TAMIL MARAN .S / TAMILMARAN
  { id: '15',     monthly: 850 },  // 15. VAIJITH .K
  { id: '16',     monthly: 850 },  // 16. APARNA .G
  { id: '20',     monthly: 900 },  // 17. RITHANYA .R
  { id: 'LKG-20', monthly: 0   },  // 18. SHALINI .K (dashes)
  { id: '19',     monthly: 850 },  // 19. SAINDHAVI .P
  { id: '18',     monthly: 850 },  // 20. SRI MERSHIKA .M.K
  { id: '17',     monthly: 900 },  // 21. DHARSHANA .M
  { id: 'LKG-25', monthly: 0   },  // 22. VARSHITH (dashes)
  { id: 'LKG-26', monthly: 0   },  // 23. DELVIN .N (dashes)
  { id: 'LKG-27', monthly: 0   },  // 24. RATCHAGAN (dashes)
  { id: 'LKG-29', monthly: 0   },  // 25. ASHVIN JOE (dashes)
  { id: 'LKG-30', monthly: 0   },  // 26. LAKSHANA (dashes)
  { id: 'LKG-31', monthly: 0   },  // 27. PRAGATHISHWARAN (dashes)
];

// Step 1: Set transportOpted + correct monthly rate for all 27
lkg27Config.forEach(cfg => {
  const s = db.students.find(st => st.id === cfg.id && st.grade === 'LKG');
  if (!s) {
    console.warn(`WARNING: LKG student id=${cfg.id} not found in DB!`);
    return;
  }
  s.transportOpted = true;
  s.transportMonthlyFee = cfg.monthly;
  s.transportFee = cfg.monthly > 0 ? cfg.monthly * 11 : 0;
});

// Step 2: Van fee payment entries from the register image
const lkgVanEntries = [
  // 1. ANBUNILAVAN .R (375/mo) — 6 months paid
  { studentId: '1', month: 'June',      date: '2026-07-20', amount: 375 },
  { studentId: '1', month: 'July',      date: '2026-07-20', amount: 375 },
  { studentId: '1', month: 'August',    date: '2026-07-21', amount: 375 },
  { studentId: '1', month: 'September', date: '2026-07-21', amount: 375 },
  { studentId: '1', month: 'October',   date: '2026-11-09', amount: 375 },
  { studentId: '1', month: 'November',  date: '2026-11-08', amount: 375 },

  // 2. DHARSHIK .T (850/mo) — 5 months paid
  { studentId: '14', month: 'June',      date: '2026-08-13', amount: 850 },
  { studentId: '14', month: 'July',      date: '2026-08-13', amount: 850 },
  { studentId: '14', month: 'August',    date: '2026-08-13', amount: 850 },
  { studentId: '14', month: 'September', date: '2026-11-06', amount: 850 },
  { studentId: '14', month: 'October',   date: '2026-11-06', amount: 850 },

  // 3. DHARSHITH — no entries (blank)
  // 4. HARSHA MITHRAN — dashes (₹0)
  // 5. HASWANTH — dashes (₹0)

  // 6. JEEVA .P (800/mo) — 5 months paid
  { studentId: '4', month: 'June',      date: '2026-07-13', amount: 850 },
  { studentId: '4', month: 'July',      date: '2026-07-13', amount: 850 },
  { studentId: '4', month: 'August',    date: '2026-09-09', amount: 800 },
  { studentId: '4', month: 'September', date: '2026-09-09', amount: 800 },
  { studentId: '4', month: 'October',   date: '2026-11-27', amount: 800 },

  // 7. KARNASAGAR .S (850/mo) — 2 months paid
  { studentId: '6', month: 'June', date: '2026-07-22', amount: 850 },
  { studentId: '6', month: 'July', date: '2026-07-29', amount: 850 },

  // 8. MAKIZHNAN .C (750/mo) — 3 months paid
  { studentId: '7', month: 'June',   date: '2026-07-22', amount: 750 },
  { studentId: '7', month: 'July',   date: '2026-10-20', amount: 750 },
  { studentId: '7', month: 'August', date: '2026-11-10', amount: 750 },

  // 9. NAGILESH PANDI .N (900/mo) — 3 months paid
  { studentId: '8', month: 'June', date: '2026-08-18', amount: 900 },
  { studentId: '8', month: 'July', date: '2026-08-18', amount: 900 },
  { studentId: '8', month: 'August', date: '2026-08-18', amount: 900 },

  // 10. NAVIN .D.G (850/mo) — 5 months paid
  { studentId: '9', month: 'June',      date: '2026-07-24', amount: 850 },
  { studentId: '9', month: 'July',      date: '2026-07-24', amount: 850 },
  { studentId: '9', month: 'August',    date: '2026-09-03', amount: 850 },
  { studentId: '9', month: 'September', date: '2026-10-12', amount: 850 },
  { studentId: '9', month: 'October',   date: '2026-10-12', amount: 850 },

  // 11. PRAJESH VISHNU .R (900/mo) — 5 months paid
  { studentId: '10', month: 'June',      date: '2026-07-23', amount: 900 },
  { studentId: '10', month: 'July',      date: '2026-07-23', amount: 900 },
  { studentId: '10', month: 'August',    date: '2026-09-21', amount: 900 },
  { studentId: '10', month: 'September', date: '2026-09-21', amount: 900 },
  { studentId: '10', month: 'October',   date: '2026-10-29', amount: 900 },

  // 12. SAI SARAN .M (750/mo) — 2 months paid
  { studentId: '12', month: 'June', date: '2026-08-28', amount: 750 },
  { studentId: '12', month: 'July', date: '2026-08-28', amount: 750 },

  // 13. SHARVIN .B (850/mo) — 4 months paid
  { studentId: '13', month: 'June',      date: '2026-08-04', amount: 850 },
  { studentId: '13', month: 'July',      date: '2026-08-04', amount: 850 },
  { studentId: '13', month: 'August',    date: '2026-09-21', amount: 850 },
  { studentId: '13', month: 'September', date: '2026-09-21', amount: 850 },

  // 14. TAMIL MARAN .S (900/mo) — 6 months paid
  { studentId: '11', month: 'June',      date: '2026-07-24', amount: 900 },
  { studentId: '11', month: 'July',      date: '2026-07-24', amount: 900 },
  { studentId: '11', month: 'August',    date: '2026-08-05', amount: 900 },
  { studentId: '11', month: 'September', date: '2026-08-31', amount: 900 },
  { studentId: '11', month: 'October',   date: '2026-11-18', amount: 900 },
  { studentId: '11', month: 'November',  date: '2026-11-18', amount: 900 },

  // 15. VAIJITH .K (850/mo) — 3 months paid
  { studentId: '15', month: 'June',   date: '2026-08-10', amount: 850 },
  { studentId: '15', month: 'July',   date: '2026-08-10', amount: 850 },
  { studentId: '15', month: 'August', date: '2026-08-10', amount: 850 },

  // 16. APARNA .G (850/mo) — 4 months paid
  { studentId: '16', month: 'June',      date: '2026-08-04', amount: 850 },
  { studentId: '16', month: 'July',      date: '2026-08-04', amount: 850 },
  { studentId: '16', month: 'August',    date: '2026-08-24', amount: 850 },
  { studentId: '16', month: 'September', date: '2026-09-10', amount: 850 },

  // 17. RITHANYA .R (900/mo) — 3 months paid
  { studentId: '20', month: 'June',   date: '2026-08-21', amount: 900 },
  { studentId: '20', month: 'July',   date: '2026-08-21', amount: 900 },
  { studentId: '20', month: 'August', date: '2026-08-21', amount: 900 },

  // 18. SHALINI .K — dashes (₹0)

  // 19. SAINDHAVI .P (850/mo) — 6 months paid
  { studentId: '19', month: 'June',      date: '2026-06-24', amount: 850 },
  { studentId: '19', month: 'July',      date: '2026-08-05', amount: 850 },
  { studentId: '19', month: 'August',    date: '2026-08-05', amount: 850 },
  { studentId: '19', month: 'September', date: '2026-09-23', amount: 850 },
  { studentId: '19', month: 'October',   date: '2026-10-12', amount: 850 },
  { studentId: '19', month: 'November',  date: '2026-10-23', amount: 850 },

  // 20. SRI MERSHIKA .M.K (850/mo) — 5 months paid
  { studentId: '18', month: 'June',      date: '2026-07-13', amount: 850 },
  { studentId: '18', month: 'July',      date: '2026-07-13', amount: 850 },
  { studentId: '18', month: 'August',    date: '2026-10-15', amount: 850 },
  { studentId: '18', month: 'September', date: '2026-10-15', amount: 850 },
  { studentId: '18', month: 'October',   date: '2026-10-15', amount: 850 },

  // 21. DHARSHANA .M (900/mo) — 5 months (June is dash)
  { studentId: '17', month: 'July',      date: '2026-06-29', amount: 900 },
  { studentId: '17', month: 'August',    date: '2026-08-24', amount: 900 },
  { studentId: '17', month: 'September', date: '2026-10-29', amount: 900 },
  { studentId: '17', month: 'October',   date: '2026-10-29', amount: 900 },
  { studentId: '17', month: 'November',  date: '2026-10-29', amount: 900 },

  // 22. VARSHITH — dashes (₹0)
  // 23. DELVIN .N — dashes (₹0)
  // 24. RATCHAGAN — dashes (₹0)
  // 25. ASHVIN JOE — dashes (₹0)
  // 26. LAKSHANA — dashes (₹0)
  // 27. PRAGATHISHWARAN — dashes (₹0)
];

// Step 3: Remove ALL existing LKG van payments
const keptPayments = db.payments.filter(p => {
  const isLkg = p.grade === 'LKG';
  const isVan = p.feeCategories && p.feeCategories.includes('Transport / Van Fees');
  return !(isLkg && isVan);
});
const removedCount = db.payments.length - keptPayments.length;

// Step 4: Create new receipts with unique numbers
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
  if (!s) throw new Error(`Missing LKG student id=${entry.studentId}`);
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

// Summary
const lkg27Ids = lkg27Config.map(c => c.id);
const finalVanCount = db.students.filter(s => s.grade === 'LKG' && lkg27Ids.includes(s.id) && s.transportOpted).length;
console.log(`Removed ${removedCount} old LKG van payments.`);
console.log(`Inserted ${newLkgVanPayments.length} corrected LKG van payments.`);
console.log(`All 27 LKG students in Van Register: ${finalVanCount}/27`);
console.log(`Total payments in DB: ${db.payments.length}`);
