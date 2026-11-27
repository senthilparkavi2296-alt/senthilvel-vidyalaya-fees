const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'database.json');

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// Default seed data for Senthilvel Vidyalaya School
const defaultFeeColumns = [
  { key: "tuitionFee", name: "Tuition" },
  { key: "termFee", name: "Term" },
  { key: "examFee", name: "Exam" },
  { key: "labFee", name: "Lab" },
  { key: "libraryFee", name: "Library" },
  { key: "sportsFee", name: "Sports" }
];

const defaultTransportAreas = [
  { id: "area-1", placeName: "Pakkudi (Local / Village)", monthlyFee: 500, yearlyFee: 5000 },
  { id: "area-2", placeName: "Alangudi", monthlyFee: 600, yearlyFee: 6000 },
  { id: "area-3", placeName: "Keeramangalam", monthlyFee: 700, yearlyFee: 7000 },
  { id: "area-4", placeName: "Pudukkottai Town", monthlyFee: 800, yearlyFee: 8000 },
  { id: "area-5", placeName: "Vadakadu", monthlyFee: 650, yearlyFee: 6500 },
  { id: "area-6", placeName: "Perungalur", monthlyFee: 750, yearlyFee: 7500 }
];

const initialFeeStructures = [
  { grade: "LKG", tuitionFee: 14000, termFee: 3000, examFee: 1500, labFee: 500, libraryFee: 500, sportsFee: 1000, totalFee: 20000 },
  { grade: "UKG", tuitionFee: 15000, termFee: 3000, examFee: 1500, labFee: 500, libraryFee: 500, sportsFee: 1000, totalFee: 21500 },
  { grade: "1st Std", tuitionFee: 17000, termFee: 3500, examFee: 1800, labFee: 1000, libraryFee: 700, sportsFee: 1000, totalFee: 25000 },
  { grade: "2nd Std", tuitionFee: 18000, termFee: 3500, examFee: 1800, labFee: 1000, libraryFee: 700, sportsFee: 1000, totalFee: 26000 },
  { grade: "3rd Std", tuitionFee: 19000, termFee: 4000, examFee: 2000, labFee: 1200, libraryFee: 800, sportsFee: 1000, totalFee: 28000 },
  { grade: "4th Std", tuitionFee: 20000, termFee: 4000, examFee: 2000, labFee: 1500, libraryFee: 1000, sportsFee: 1500, totalFee: 30000 },
  { grade: "5th Std", tuitionFee: 21000, termFee: 4500, examFee: 2200, labFee: 1800, libraryFee: 1000, sportsFee: 1500, totalFee: 32000 },
  { grade: "6th Std", tuitionFee: 23000, termFee: 5000, examFee: 2500, labFee: 2000, libraryFee: 1200, sportsFee: 1800, totalFee: 35500 },
  { grade: "7th Std", tuitionFee: 24500, termFee: 5000, examFee: 2500, labFee: 2500, libraryFee: 1200, sportsFee: 1800, totalFee: 37500 },
  { grade: "8th Std", tuitionFee: 26000, termFee: 5500, examFee: 2800, labFee: 3000, libraryFee: 1200, sportsFee: 2000, totalFee: 40500 }
];

let initialStudents = [];
try {
  const seedFile = path.join(__dirname, 'seed_students.json');
  if (fs.existsSync(seedFile)) {
    initialStudents = JSON.parse(fs.readFileSync(seedFile, 'utf8'));
  }
} catch (e) {
  console.error("Error loading seed_students.json:", e);
}

const initialPayments = [];

// Helper to initialize or load DB
function loadDatabase() {
  if (!fs.existsSync(DB_FILE)) {
    const data = {
      feeColumns: defaultFeeColumns,
      feeStructures: initialFeeStructures,
      students: initialStudents,
      payments: initialPayments,
      transportAreas: defaultTransportAreas,
      schoolInfo: {
        name: "Senthilvel Vidyalaya School",
        tagline: "Excellence in Education (LKG to 8th Std)",
        affiliation: "State Board & Matriculation Curriculum",
        address: "Pakkudi, Pudukottai",
        phone: "9789277169, 9445987169",
        email: "senthilvelvidyalaya@gmail.com",
        academicYear: "2026-2027"
      }
    };
    saveDatabase(data);
    return data;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed.feeColumns || !Array.isArray(parsed.feeColumns)) {
      parsed.feeColumns = defaultFeeColumns;
    }
    if (!parsed.transportAreas || !Array.isArray(parsed.transportAreas)) {
      parsed.transportAreas = defaultTransportAreas;
    }
    return parsed;
  } catch (e) {
    console.error("Error reading database:", e);
    return { feeColumns: defaultFeeColumns, feeStructures: initialFeeStructures, students: initialStudents, payments: initialPayments, transportAreas: defaultTransportAreas };
  }
}

function saveDatabase(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Compute student fee summary
function getStudentFeeSummary(student, db) {
  const structure = db.feeStructures.find(f => f.grade === student.grade) || {
    tuitionFee: 0, termFee: 0, examFee: 0, labFee: 0, libraryFee: 0, sportsFee: 0, totalFee: 0
  };
  
  // Allow per-student custom school fee override; fall back to class fee structure
  const baseTotal = student.customSchoolFee !== undefined && student.customSchoolFee !== null && student.customSchoolFee !== ''
    ? Number(student.customSchoolFee)
    : (structure.totalFee || 0);
  const classBaseTotal = structure.totalFee || 0; // always expose original class fee
  const transportFee = Number(student.transportFee || 0);
  const concession = Number(student.concession || 0);
  const netSchoolPayable = Math.max(0, baseTotal - concession);
  const grossPayable = baseTotal + transportFee;
  const netPayable = Math.max(0, grossPayable - concession);

  const studentPayments = db.payments.filter(p => p.studentId === student.id);
  const paymentSum = studentPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  // Allow direct custom/override Paid amount if set
  const hasCustomPaid = student.customPaidAmount !== undefined && student.customPaidAmount !== null && student.customPaidAmount !== '';
  const totalPaid = hasCustomPaid ? Number(student.customPaidAmount) : paymentSum;
  const balanceDue = Math.max(0, netPayable - totalPaid);

  // Compute school paid vs van paid separately:
  let vanPaid = 0;
  studentPayments.forEach(p => {
    if (p.transportFee && Number(p.transportFee) > 0) {
      vanPaid += Math.min(Number(p.transportFee), Number(p.amount || 0));
    } else if (p.feeCategories && p.feeCategories.some(c => c.toLowerCase().includes('transport'))) {
      vanPaid += Math.min(transportFee, Number(p.amount || 0));
    }
  });
  vanPaid = Math.min(transportFee, vanPaid);
  const schoolPaid = Math.min(netSchoolPayable, Math.max(0, totalPaid - vanPaid));
  
  // Pending amounts separately:
  const schoolDue = Math.max(0, netSchoolPayable - schoolPaid);
  const vanDue = Math.max(0, transportFee - vanPaid);

  let status = "Unpaid";
  if (totalPaid >= netPayable && netPayable > 0) {
    status = "Paid";
  } else if (totalPaid > 0) {
    status = "Partial";
  }

  return {
    ...student,
    feeStructure: structure,
    baseTotal,
    classBaseTotal,
    hasCustomFee: (student.customSchoolFee !== undefined && student.customSchoolFee !== null && student.customSchoolFee !== ''),
    hasCustomPaid,
    paymentSum,
    grossPayable,
    netPayable,
    netSchoolPayable,
    schoolPaid,
    schoolDue,
    vanPaid,
    vanDue,
    totalPaid,
    balanceDue,
    status,
    payments: studentPayments
  };
}

// Routes
// 1. School Info & Stats
app.get('/api/stats', (req, res) => {
  const db = loadDatabase();
  const studentsWithSummary = db.students.map(s => getStudentFeeSummary(s, db));
  
  const totalStudents = studentsWithSummary.length;
  const totalExpected = studentsWithSummary.reduce((acc, s) => acc + s.netPayable, 0);
  const totalCollected = studentsWithSummary.reduce((acc, s) => acc + s.totalPaid, 0);
  const totalOutstanding = studentsWithSummary.reduce((acc, s) => acc + s.balanceDue, 0);
  
  const paidCount = studentsWithSummary.filter(s => s.status === 'Paid').length;
  const partialCount = studentsWithSummary.filter(s => s.status === 'Partial').length;
  const unpaidCount = studentsWithSummary.filter(s => s.status === 'Unpaid').length;

  // Grade-wise breakdown
  const grades = ["LKG", "UKG", "1st Std", "2nd Std", "3rd Std", "4th Std", "5th Std", "6th Std", "7th Std", "8th Std"];
  const gradeBreakdown = grades.map(g => {
    const list = studentsWithSummary.filter(s => s.grade === g);
    const expected = list.reduce((a, b) => a + b.netPayable, 0);
    const collected = list.reduce((a, b) => a + b.totalPaid, 0);
    const due = list.reduce((a, b) => a + b.balanceDue, 0);
    return {
      grade: g,
      studentsCount: list.length,
      expected,
      collected,
      due
    };
  });

  res.json({
    schoolInfo: db.schoolInfo,
    feeColumns: db.feeColumns || defaultFeeColumns,
    transportAreas: db.transportAreas || defaultTransportAreas,
    summary: {
      totalStudents,
      totalExpected,
      totalCollected,
      totalOutstanding,
      paidCount,
      partialCount,
      unpaidCount
    },
    gradeBreakdown
  });
});

// 2. Fee Structures
app.get('/api/fees-structure', (req, res) => {
  const db = loadDatabase();
  const columns = db.feeColumns || defaultFeeColumns;
  res.json({
    columns,
    structures: db.feeStructures
  });
});

app.put('/api/fees-structure', (req, res) => {
  const db = loadDatabase();
  const body = req.body;
  let updatedColumns = db.feeColumns || defaultFeeColumns;

  if (body.columns && Array.isArray(body.columns)) {
    updatedColumns = body.columns.map(c => ({
      key: c.key || `col_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: (c.name || 'Fee Head').trim()
    }));
    db.feeColumns = updatedColumns;
  }

  const structuresInput = Array.isArray(body) ? body : (body.structures || []);
  if (Array.isArray(structuresInput)) {
    db.feeStructures = structuresInput.map(item => {
      const row = { ...item };
      let total = 0;
      updatedColumns.forEach(col => {
        total += Number(row[col.key] || 0);
      });
      row.totalFee = total;
      return row;
    });
    saveDatabase(db);
    return res.json({ success: true, columns: db.feeColumns, feeStructures: db.feeStructures });
  }
  res.status(400).json({ error: "Invalid data format" });
});

// 2.5 Place-Wise Transportation Fee Structure
app.get('/api/transport-areas', (req, res) => {
  const db = loadDatabase();
  res.json(db.transportAreas || defaultTransportAreas);
});

app.put('/api/transport-areas', (req, res) => {
  const db = loadDatabase();
  const body = req.body;
  const list = Array.isArray(body) ? body : (body.areas || []);
  if (Array.isArray(list)) {
    db.transportAreas = list.map((item, idx) => ({
      id: item.id || `area-${idx + 1}-${Date.now()}`,
      placeName: (item.placeName || 'Area').trim(),
      monthlyFee: Number(item.monthlyFee || 0),
      yearlyFee: Number(item.yearlyFee || 0)
    }));
    saveDatabase(db);
    return res.json({ success: true, transportAreas: db.transportAreas });
  }
  res.status(400).json({ error: "Invalid data format" });
});

app.post('/api/transport-areas', (req, res) => {
  const db = loadDatabase();
  const { placeName, monthlyFee, yearlyFee } = req.body;
  if (!placeName || !placeName.trim()) {
    return res.status(400).json({ error: "Place Name is required" });
  }

  const newArea = {
    id: `area-${Date.now()}`,
    placeName: placeName.trim(),
    monthlyFee: Number(monthlyFee || 0),
    yearlyFee: Number(yearlyFee || 0)
  };

  db.transportAreas = db.transportAreas || defaultTransportAreas;
  db.transportAreas.push(newArea);
  saveDatabase(db);
  res.status(201).json(newArea);
});

app.delete('/api/transport-areas/:id', (req, res) => {
  const db = loadDatabase();
  db.transportAreas = (db.transportAreas || defaultTransportAreas).filter(a => a.id !== req.params.id);
  saveDatabase(db);
  res.json({ success: true });
});

// 3. Students
app.get('/api/students', (req, res) => {
  const db = loadDatabase();
  const { grade, search, status } = req.query;
  let students = db.students.map(s => getStudentFeeSummary(s, db));

  if (grade && grade !== 'All') {
    students = students.filter(s => s.grade.toLowerCase() === grade.toLowerCase());
  }

  if (status && status !== 'All') {
    students = students.filter(s => s.status.toLowerCase() === status.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    students = students.filter(s => 
      s.name.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      (s.rollNo && s.rollNo.toLowerCase().includes(q)) ||
      (s.contact && s.contact.includes(q)) ||
      (s.parentName && s.parentName.toLowerCase().includes(q)) ||
      (s.boardingArea && s.boardingArea.toLowerCase().includes(q))
    );
  }

  res.json(students);
});

app.get('/api/students/:id', (req, res) => {
  const db = loadDatabase();
  const student = db.students.find(s => s.id === req.params.id);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }
  res.json(getStudentFeeSummary(student, db));
});

app.post('/api/students', (req, res) => {
  const db = loadDatabase();
  const newStudent = req.body;

  if (!newStudent.name || !newStudent.grade) {
    return res.status(400).json({ error: "Name and Grade are required" });
  }

  const count = db.students.length + 1;
  const gradeCode = newStudent.grade.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const rollNo = newStudent.rollNo ? newStudent.rollNo.trim() : `${gradeCode}-${String(count).padStart(2, '0')}`;
  
  const tFee = Number(newStudent.transportFee || 0);
  const tOpted = Boolean(newStudent.transportOpted === true || newStudent.transportOpted === 'true' || tFee > 0);

  const studentData = {
    id: rollNo,
    rollNo: rollNo,
    name: newStudent.name.trim(),
    grade: newStudent.grade,
    section: newStudent.section || 'A',
    parentName: newStudent.parentName || '',
    contact: newStudent.contact || '',
    email: newStudent.email || '',
    address: newStudent.address || '',
    boardingArea: newStudent.boardingArea || (tOpted ? "Pakkudi (Local / Village)" : "None (Self Commute)"),
    transportOpted: tOpted,
    transportType: newStudent.transportType || (tOpted ? "Yearly" : "None"),
    transportMonthlyFee: Number(newStudent.transportMonthlyFee || (tFee > 0 ? Math.round(tFee / 10) : 0)),
    transportFee: tFee,
    concession: Number(newStudent.concession || 0),
    academicYear: newStudent.academicYear || "2026-2027"
  };

  db.students.push(studentData);
  saveDatabase(db);
  res.status(201).json(getStudentFeeSummary(studentData, db));
});

app.put('/api/students/:id', (req, res) => {
  const db = loadDatabase();
  const index = db.students.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Student not found" });
  }

  const existing = db.students[index];
  const tFee = req.body.transportFee !== undefined ? Number(req.body.transportFee) : Number(existing.transportFee || 0);
  let tOpted = req.body.transportOpted !== undefined 
    ? (req.body.transportOpted === true || req.body.transportOpted === 'true') 
    : Boolean(existing.transportOpted);
  if (tFee > 0) {
    tOpted = true;
  }

  const updated = {
    ...existing,
    ...req.body,
    boardingArea: req.body.boardingArea !== undefined ? req.body.boardingArea : existing.boardingArea,
    transportType: req.body.transportType !== undefined ? req.body.transportType : existing.transportType,
    transportMonthlyFee: req.body.transportMonthlyFee !== undefined ? Number(req.body.transportMonthlyFee) : existing.transportMonthlyFee,
    transportFee: tFee,
    transportOpted: tOpted,
    // Handle custom school fee: empty string or null means revert to class fee structure
    customSchoolFee: req.body.customSchoolFee !== undefined
      ? (req.body.customSchoolFee === '' || req.body.customSchoolFee === null ? null : Number(req.body.customSchoolFee))
      : existing.customSchoolFee,
    // Handle custom paid amount: empty string or null means revert to payment history sum
    customPaidAmount: req.body.customPaidAmount !== undefined
      ? (req.body.customPaidAmount === '' || req.body.customPaidAmount === null ? null : Number(req.body.customPaidAmount))
      : existing.customPaidAmount,
    id: existing.id // protect ID
  };

  db.students[index] = updated;
  saveDatabase(db);
  res.json(getStudentFeeSummary(updated, db));
});

app.delete('/api/students/:id', (req, res) => {
  const db = loadDatabase();
  const student = db.students.find(s => s.id === req.params.id);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  db.students = db.students.filter(s => s.id !== req.params.id);
  db.payments = db.payments.filter(p => p.studentId !== req.params.id);
  saveDatabase(db);
  res.json({ success: true, message: "Student and associated records deleted" });
});

// 4. Payments
app.get('/api/payments', (req, res) => {
  const db = loadDatabase();
  const { studentId, grade, fromDate, toDate } = req.query;
  let payments = [...db.payments];

  if (studentId) {
    payments = payments.filter(p => p.studentId === studentId);
  }
  if (grade && grade !== 'All') {
    payments = payments.filter(p => p.grade === grade);
  }
  if (fromDate) {
    payments = payments.filter(p => p.date >= fromDate);
  }
  if (toDate) {
    payments = payments.filter(p => p.date <= toDate);
  }

  payments.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(payments);
});

app.post('/api/payments', (req, res) => {
  const db = loadDatabase();
  const { 
    studentId, 
    amount, 
    paymentMethod, 
    term, 
    feeCategories, 
    transactionId, 
    remarks, 
    receivedBy,
    boardingArea,
    transportPaymentMode,
    transportMonth,
    transportAmount
  } = req.body;

  const student = db.students.find(s => s.id === studentId);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  const parsedAmount = Number(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: "Valid payment amount is required" });
  }

  const receiptCount = db.payments.length + 1001;
  const receiptNo = `REC-2026-${receiptCount}`;

  const resolvedTransportFee = (transportAmount !== undefined && transportAmount !== null && transportAmount !== "")
    ? Number(transportAmount)
    : Number(student.transportFee || 0);

  const resolvedBoardingArea = (boardingArea && boardingArea.trim()) 
    ? boardingArea.trim() 
    : (student.boardingArea || "Campus / Local");

  const paymentRecord = {
    receiptNo,
    studentId: student.id,
    studentName: student.name,
    grade: student.grade,
    date: new Date().toISOString().split('T')[0],
    term: term || "Term 1",
    feeCategories: Array.isArray(feeCategories) && feeCategories.length ? feeCategories : ["Tuition Fee"],
    amount: parsedAmount,
    paymentMethod: paymentMethod || "Cash",
    transactionId: transactionId || `TXN-${Date.now().toString().slice(-6)}`,
    remarks: remarks || "",
    receivedBy: receivedBy || "Accounts Desk",
    boardingArea: resolvedBoardingArea,
    transportPaymentMode: transportPaymentMode || (student.transportOpted ? "Yearly" : "None"),
    transportMonth: transportMonth || "",
    transportFee: resolvedTransportFee,
    transportOpted: Boolean(student.transportOpted || resolvedTransportFee > 0)
  };

  db.payments.unshift(paymentRecord);
  saveDatabase(db);

  const updatedStudentSummary = getStudentFeeSummary(student, db);
  res.status(201).json({
    payment: paymentRecord,
    studentSummary: updatedStudentSummary,
    schoolInfo: db.schoolInfo
  });
});

// Single Receipt View
app.get('/api/payments/:receiptNo', (req, res) => {
  const db = loadDatabase();
  const payment = db.payments.find(p => p.receiptNo === req.params.receiptNo);
  if (!payment) {
    return res.status(404).json({ error: "Receipt not found" });
  }
  const student = db.students.find(s => s.id === payment.studentId);
  const summary = student ? getStudentFeeSummary(student, db) : null;
  res.json({
    payment,
    student: summary,
    schoolInfo: db.schoolInfo
  });
});

// Update payment entry (e.g., inline van month edit)
app.put('/api/payments/:id', (req, res) => {
  const db = loadDatabase();
  const key = req.params.id;
  const idx = db.payments.findIndex(p => p.id === key || p.receiptNo === key);
  if (idx === -1) {
    return res.status(404).json({ error: "Payment record not found" });
  }
  const existing = db.payments[idx];
  const newAmount = req.body.amount !== undefined ? Number(req.body.amount) : Number(existing.amount);
  const updated = {
    ...existing,
    ...req.body,
    amount: newAmount,
    transportFee: req.body.transportFee !== undefined ? Number(req.body.transportFee) : (existing.transportFee ? newAmount : existing.transportFee)
  };
  db.payments[idx] = updated;
  saveDatabase(db);
  res.json({ success: true, payment: updated });
});

// Delete payment entry (e.g., clearing a van month)
app.delete('/api/payments/:id', (req, res) => {
  const db = loadDatabase();
  const key = req.params.id;
  const before = db.payments.length;
  db.payments = db.payments.filter(p => p.id !== key && p.receiptNo !== key);
  if (db.payments.length === before) {
    return res.status(404).json({ error: "Payment record not found" });
  }
  saveDatabase(db);
  res.json({ success: true });
});

// 5. WhatsApp Automated Fee Reminders & Notification System
app.get('/api/whatsapp/due-reminders', (req, res) => {
  const db = loadDatabase();
  const schoolInfo = db.schoolInfo || {
    name: "Senthilvel Vidyalaya School",
    address: "Pakkudi, Pudukottai",
    phone: "9789277169, 9445987169"
  };

  const studentsWithSummary = db.students.map(s => getStudentFeeSummary(s, db));
  const dueStudents = studentsWithSummary.filter(s => s.balanceDue > 0);

  const VAN_MONTHS_LIST = [
    'June', 'July', 'August', 'September', 'October', 'November', 
    'December', 'January', 'February', 'March', 'April'
  ];

  const TAMIL_MONTHS_MAP = {
    'June': 'ஜூன்', 'July': 'ஜூலை', 'August': 'ஆகஸ்ட்', 'September': 'செப்டம்பர்',
    'October': 'அக்டோபர்', 'November': 'நவம்பர்', 'December': 'டிசம்பர்',
    'January': 'ஜனவரி', 'February': 'பிப்ரவரி', 'March': 'மார்ச்', 'April': 'ஏப்ரல்'
  };

  const reminders = dueStudents.map(s => {
    const rawContact = String(s.contact || '').replace(/[^0-9]/g, '');
    let phone = rawContact;
    if (phone.length === 10) {
      phone = `91${phone}`;
    }

    // Van 11-month calculation:
    const studentVanPmts = db.payments.filter(p => 
      p.studentId === s.id && 
      (p.feeCategories && p.feeCategories.includes('Transport / Van Fees'))
    );

    const paidMonths = [];
    VAN_MONTHS_LIST.forEach(m => {
      if (studentVanPmts.some(p => 
        (p.transportMonth && p.transportMonth.toLowerCase().includes(m.toLowerCase())) ||
        (p.term && p.term.toLowerCase().includes(m.toLowerCase()))
      )) {
        paidMonths.push(m);
      }
    });

    const remainingMonths = s.transportOpted 
      ? VAN_MONTHS_LIST.filter(m => !paidMonths.includes(m))
      : [];

    const monthlyRate = Number(s.transportMonthlyFee || 0);
    const annualVanFee = Number(s.transportFee || (monthlyRate * 11));
    const vanPaid = Number(s.vanPaid || 0);
    const vanDue = Number(s.vanDue || 0);

    const engPaidMonthsStr = paidMonths.length > 0 ? paidMonths.join(', ') : 'None yet';
    const engRemMonthsStr = remainingMonths.length > 0 ? remainingMonths.join(', ') : (s.transportOpted ? 'Nil (Fully Paid)' : 'Not Opted');
    const tamilPaidMonthsStr = paidMonths.length > 0 ? paidMonths.map(m => TAMIL_MONTHS_MAP[m] || m).join(', ') : 'இதுவரை செலுத்தப்படவில்லை';
    const tamilRemMonthsStr = remainingMonths.length > 0 ? remainingMonths.map(m => TAMIL_MONTHS_MAP[m] || m).join(', ') : (s.transportOpted ? 'முழுவதும் செலுத்தப்பட்டது' : 'தேர்வு செய்யப்படவில்லை');

    let vanEngSection = '';
    let vanTamSection = '';

    if (s.transportOpted) {
      vanEngSection = 
`*VAN / TRANSPORTATION FEES (11-MONTH ACADEMIC YEAR):*
* Monthly Rate: ₹${monthlyRate}/month
* Total Annual Van Fee: ₹${annualVanFee.toLocaleString('en-IN')} (11 Months)
* Months Paid (${paidMonths.length}/11): ${engPaidMonthsStr}
* Van Paid Amount: ₹${vanPaid.toLocaleString('en-IN')}
* Remaining Due Months (${remainingMonths.length}/11): ${engRemMonthsStr}
* Pending Van Due: ₹${vanDue.toLocaleString('en-IN')}*`;

      vanTamSection = 
`*பள்ளி வேன் கட்டணம் (11 மாதங்கள்):*
* மாத கட்டணம்: ₹${monthlyRate}/மாதம்
* மொத்த ஆண்டு வேன் கட்டணம்: ₹${annualVanFee.toLocaleString('en-IN')} (11 மாதங்கள்)
* செலுத்தப்பட்ட மாதங்கள் (${paidMonths.length}/11): ${tamilPaidMonthsStr}
* செலுத்திய வேன் தொகை: ₹${vanPaid.toLocaleString('en-IN')}
* செலுத்த வேண்டிய மீதமுள்ள மாதங்கள் (${remainingMonths.length}/11): ${tamilRemMonthsStr}
* செலுத்த வேண்டிய வேன் நிலுவை: ₹${vanDue.toLocaleString('en-IN')}*`;
    } else {
      vanEngSection = `*VAN / TRANSPORTATION FEES:* Self Commute (Not Opted)`;
      vanTamSection = `*பள்ளி வேன் கட்டணம்:* சொந்தப் பயணம் (தேர்வு செய்யப்படவில்லை)`;
    }

    // Message 1: Clean English Format (No emojis causing question marks)
    const englishMessage = 
`*SENTHILVEL VIDYALAYA SCHOOL*
Pakkudi, Pudukottai | Contact: 9789277169, 9445987169
----------------------------------------
Dear Parent of *${s.name}* (Class: *${s.grade} - Sec ${s.section || 'A'}*, Roll No: *${s.rollNo || s.id}*),

Official Fee Status Update for Academic Year 2026-2027:

*SCHOOL ACADEMIC FEES:*
* Total School Fee: ₹${(s.netSchoolPayable || 0).toLocaleString('en-IN')}
* Paid Amount: ₹${(s.schoolPaid || 0).toLocaleString('en-IN')}
* Pending School Due: ₹${(s.schoolDue || 0).toLocaleString('en-IN')}*

${vanEngSection}

----------------------------------------
*TOTAL CONSOLIDATED SUMMARY:*
* Net Annual Payable: ₹${s.netPayable.toLocaleString('en-IN')}
* Total Paid to Date: ₹${s.totalPaid.toLocaleString('en-IN')}
*TOTAL BALANCE DUE: ₹${s.balanceDue.toLocaleString('en-IN')}*
----------------------------------------
Please settle the pending fee dues at the school office by Cash or UPI (GPay/PhonePe) at the earliest.
Contact: 9789277169 / 9445987169.
Thank you!
- Accounts Office, Senthilvel Vidyalaya School`;

    // Message 2: Clean Tamil Format (தமிழ் வடிவம்)
    const tamilMessage = 
`*செந்தில்வேல் வித்யாலயா பள்ளி (SENTHILVEL VIDYALAYA SCHOOL)*
பக்குடி, புதுக்கோட்டை | தொடர்பு: 9789277169, 9445987169
----------------------------------------
அன்புள்ள பெற்றோருக்கு வணக்கம்! மாணவர்/மாணவி: *${s.name}* (வகுப்பு: *${s.grade} - பிரிவு ${s.section || 'A'}*, எண்: *${s.rollNo || s.id}*),

2026-2027 கல்வியாண்டிற்கான கட்டண விபரம்:

*பள்ளி கல்விக் கட்டணம்:*
* மொத்த பள்ளி கட்டணம்: ₹${(s.netSchoolPayable || 0).toLocaleString('en-IN')}
* செலுத்திய தொகை: ₹${(s.schoolPaid || 0).toLocaleString('en-IN')}
* செலுத்த வேண்டிய பள்ளி நிலுவை: ₹${(s.schoolDue || 0).toLocaleString('en-IN')}*

${vanTamSection}

----------------------------------------
*ஒட்டுமொத்த கட்டண விபரம்:*
* ஆண்டு மொத்த கட்டணம்: ₹${s.netPayable.toLocaleString('en-IN')}
* இதுவரை செலுத்திய மொத்த தொகை: ₹${s.totalPaid.toLocaleString('en-IN')}
*மொத்த நிலுவைத் தொகை: ₹${s.balanceDue.toLocaleString('en-IN')}*
----------------------------------------
நிலுவையில் உள்ள கட்டணத்தை பள்ளி அலுவலகத்தில் ரொக்கமாகவோ அல்லது UPI (GPay/PhonePe) மூலமாகவோ செலுத்துமாறு கேட்டுக்கொள்கிறோம்.
தொடர்புக்கு: 9789277169 / 9445987169.
நன்றி!
- கணக்கு அலுவலகம், செந்தில்வேல் வித்யாலயா பள்ளி`;

    const whatsappUrlEnglish = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(englishMessage)}` : '';
    const whatsappUrlTamil = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(tamilMessage)}` : '';

    return {
      studentId: s.id,
      studentName: s.name,
      grade: s.grade,
      section: s.section,
      parentName: s.parentName,
      contact: s.contact,
      phone,
      schoolPaid: s.schoolPaid,
      schoolDue: s.schoolDue,
      vanPaid: s.vanPaid,
      vanDue: s.vanDue,
      totalPaid: s.totalPaid,
      balanceDue: s.balanceDue,
      boardingArea: s.boardingArea,
      transportType: s.transportType,
      message: englishMessage,
      englishMessage,
      tamilMessage,
      whatsappUrl: whatsappUrlEnglish,
      whatsappUrlEnglish,
      whatsappUrlTamil
    };
  });

  res.json({
    count: reminders.length,
    schoolInfo,
    reminders
  });
});

app.post('/api/whatsapp/log', (req, res) => {
  const db = loadDatabase();
  const { studentId, studentName, parentName, contact, amountDue, mode } = req.body;
  if (!db.whatsappLogs) {
    db.whatsappLogs = [];
  }

  const logEntry = {
    id: `wa-${Date.now()}`,
    timestamp: new Date().toISOString(),
    studentId,
    studentName,
    parentName,
    contact,
    amountDue,
    mode: mode || "Due Reminder",
    status: "Sent"
  };

  db.whatsappLogs.unshift(logEntry);
  saveDatabase(db);
  res.json({ success: true, log: logEntry });
});

app.get('/api/whatsapp/logs', (req, res) => {
  const db = loadDatabase();
  res.json(db.whatsappLogs || []);
});

// Full Database Backup & Restore APIs
app.get('/api/database/backup', (req, res) => {
  const db = loadDatabase();
  res.json(db);
});

app.get('/api/database/download', (req, res) => {
  const db = loadDatabase();
  const dateStr = new Date().toISOString().split('T')[0];
  res.setHeader('Content-Disposition', `attachment; filename="senthilvel_vidyalaya_db_${dateStr}.json"`);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(db, null, 2));
});

app.post('/api/database/restore', (req, res) => {
  try {
    const data = req.body;
    if (!data.students || !Array.isArray(data.students)) {
      return res.status(400).json({ error: "Invalid backup data: missing students list" });
    }
    saveDatabase(data);
    res.json({
      success: true,
      message: "Database restored successfully!",
      studentCount: data.students.length,
      paymentCount: (data.payments || []).length
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to restore database: " + err.message });
  }
});

// Reset demo data API
app.post('/api/reset-data', (req, res) => {
  if (fs.existsSync(DB_FILE)) {
    fs.unlinkSync(DB_FILE);
  }
  const data = loadDatabase();
  res.json({ success: true, message: "Database reset to defaults", data });
});

// Start server
app.listen(PORT, () => {
  console.log(`Senthilvel Vidyalaya School Fees System running at http://localhost:${PORT}`);
});
