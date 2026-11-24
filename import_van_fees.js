const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Helper to find student by rollNo, or name within grade
function findStudent(rollNo, nameSnippet, grade) {
  if (rollNo) {
    const s = db.students.find(s => String(s.rollNo) === String(rollNo) || String(s.id) === String(rollNo));
    if (s) return s;
  }
  if (nameSnippet && grade) {
    const s = db.students.find(s => s.grade === grade && s.name.toLowerCase().includes(nameSnippet.toLowerCase()));
    if (s) return s;
  }
  return null;
}

// Map of monthly van fees by rollNo
// Standard annual transport fee = monthly fee * 10 (or exact full year for Ajay = 9900)
const studentVanConfigs = [
  // UKG A
  { rollNo: '29', monthlyRate: 900 }, // DHARSHAN . S
  { rollNo: '42', monthlyRate: 450 }, // GOKUL . D
  { rollNo: '27', monthlyRate: 850 }, // JEEVAN . M
  { rollNo: '33', monthlyRate: 850 }, // KATHIRVELU . R
  { rollNo: '32', monthlyRate: 900 }, // KIRTHIK SASTHA . P
  { rollNo: '37', monthlyRate: 900 }, // MUTHUN PRABHA . P
  { rollNo: '41', monthlyRate: 900 }, // PRAVEEN . P
  { rollNo: '45', monthlyRate: 750 }, // REEGAN . S
  { rollNo: '35', monthlyRate: 750 }, // SABARI . M (or 550)
  { rollNo: '50', monthlyRate: 850 }, // SRI DHARAN . S
  { rollNo: '38', monthlyRate: 850 }, // SRIDEV . P.R
  { rollNo: '40', monthlyRate: 850 }, // THEERAN . P
  { rollNo: '51', monthlyRate: 850 }, // THOMAS . A
  { rollNo: '62', monthlyRate: 850 }, // KAVIYAZHINI . M
  { rollNo: '63', monthlyRate: 750 }, // KRISHITHA . M
  { rollNo: '64', monthlyRate: 750 }, // LITHIKA . R
  { rollNo: '73', monthlyRate: 850 }, // SHARMITHA . A
  { rollNo: '74', monthlyRate: 750 }, // VARNASRI . T
  { rollNo: '58', monthlyRate: 425 }, // DHARANIKHA SRI
  { rollNo: '61', monthlyRate: 850 }, // HARSHINI . S

  // UKG B
  { rollNo: '46', monthlyRate: 900, annualTotal: 9900 }, // AJAY . S
  { rollNo: '26', monthlyRate: 700 }, // DHARAN SANJAY . D
  { rollNo: '31', monthlyRate: 850 }, // GUKAN . K
  { rollNo: '30', monthlyRate: 850 }, // IVAAN INIGO . I.C
  { rollNo: '34', monthlyRate: 900 }, // KAVIN . M
  { rollNo: '43', monthlyRate: 850 }, // KAVINAYAN . R
  { rollNo: '53', monthlyRate: 850 }, // X LINSON STEFFIN
  { rollNo: '36', monthlyRate: 850 }, // MOKITH . P
  { rollNo: '44', monthlyRate: 850 }, // R NITHIN
  { rollNo: '22', monthlyRate: 850 }, // PAVAN / PRANAV
  { rollNo: '23', monthlyRate: 850 }, // RIVAAN AADHESH . A
  { rollNo: '28', monthlyRate: 800 }, // SHERWIN . D
  { rollNo: '49', monthlyRate: 800 }, // SHERWIN (duplicate)
  { rollNo: '57', monthlyRate: 850 }, // DHANSHIKA . D
  { rollNo: '54', monthlyRate: 850 }, // DHARSHIKA SRI
  { rollNo: '56', monthlyRate: 850 }, // DHARSHINI
  { rollNo: '60', monthlyRate: 850 }, // HARSHIKA . N
  { rollNo: '66', monthlyRate: 900 }, // MAHATHI SRI . R
  { rollNo: '71', monthlyRate: 700 }, // MITHRA . R
  { rollNo: '76', monthlyRate: 900 }, // MITHUNYA SRI . V
  { rollNo: '68', monthlyRate: 900 }, // MOHANA SRI R
  { rollNo: '75', monthlyRate: 900 }, // MUZHUMATHI . S
  { rollNo: '72', monthlyRate: 850 }, // PRITHIKASRI . M
  { rollNo: '65', monthlyRate: 850 }, // M SAI PALLAVI . P
  { rollNo: '70', monthlyRate: 750 }, // VENPA . P
  { rollNo: 'UKG-56', monthlyRate: 850 }, // THIYA SRI P
  { rollNo: '25', monthlyRate: 850 }, // KAVIN . C

  // 1st Std
  { rollNo: '77', monthlyRate: 850 }, // ALAN REX
  { rollNo: '79', monthlyRate: 850 }, // DEEPAN
  { rollNo: '81', monthlyRate: 850 }, // JEFERIN XAVIER
  { rollNo: '84', monthlyRate: 900 }, // MITHRAN
  { rollNo: '80', monthlyRate: 900 }, // SANJIT
  { rollNo: '87', monthlyRate: 800 }, // SABAREESHWARAN
  { rollNo: '86', monthlyRate: 900 }, // SAATVIK
  { rollNo: '85', monthlyRate: 1000 }, // SUDHARSAN
  { rollNo: '89', monthlyRate: 900 }, // THARANISH RAM
  { rollNo: '88', monthlyRate: 900 }, // THANISH
  { rollNo: '83', monthlyRate: 800 }, // YUGESH
  { rollNo: '91', monthlyRate: 850 }, // ANCY FARRAH
  { rollNo: '92', monthlyRate: 850 }, // ASHVIKA SRI
  { rollNo: '97', monthlyRate: 900 }, // HIMASREE
  { rollNo: '99', monthlyRate: 900 }, // KAVINYASRI
  { rollNo: '95', monthlyRate: 850 }, // PRANIKA
  { rollNo: '96', monthlyRate: 900 }, // RITHIKA SRI
  { rollNo: '98', monthlyRate: 900 }, // SAATVIKA
  { rollNo: '100', monthlyRate: 900 }, // THAMIZH INIYAL

  // 2nd Std
  { rollNo: '102', monthlyRate: 1000 }, // AKILAN
  { rollNo: '103', monthlyRate: 800 }, // DURGESH
  { rollNo: '104', monthlyRate: 300 }, // GOWTHAM
  { rollNo: '108', monthlyRate: 900 }, // KAPILASWARAN
  { rollNo: '109', monthlyRate: 850 }, // LAKSHAN
  { rollNo: '111', monthlyRate: 850 }, // MORIS ROMAN
  { rollNo: '112', monthlyRate: 800 }, // MUNEESWARAN
  { rollNo: '113', monthlyRate: 700 }, // NALLAMUTHAZHAGAN
  { rollNo: '116', monthlyRate: 850 }, // PRAGUL
  { rollNo: '117', monthlyRate: 850 }, // RAJAPUGAZH
  { rollNo: '118', monthlyRate: 850 }, // RITHAN
  { rollNo: '121', monthlyRate: 850 }, // SHIJON
  { rollNo: '122', monthlyRate: 850 }, // TAMILMANI
  { rollNo: '119', monthlyRate: 750 }, // THASHVIN
  { rollNo: '123', monthlyRate: 450 }, // THEERAN
  { rollNo: '124', monthlyRate: 425 }, // VINSTO
  { rollNo: '114', monthlyRate: 850 }, // YUDHARSAN
  { rollNo: '125', monthlyRate: 900 }, // YURENDRA KUMAR
  { rollNo: '126', monthlyRate: 900 }, // ANCY JOSHNA
  { rollNo: '127', monthlyRate: 950 }, // ARSHITHA
  { rollNo: '128', monthlyRate: 350 }, // ASHLIN SWASTHIKA
  { rollNo: '130', monthlyRate: 900 }, // BRIGIDA
  { rollNo: '131', monthlyRate: 750 }, // DURGASHINI
  { rollNo: '132', monthlyRate: 850 }, // JANA SRI
  { rollNo: '133', monthlyRate: 850 }, // KANISHKA
  { rollNo: '134', monthlyRate: 850 }, // KIRUBASHINI
  { rollNo: '135', monthlyRate: 700 }, // LIYA SRI
  { rollNo: '136', monthlyRate: 900 }, // MAHALAKSHMI
  { rollNo: '138', monthlyRate: 800 }, // PUGAZHINI
  { rollNo: '139', monthlyRate: 650 }, // RIAJOSH
  { rollNo: '140', monthlyRate: 750 }, // RIYANA
  { rollNo: '141', monthlyRate: 900 }, // SUDHIKSHA

  // 3rd Std
  { rollNo: '142', monthlyRate: 850 }, // ARUNPRASATH
  { rollNo: '143', monthlyRate: 900 }, // BALA CHANDAR
  { rollNo: '147', monthlyRate: 850 }, // MAXLIN
  { rollNo: '148', monthlyRate: 900 }, // RAGHAVAN
  { rollNo: '149', monthlyRate: 2000 }, // RAJARISHI
  { rollNo: '151', monthlyRate: 900 }, // RUKESH
  { rollNo: '154', monthlyRate: 850 }, // VISHVANANDHAN
  { rollNo: '155', monthlyRate: 850 }, // DARIKA
  { rollNo: '157', monthlyRate: 850 }, // DHANSHIKA
  { rollNo: '158', monthlyRate: 750 }, // HARINIGA
  { rollNo: '159', monthlyRate: 900 }, // KANISHKA
  { rollNo: '162', monthlyRate: 950 }, // MIRNALINI
  { rollNo: '163', monthlyRate: 350 }, // NIRANJANA
  { rollNo: '164', monthlyRate: 350 }, // SHIVANI
  { rollNo: '165', monthlyRate: 850 }, // SHIVIKA
  { rollNo: '166', monthlyRate: 450 }, // SRUTHI
  { rollNo: '153', monthlyRate: 450 }, // VIPANESH

  // 4th Std
  { rollNo: '167', monthlyRate: 2000 }, // HARI ROSHAN
  { rollNo: '168', monthlyRate: 450 }, // JOYSON THAIRIYAM
  { rollNo: '171', monthlyRate: 850 }, // RISHVANTH
  { rollNo: '173', monthlyRate: 750 }, // SUSANTH
  { rollNo: '175', monthlyRate: 750 }, // ADHIKSHA
  { rollNo: '176', monthlyRate: 850 }, // ASWITHA
  { rollNo: '178', monthlyRate: 850 }, // DHARSHIKA
  { rollNo: '181', monthlyRate: 950 }, // JASRITHA SRI
  { rollNo: '184', monthlyRate: 900 }, // LAKSHITHA
  { rollNo: '185', monthlyRate: 450 }, // LISHA
  { rollNo: '186', monthlyRate: 850 }, // MERRY YASHVI
  { rollNo: '187', monthlyRate: 650 }, // MOUNIKA
  { rollNo: '189', monthlyRate: 400 }, // PRIYA SRI
  { rollNo: '190', monthlyRate: 750 }, // SATHANA
  { rollNo: '191', monthlyRate: 850 }, // VIBASHINI

  // 5th Std
  { rollNo: '192', monthlyRate: 750 }, // HASWANTH
  { rollNo: '193', monthlyRate: 850 }, // KEVIN WESLEY
  { rollNo: '195', monthlyRate: 850 }, // NOORUL HAQ
  { rollNo: '197', monthlyRate: 850 }, // PRANAV MARAN
  { rollNo: '198', monthlyRate: 900 }, // RAKSAN BALA
  { rollNo: '199', monthlyRate: 1000 }, // SUDHARSAN
  { rollNo: '200', monthlyRate: 750 }, // AGALYA
  { rollNo: '202', monthlyRate: 450 }, // JEEVITHA
  { rollNo: '204', monthlyRate: 900 }, // KOKILARANI
  { rollNo: '206', monthlyRate: 800 }, // REXY
  { rollNo: '203', monthlyRate: 850 }, // KANISHKA

  // 6th Std
  { rollNo: '209', monthlyRate: 900 }, // HARISH
  { rollNo: '210', monthlyRate: 850 }, // LEO ACACIOUS
  { rollNo: '211', monthlyRate: 900 }, // RAMASUNDARAM
  { rollNo: '214', monthlyRate: 800 }, // SIVATHANUSIYAA

  // 7th Std
  { rollNo: '218', monthlyRate: 850 }, // PRUTHVI
  { rollNo: '220', monthlyRate: 1000 }, // YAZHINI

  // 8th Std
  { rollNo: '221', monthlyRate: 850 }, // VISHNU
  { rollNo: '222', monthlyRate: 850 }, // ASHMIN
  { rollNo: '223', monthlyRate: 850 }  // JENISHA
];

// Configure transport properties on students:
studentVanConfigs.forEach(cfg => {
  const s = findStudent(cfg.rollNo);
  if (s) {
    s.transportOpted = true;
    s.transportType = 'Monthly';
    s.transportMonthlyFee = cfg.monthlyRate;
    s.transportFee = cfg.annualTotal || (cfg.monthlyRate * 10);
    s.boardingArea = s.boardingArea && s.boardingArea !== 'None (Self Commute)' ? s.boardingArea : 'School Van Route';
  }
});

// All individual monthly van fee receipts from register images:
const vanPayments = [
  // UKG A (Image 1)
  { rollNo: '29', month: 'June', date: '2026-07-24', amount: 900 },
  { rollNo: '29', month: 'July', date: '2026-07-24', amount: 900 },
  { rollNo: '42', month: 'June', date: '2026-08-18', amount: 450 },
  { rollNo: '42', month: 'July', date: '2026-09-18', amount: 450 },
  { rollNo: '42', month: 'August', date: '2026-09-18', amount: 450 },
  { rollNo: '27', month: 'June', date: '2026-07-24', amount: 850 },
  { rollNo: '27', month: 'July', date: '2026-07-24', amount: 850 },
  { rollNo: '33', month: 'June', date: '2026-11-12', amount: 850 },
  { rollNo: '33', month: 'July', date: '2026-11-12', amount: 850 },
  { rollNo: '33', month: 'August', date: '2026-11-12', amount: 850 },
  { rollNo: '33', month: 'September', date: '2026-11-12', amount: 850 },
  { rollNo: '33', month: 'October', date: '2026-11-12', amount: 850 },
  { rollNo: '33', month: 'November', date: '2026-11-12', amount: 850 },
  { rollNo: '32', month: 'June', date: '2026-10-18', amount: 900 },
  { rollNo: '32', month: 'July', date: '2026-07-30', amount: 900 },
  { rollNo: '32', month: 'August', date: '2026-09-16', amount: 900 },
  { rollNo: '32', month: 'September', date: '2026-09-16', amount: 900 },
  { rollNo: '37', month: 'June', date: '2026-10-08', amount: 900 },
  { rollNo: '37', month: 'July', date: '2026-08-10', amount: 900 },
  { rollNo: '37', month: 'August', date: '2026-09-17', amount: 900 },
  { rollNo: '37', month: 'September', date: '2026-09-17', amount: 900 },
  { rollNo: '37', month: 'October', date: '2026-10-15', amount: 900 },
  { rollNo: '37', month: 'November', date: '2026-11-15', amount: 900 },
  { rollNo: '41', month: 'June', date: '2026-08-25', amount: 900 },
  { rollNo: '41', month: 'July', date: '2026-08-25', amount: 900 },
  { rollNo: '41', month: 'August', date: '2026-08-25', amount: 900 },
  { rollNo: '41', month: 'September', date: '2026-09-15', amount: 900 },
  { rollNo: '45', month: 'June', date: '2026-08-04', amount: 750 },
  { rollNo: '45', month: 'July', date: '2026-08-04', amount: 750 },
  { rollNo: '45', month: 'August', date: '2026-10-14', amount: 750 },
  { rollNo: '45', month: 'September', date: '2026-10-14', amount: 750 },
  { rollNo: '35', month: 'June', date: '2026-07-31', amount: 550 },
  { rollNo: '50', month: 'June', date: '2026-07-20', amount: 850 },
  { rollNo: '50', month: 'July', date: '2026-09-15', amount: 850 },
  { rollNo: '50', month: 'August', date: '2026-09-15', amount: 850 },
  { rollNo: '38', month: 'June', date: '2026-07-21', amount: 850 },
  { rollNo: '38', month: 'July', date: '2026-07-21', amount: 850 },
  { rollNo: '38', month: 'August', date: '2026-08-31', amount: 850 },
  { rollNo: '38', month: 'September', date: '2026-11-23', amount: 850 },
  { rollNo: '38', month: 'October', date: '2026-11-23', amount: 850 },
  { rollNo: '38', month: 'November', date: '2026-11-23', amount: 850 },
  { rollNo: '40', month: 'June', date: '2026-10-07', amount: 850 },
  { rollNo: '40', month: 'July', date: '2026-10-07', amount: 850 },
  { rollNo: '40', month: 'August', date: '2026-10-07', amount: 850 },
  { rollNo: '40', month: 'September', date: '2026-10-07', amount: 850 },
  { rollNo: '51', month: 'June', date: '2026-08-10', amount: 850 },
  { rollNo: '51', month: 'July', date: '2026-08-10', amount: 850 },
  { rollNo: '51', month: 'August', date: '2026-08-10', amount: 850 },
  { rollNo: '51', month: 'September', date: '2026-09-15', amount: 450 },
  { rollNo: '62', month: 'June', date: '2026-08-10', amount: 850 },
  { rollNo: '62', month: 'July', date: '2026-08-10', amount: 850 },
  { rollNo: '63', month: 'June', date: '2026-06-03', amount: 750 },
  { rollNo: '63', month: 'July', date: '2026-07-15', amount: 750 },
  { rollNo: '63', month: 'August', date: '2026-08-15', amount: 750 },
  { rollNo: '63', month: 'September', date: '2026-09-16', amount: 750 },
  { rollNo: '63', month: 'October', date: '2026-10-12', amount: 750 },
  { rollNo: '63', month: 'November', date: '2026-10-12', amount: 750 },
  { rollNo: '64', month: 'June', date: '2026-08-18', amount: 750 },
  { rollNo: '64', month: 'July', date: '2026-08-05', amount: 750 },
  { rollNo: '64', month: 'August', date: '2026-08-05', amount: 750 },
  { rollNo: '73', month: 'June', date: '2026-08-18', amount: 850 },
  { rollNo: '73', month: 'July', date: '2026-08-18', amount: 850 },
  { rollNo: '73', month: 'August', date: '2026-09-04', amount: 850 },
  { rollNo: '73', month: 'September', date: '2026-09-04', amount: 850 },
  { rollNo: '74', month: 'June', date: '2026-08-20', amount: 750 },
  { rollNo: '74', month: 'July', date: '2026-08-20', amount: 750 },
  { rollNo: '74', month: 'August', date: '2026-09-15', amount: 375 },
  { rollNo: '74', month: 'September', date: '2026-09-15', amount: 375 },
  { rollNo: '74', month: 'October', date: '2026-11-03', amount: 375 },
  { rollNo: '74', month: 'November', date: '2026-11-03', amount: 375 },
  { rollNo: '58', month: 'June', date: '2026-09-03', amount: 425 },
  { rollNo: '58', month: 'July', date: '2026-10-12', amount: 425 },
  { rollNo: '58', month: 'August', date: '2026-10-12', amount: 425 },
  { rollNo: '58', month: 'September', date: '2026-10-12', amount: 425 },
  { rollNo: '58', month: 'October', date: '2026-10-12', amount: 425 },
  { rollNo: '58', month: 'November', date: '2026-10-12', amount: 425 },
  { rollNo: '61', month: 'June', date: '2026-09-03', amount: 850 },
  { rollNo: '61', month: 'July', date: '2026-09-23', amount: 850 },
  { rollNo: '61', month: 'August', date: '2026-11-05', amount: 850 },
  { rollNo: '61', month: 'September', date: '2026-11-05', amount: 850 },
  { rollNo: '61', month: 'October', date: '2026-11-05', amount: 850 },
  { rollNo: '61', month: 'November', date: '2026-11-05', amount: 850 },

  // UKG B (Image 2)
  // Ajay paid full year (11 months):
  { rollNo: '46', month: 'June', date: '2026-09-18', amount: 900 },
  { rollNo: '46', month: 'July', date: '2026-09-18', amount: 900 },
  { rollNo: '46', month: 'August', date: '2026-09-18', amount: 900 },
  { rollNo: '46', month: 'September', date: '2026-09-18', amount: 900 },
  { rollNo: '46', month: 'October', date: '2026-09-18', amount: 900 },
  { rollNo: '46', month: 'November', date: '2026-09-18', amount: 900 },
  { rollNo: '46', month: 'December', date: '2026-09-18', amount: 900 },
  { rollNo: '46', month: 'January', date: '2026-09-18', amount: 900 },
  { rollNo: '46', month: 'February', date: '2026-09-18', amount: 900 },
  { rollNo: '46', month: 'March', date: '2026-09-18', amount: 900 },
  { rollNo: '46', month: 'April', date: '2026-08-18', amount: 900 },

  { rollNo: '26', month: 'June', date: '2026-07-22', amount: 700 },
  { rollNo: '26', month: 'July', date: '2026-07-22', amount: 700 },
  { rollNo: '26', month: 'August', date: '2026-09-17', amount: 700 },
  { rollNo: '26', month: 'September', date: '2026-09-17', amount: 700 },
  { rollNo: '31', month: 'June', date: '2026-11-13', amount: 850 },
  { rollNo: '31', month: 'July', date: '2026-11-13', amount: 850 },
  { rollNo: '31', month: 'August', date: '2026-11-13', amount: 850 },
  { rollNo: '31', month: 'September', date: '2026-11-13', amount: 850 },
  { rollNo: '31', month: 'October', date: '2026-11-13', amount: 600 },
  { rollNo: '30', month: 'June', date: '2026-07-24', amount: 850 },
  { rollNo: '30', month: 'July', date: '2026-07-24', amount: 850 },
  { rollNo: '30', month: 'August', date: '2026-08-31', amount: 850 },
  { rollNo: '30', month: 'September', date: '2026-09-16', amount: 850 },
  { rollNo: '34', month: 'June', date: '2026-07-20', amount: 900 },
  { rollNo: '34', month: 'July', date: '2026-07-20', amount: 900 },
  { rollNo: '34', month: 'August', date: '2026-08-20', amount: 900 },
  { rollNo: '34', month: 'September', date: '2026-10-15', amount: 850 },
  { rollNo: '34', month: 'October', date: '2026-11-19', amount: 900 },
  { rollNo: '43', month: 'June', date: '2026-09-24', amount: 850 },
  { rollNo: '43', month: 'July', date: '2026-09-24', amount: 850 },
  { rollNo: '43', month: 'August', date: '2026-09-24', amount: 850 },
  { rollNo: '43', month: 'September', date: '2026-09-24', amount: 850 },
  { rollNo: '53', month: 'June', date: '2026-07-16', amount: 850 },
  { rollNo: '53', month: 'July', date: '2026-09-16', amount: 850 },
  { rollNo: '53', month: 'August', date: '2026-09-16', amount: 850 },
  { rollNo: '36', month: 'June', date: '2026-08-18', amount: 850 },
  { rollNo: '36', month: 'July', date: '2026-10-14', amount: 850 },
  { rollNo: '36', month: 'August', date: '2026-10-14', amount: 850 },
  { rollNo: '36', month: 'September', date: '2026-10-14', amount: 850 },
  { rollNo: '44', month: 'June', date: '2026-08-10', amount: 850 },
  { rollNo: '44', month: 'July', date: '2026-08-10', amount: 850 },
  { rollNo: '44', month: 'August', date: '2026-08-10', amount: 850 },
  { rollNo: '44', month: 'September', date: '2026-09-15', amount: 850 },
  { rollNo: '22', month: 'June', date: '2026-08-05', amount: 850 },
  { rollNo: '22', month: 'July', date: '2026-08-05', amount: 850 },
  { rollNo: '22', month: 'August', date: '2026-08-05', amount: 850 },
  { rollNo: '22', month: 'September', date: '2026-09-15', amount: 850 },
  { rollNo: '23', month: 'June', date: '2026-09-22', amount: 850 },
  { rollNo: '23', month: 'July', date: '2026-09-22', amount: 850 },
  { rollNo: '23', month: 'August', date: '2026-09-22', amount: 850 },
  { rollNo: '23', month: 'September', date: '2026-09-22', amount: 850 },
  { rollNo: '28', month: 'June', date: '2026-09-18', amount: 800 },
  { rollNo: '28', month: 'July', date: '2026-09-18', amount: 800 },
  { rollNo: '28', month: 'August', date: '2026-09-18', amount: 800 },
  { rollNo: '28', month: 'September', date: '2026-09-18', amount: 800 },
  { rollNo: '49', month: 'June', date: '2026-09-18', amount: 800 },
  { rollNo: '49', month: 'July', date: '2026-09-18', amount: 800 },
  { rollNo: '57', month: 'June', date: '2026-11-02', amount: 850 },
  { rollNo: '57', month: 'July', date: '2026-11-02', amount: 850 },
  { rollNo: '57', month: 'August', date: '2026-11-02', amount: 850 },
  { rollNo: '57', month: 'September', date: '2026-11-02', amount: 850 },
  { rollNo: '57', month: 'October', date: '2026-11-02', amount: 850 },
  { rollNo: '57', month: 'November', date: '2026-11-02', amount: 850 },
  { rollNo: '54', month: 'June', date: '2026-09-24', amount: 850 },
  { rollNo: '54', month: 'July', date: '2026-09-24', amount: 850 },
  { rollNo: '54', month: 'August', date: '2026-11-05', amount: 850 },
  { rollNo: '54', month: 'September', date: '2026-11-05', amount: 850 },
  { rollNo: '56', month: 'June', date: '2026-06-15', amount: 850 },
  { rollNo: '56', month: 'July', date: '2026-07-15', amount: 850 },
  { rollNo: '56', month: 'August', date: '2026-10-26', amount: 850 },
  { rollNo: '56', month: 'September', date: '2026-10-26', amount: 850 },
  { rollNo: '56', month: 'October', date: '2026-10-26', amount: 850 },
  { rollNo: '60', month: 'June', date: '2026-08-05', amount: 850 },
  { rollNo: '60', month: 'July', date: '2026-09-08', amount: 850 },
  { rollNo: '60', month: 'August', date: '2026-09-08', amount: 850 },
  { rollNo: '66', month: 'June', date: '2026-07-14', amount: 900 },
  { rollNo: '66', month: 'July', date: '2026-07-14', amount: 900 },
  { rollNo: '66', month: 'August', date: '2026-09-07', amount: 900 },
  { rollNo: '66', month: 'September', date: '2026-09-07', amount: 900 },
  { rollNo: '71', month: 'June', date: '2026-08-07', amount: 700 },
  { rollNo: '71', month: 'July', date: '2026-08-07', amount: 700 },
  { rollNo: '71', month: 'August', date: '2026-08-07', amount: 700 },
  { rollNo: '71', month: 'September', date: '2026-10-14', amount: 700 },
  { rollNo: '71', month: 'October', date: '2026-10-14', amount: 700 },
  { rollNo: '76', month: 'June', date: '2026-07-14', amount: 900 },
  { rollNo: '76', month: 'July', date: '2026-07-16', amount: 900 },
  { rollNo: '68', month: 'June', date: '2026-08-05', amount: 900 },
  { rollNo: '68', month: 'July', date: '2026-08-05', amount: 900 },
  { rollNo: '68', month: 'August', date: '2026-09-18', amount: 900 },
  { rollNo: '68', month: 'September', date: '2026-09-18', amount: 900 },
  { rollNo: '75', month: 'June', date: '2026-07-16', amount: 900 },
  { rollNo: '75', month: 'July', date: '2026-07-16', amount: 900 },
  { rollNo: '75', month: 'August', date: '2026-07-16', amount: 900 },
  { rollNo: '75', month: 'September', date: '2026-07-16', amount: 900 },
  { rollNo: '75', month: 'October', date: '2026-07-16', amount: 900 },
  { rollNo: '75', month: 'November', date: '2026-07-16', amount: 900 },
  { rollNo: '72', month: 'June', date: '2026-08-21', amount: 850 },
  { rollNo: '65', month: 'June', date: '2026-06-24', amount: 850 },
  { rollNo: '65', month: 'July', date: '2026-08-05', amount: 850 },
  { rollNo: '65', month: 'August', date: '2026-08-05', amount: 850 },
  { rollNo: '65', month: 'September', date: '2026-09-03', amount: 850 },
  { rollNo: '65', month: 'October', date: '2026-10-15', amount: 850 },
  { rollNo: '65', month: 'November', date: '2026-11-23', amount: 850 },
  { rollNo: '70', month: 'June', date: '2026-09-11', amount: 750 },
  { rollNo: '70', month: 'July', date: '2026-09-11', amount: 750 },
  { rollNo: '70', month: 'August', date: '2026-09-11', amount: 750 },
  { rollNo: '70', month: 'September', date: '2026-09-11', amount: 750 },
  { rollNo: '70', month: 'October', date: '2026-11-11', amount: 750 },
  { rollNo: '70', month: 'November', date: '2026-11-11', amount: 750 },
  { rollNo: 'UKG-56', month: 'June', date: '2026-08-31', amount: 850 },
  { rollNo: 'UKG-56', month: 'July', date: '2026-08-31', amount: 850 },
  { rollNo: '25', month: 'June', date: '2026-10-09', amount: 850 },
  { rollNo: '25', month: 'July', date: '2026-10-09', amount: 850 },
  { rollNo: '25', month: 'August', date: '2026-10-09', amount: 850 },

  // 1st Std (Image 3)
  { rollNo: '77', month: 'June', date: '2026-08-04', amount: 850 },
  { rollNo: '77', month: 'July', date: '2026-08-04', amount: 850 },
  { rollNo: '77', month: 'August', date: '2026-09-21', amount: 850 },
  { rollNo: '77', month: 'September', date: '2026-09-21', amount: 850 },
  { rollNo: '79', month: 'June', date: '2026-07-13', amount: 850 },
  { rollNo: '79', month: 'July', date: '2026-07-13', amount: 850 },
  { rollNo: '79', month: 'August', date: '2026-09-09', amount: 800 },
  { rollNo: '79', month: 'September', date: '2026-09-09', amount: 800 },
  { rollNo: '81', month: 'June', date: '2026-08-17', amount: 850 },
  { rollNo: '81', month: 'July', date: '2026-08-17', amount: 850 },
  { rollNo: '81', month: 'August', date: '2026-08-17', amount: 850 },
  { rollNo: '84', month: 'June', date: '2026-07-01', amount: 900 },
  { rollNo: '84', month: 'July', date: '2026-07-20', amount: 900 },
  { rollNo: '84', month: 'August', date: '2026-08-21', amount: 900 },
  { rollNo: '84', month: 'September', date: '2026-09-15', amount: 900 },
  { rollNo: '84', month: 'October', date: '2026-10-16', amount: 900 },
  { rollNo: '84', month: 'November', date: '2026-11-19', amount: 900 },
  { rollNo: '80', month: 'June', date: '2026-06-10', amount: 900 },
  { rollNo: '80', month: 'July', date: '2026-05-10', amount: 900 },
  { rollNo: '87', month: 'June', date: '2026-07-11', amount: 750 },
  { rollNo: '87', month: 'July', date: '2026-10-05', amount: 800 },
  { rollNo: '87', month: 'August', date: '2026-10-05', amount: 800 },
  { rollNo: '87', month: 'September', date: '2026-10-05', amount: 800 },
  { rollNo: '87', month: 'October', date: '2026-11-03', amount: 800 },
  { rollNo: '86', month: 'June', date: '2026-07-24', amount: 900 },
  { rollNo: '86', month: 'July', date: '2026-07-24', amount: 900 },
  { rollNo: '86', month: 'August', date: '2026-09-15', amount: 900 },
  { rollNo: '85', month: 'June', date: '2026-07-15', amount: 1000 },
  { rollNo: '85', month: 'July', date: '2026-09-03', amount: 1000 },
  { rollNo: '85', month: 'August', date: '2026-11-05', amount: 1000 },
  { rollNo: '89', month: 'June', date: '2026-07-16', amount: 900 },
  { rollNo: '89', month: 'July', date: '2026-07-16', amount: 900 },
  { rollNo: '89', month: 'August', date: '2026-07-16', amount: 900 },
  { rollNo: '89', month: 'September', date: '2026-07-16', amount: 900 },
  { rollNo: '89', month: 'October', date: '2026-07-16', amount: 900 },
  { rollNo: '89', month: 'November', date: '2026-07-16', amount: 900 },
  { rollNo: '88', month: 'June', date: '2026-07-07', amount: 900 },
  { rollNo: '88', month: 'July', date: '2026-08-21', amount: 900 },
  { rollNo: '88', month: 'August', date: '2026-08-21', amount: 900 },
  { rollNo: '88', month: 'September', date: '2026-10-14', amount: 900 },
  { rollNo: '83', month: 'June', date: '2026-07-22', amount: 800 },
  { rollNo: '83', month: 'July', date: '2026-07-22', amount: 800 },
  { rollNo: '91', month: 'June', date: '2026-08-10', amount: 850 },
  { rollNo: '91', month: 'July', date: '2026-10-09', amount: 850 },
  { rollNo: '91', month: 'August', date: '2026-10-09', amount: 850 },
  { rollNo: '91', month: 'September', date: '2026-10-09', amount: 850 },
  { rollNo: '92', month: 'June', date: '2026-09-08', amount: 850 },
  { rollNo: '92', month: 'July', date: '2026-09-08', amount: 850 },
  { rollNo: '92', month: 'August', date: '2026-09-08', amount: 850 },
  { rollNo: '92', month: 'September', date: '2026-09-08', amount: 850 },
  { rollNo: '97', month: 'June', date: '2026-08-10', amount: 900 },
  { rollNo: '97', month: 'July', date: '2026-08-10', amount: 900 },
  { rollNo: '97', month: 'August', date: '2026-09-15', amount: 900 },
  { rollNo: '97', month: 'September', date: '2026-09-13', amount: 900 },
  { rollNo: '97', month: 'October', date: '2026-11-13', amount: 900 },
  { rollNo: '97', month: 'November', date: '2026-11-13', amount: 900 },
  { rollNo: '99', month: 'June', date: '2026-08-14', amount: 900 },
  { rollNo: '99', month: 'July', date: '2026-08-14', amount: 900 },
  { rollNo: '99', month: 'August', date: '2026-10-08', amount: 900 },
  { rollNo: '99', month: 'September', date: '2026-10-08', amount: 900 },
  { rollNo: '99', month: 'October', date: '2026-11-18', amount: 900 },
  { rollNo: '99', month: 'November', date: '2026-11-18', amount: 900 },
  { rollNo: '95', month: 'June', date: '2026-07-14', amount: 850 },
  { rollNo: '95', month: 'July', date: '2026-07-14', amount: 850 },
  { rollNo: '95', month: 'August', date: '2026-08-05', amount: 850 },
  { rollNo: '95', month: 'September', date: '2026-10-12', amount: 850 },
  { rollNo: '95', month: 'October', date: '2026-10-12', amount: 850 },
  { rollNo: '96', month: 'June', date: '2026-08-24', amount: 900 },
  { rollNo: '96', month: 'July', date: '2026-08-24', amount: 900 },
  { rollNo: '96', month: 'August', date: '2026-08-24', amount: 900 },
  { rollNo: '96', month: 'September', date: '2026-10-16', amount: 850 },
  { rollNo: '98', month: 'June', date: '2026-07-24', amount: 900 },
  { rollNo: '98', month: 'July', date: '2026-07-24', amount: 900 },
  { rollNo: '98', month: 'August', date: '2026-09-15', amount: 900 },
  { rollNo: '100', month: 'June', date: '2026-08-05', amount: 900 },
  { rollNo: '100', month: 'July', date: '2026-08-05', amount: 900 },
  { rollNo: '100', month: 'August', date: '2026-08-05', amount: 900 },

  // 2nd Std (Images 4 & 5)
  { rollNo: '102', month: 'June', date: '2026-07-21', amount: 1000 },
  { rollNo: '102', month: 'July', date: '2026-09-10', amount: 1000 },
  { rollNo: '102', month: 'August', date: '2026-11-02', amount: 1000 },
  { rollNo: '103', month: 'June', date: '2026-10-19', amount: 1000 },
  { rollNo: '103', month: 'July', date: '2026-09-11', amount: 800 },
  { rollNo: '103', month: 'August', date: '2026-09-11', amount: 800 },
  { rollNo: '104', month: 'June', date: '2026-11-10', amount: 300 },
  { rollNo: '104', month: 'July', date: '2026-11-10', amount: 300 },
  { rollNo: '104', month: 'August', date: '2026-11-10', amount: 300 },
  { rollNo: '108', month: 'June', date: '2026-07-09', amount: 900 },
  { rollNo: '108', month: 'July', date: '2026-08-07', amount: 900 },
  { rollNo: '108', month: 'August', date: '2026-09-07', amount: 900 },
  { rollNo: '108', month: 'September', date: '2026-10-06', amount: 900 },
  { rollNo: '108', month: 'October', date: '2026-11-11', amount: 900 },
  { rollNo: '109', month: 'June', date: '2026-09-10', amount: 850 },
  { rollNo: '109', month: 'July', date: '2026-09-10', amount: 850 },
  { rollNo: '109', month: 'August', date: '2026-09-10', amount: 850 },
  { rollNo: '111', month: 'June', date: '2026-07-09', amount: 850 },
  { rollNo: '111', month: 'July', date: '2026-07-09', amount: 850 },
  { rollNo: '111', month: 'August', date: '2026-09-16', amount: 850 },
  { rollNo: '111', month: 'September', date: '2026-09-16', amount: 850 },
  { rollNo: '111', month: 'October', date: '2026-11-11', amount: 850 },
  { rollNo: '111', month: 'November', date: '2026-11-11', amount: 850 },
  { rollNo: '112', month: 'June', date: '2026-07-11', amount: 750 },
  { rollNo: '112', month: 'July', date: '2026-10-05', amount: 800 },
  { rollNo: '112', month: 'August', date: '2026-10-05', amount: 800 },
  { rollNo: '112', month: 'September', date: '2026-10-05', amount: 800 },
  { rollNo: '112', month: 'October', date: '2026-11-03', amount: 800 },
  { rollNo: '113', month: 'June', date: '2026-06-05', amount: 700 },
  { rollNo: '113', month: 'July', date: '2026-08-05', amount: 700 },
  { rollNo: '113', month: 'August', date: '2026-08-05', amount: 700 },
  { rollNo: '113', month: 'September', date: '2026-08-05', amount: 700 },
  { rollNo: '113', month: 'October', date: '2026-08-05', amount: 700 },
  { rollNo: '113', month: 'November', date: '2026-11-11', amount: 700 },
  { rollNo: '116', month: 'June', date: '2026-10-05', amount: 850 },
  { rollNo: '116', month: 'July', date: '2026-10-05', amount: 850 },
  { rollNo: '116', month: 'August', date: '2026-10-05', amount: 850 },
  { rollNo: '116', month: 'September', date: '2026-10-23', amount: 850 },
  { rollNo: '117', month: 'June', date: '2026-06-28', amount: 850 },
  { rollNo: '118', month: 'June', date: '2026-08-21', amount: 850 },
  { rollNo: '118', month: 'July', date: '2026-08-21', amount: 850 },
  { rollNo: '118', month: 'August', date: '2026-08-21', amount: 850 },
  { rollNo: '118', month: 'September', date: '2026-09-16', amount: 850 },
  { rollNo: '118', month: 'October', date: '2026-10-12', amount: 850 },
  { rollNo: '121', month: 'June', date: '2026-05-21', amount: 850 },
  { rollNo: '121', month: 'July', date: '2026-07-24', amount: 850 },
  { rollNo: '122', month: 'June', date: '2026-09-23', amount: 850 },
  { rollNo: '122', month: 'July', date: '2026-09-23', amount: 850 },
  { rollNo: '122', month: 'August', date: '2026-09-23', amount: 850 },
  { rollNo: '122', month: 'September', date: '2026-09-23', amount: 850 },
  { rollNo: '119', month: 'June', date: '2026-07-20', amount: 750 },
  { rollNo: '119', month: 'July', date: '2026-08-20', amount: 750 },
  { rollNo: '119', month: 'August', date: '2026-08-20', amount: 750 },
  { rollNo: '119', month: 'September', date: '2026-09-15', amount: 375 },
  { rollNo: '119', month: 'October', date: '2026-11-03', amount: 375 },
  { rollNo: '123', month: 'June', date: '2026-06-08', amount: 850 },
  { rollNo: '123', month: 'July', date: '2026-07-13', amount: 450 },
  { rollNo: '123', month: 'August', date: '2026-08-07', amount: 450 },
  { rollNo: '123', month: 'September', date: '2026-09-17', amount: 450 },
  { rollNo: '123', month: 'October', date: '2026-10-15', amount: 450 },
  { rollNo: '124', month: 'June', date: '2026-09-18', amount: 425 },
  { rollNo: '124', month: 'July', date: '2026-09-18', amount: 425 },
  { rollNo: '124', month: 'August', date: '2026-09-18', amount: 425 },
  { rollNo: '124', month: 'September', date: '2026-09-18', amount: 425 },
  { rollNo: '114', month: 'June', date: '2026-07-13', amount: 850 },
  { rollNo: '114', month: 'July', date: '2026-07-13', amount: 850 },
  { rollNo: '114', month: 'August', date: '2026-09-15', amount: 850 },
  { rollNo: '114', month: 'September', date: '2026-09-15', amount: 850 },
  { rollNo: '125', month: 'June', date: '2026-06-05', amount: 900 },
  { rollNo: '125', month: 'July', date: '2026-08-05', amount: 900 },
  { rollNo: '125', month: 'August', date: '2026-08-05', amount: 900 },
  { rollNo: '126', month: 'June', date: '2026-08-12', amount: 900 },
  { rollNo: '126', month: 'July', date: '2026-08-12', amount: 900 },
  { rollNo: '126', month: 'August', date: '2026-10-29', amount: 900 },
  { rollNo: '126', month: 'September', date: '2026-10-29', amount: 900 },
  { rollNo: '126', month: 'October', date: '2026-10-29', amount: 900 },
  { rollNo: '127', month: 'June', date: '2026-08-25', amount: 950 },
  { rollNo: '127', month: 'July', date: '2026-08-25', amount: 950 },
  { rollNo: '127', month: 'August', date: '2026-10-05', amount: 950 },
  { rollNo: '127', month: 'September', date: '2026-10-05', amount: 950 },
  { rollNo: '128', month: 'June', date: '2026-07-13', amount: 400 },
  { rollNo: '128', month: 'July', date: '2026-08-24', amount: 350 },
  { rollNo: '128', month: 'August', date: '2026-08-24', amount: 350 },
  { rollNo: '128', month: 'September', date: '2026-10-15', amount: 350 },
  { rollNo: '128', month: 'October', date: '2026-10-15', amount: 350 },
  { rollNo: '128', month: 'November', date: '2026-11-24', amount: 350 },
  { rollNo: '130', month: 'June', date: '2026-06-15', amount: 900 },
  { rollNo: '130', month: 'July', date: '2026-07-15', amount: 900 },
  { rollNo: '130', month: 'August', date: '2026-08-15', amount: 900 },
  { rollNo: '130', month: 'September', date: '2026-09-15', amount: 900 },
  { rollNo: '130', month: 'October', date: '2026-11-20', amount: 900 },
  { rollNo: '131', month: 'June', date: '2026-10-22', amount: 750 },
  { rollNo: '131', month: 'July', date: '2026-09-03', amount: 750 },
  { rollNo: '131', month: 'August', date: '2026-09-03', amount: 750 },
  { rollNo: '131', month: 'September', date: '2026-10-27', amount: 750 },
  { rollNo: '132', month: 'June', date: '2026-07-13', amount: 850 },
  { rollNo: '132', month: 'July', date: '2026-08-10', amount: 850 },
  { rollNo: '132', month: 'August', date: '2026-10-23', amount: 850 },
  { rollNo: '133', month: 'June', date: '2026-08-21', amount: 850 },
  { rollNo: '133', month: 'July', date: '2026-08-21', amount: 850 },
  { rollNo: '133', month: 'August', date: '2026-08-21', amount: 850 },
  { rollNo: '134', month: 'June', date: '2026-07-16', amount: 850 },
  { rollNo: '134', month: 'July', date: '2026-09-16', amount: 850 },
  { rollNo: '134', month: 'August', date: '2026-09-16', amount: 850 },
  { rollNo: '134', month: 'September', date: '2026-09-16', amount: 850 },
  { rollNo: '135', month: 'June', date: '2026-07-22', amount: 700 },
  { rollNo: '135', month: 'July', date: '2026-07-22', amount: 700 },
  { rollNo: '135', month: 'August', date: '2026-09-15', amount: 700 },
  { rollNo: '135', month: 'September', date: '2026-09-15', amount: 700 },
  { rollNo: '136', month: 'June', date: '2026-06-15', amount: 900 },
  { rollNo: '136', month: 'July', date: '2026-07-15', amount: 900 },
  { rollNo: '136', month: 'August', date: '2026-09-15', amount: 900 },
  { rollNo: '136', month: 'September', date: '2026-09-13', amount: 900 },
  { rollNo: '138', month: 'June', date: '2026-09-16', amount: 800 },
  { rollNo: '138', month: 'July', date: '2026-09-16', amount: 800 },
  { rollNo: '138', month: 'August', date: '2026-09-16', amount: 800 },
  { rollNo: '139', month: 'June', date: '2026-07-14', amount: 650 },
  { rollNo: '139', month: 'July', date: '2026-08-25', amount: 650 },
  { rollNo: '139', month: 'August', date: '2026-08-25', amount: 650 },
  { rollNo: '139', month: 'September', date: '2026-09-15', amount: 650 },
  { rollNo: '139', month: 'October', date: '2026-11-13', amount: 750 },
  { rollNo: '140', month: 'June', date: '2026-08-25', amount: 750 },
  { rollNo: '140', month: 'July', date: '2026-08-25', amount: 750 },
  { rollNo: '140', month: 'August', date: '2026-08-25', amount: 750 },
  { rollNo: '140', month: 'September', date: '2026-08-25', amount: 750 },
  { rollNo: '140', month: 'October', date: '2026-10-12', amount: 750 },
  { rollNo: '140', month: 'November', date: '2026-10-12', amount: 750 },
  { rollNo: '141', month: 'June', date: '2026-05-22', amount: 900 },
  { rollNo: '141', month: 'July', date: '2026-07-20', amount: 900 },

  // 3rd Std (Image 6)
  { rollNo: '142', month: 'June', date: '2026-08-03', amount: 850 },
  { rollNo: '142', month: 'July', date: '2026-08-03', amount: 850 },
  { rollNo: '142', month: 'August', date: '2026-10-12', amount: 850 },
  { rollNo: '142', month: 'September', date: '2026-11-12', amount: 850 },
  { rollNo: '142', month: 'October', date: '2026-11-12', amount: 850 },
  { rollNo: '143', month: 'June', date: '2026-08-17', amount: 900 },
  { rollNo: '143', month: 'July', date: '2026-08-17', amount: 900 },
  { rollNo: '143', month: 'August', date: '2026-10-16', amount: 900 },
  { rollNo: '143', month: 'September', date: '2026-09-15', amount: 900 },
  { rollNo: '147', month: 'June', date: '2026-07-20', amount: 850 },
  { rollNo: '147', month: 'July', date: '2026-08-10', amount: 850 },
  { rollNo: '147', month: 'August', date: '2026-09-22', amount: 850 },
  { rollNo: '147', month: 'September', date: '2026-11-23', amount: 850 },
  { rollNo: '147', month: 'October', date: '2026-11-23', amount: 850 },
  { rollNo: '148', month: 'June', date: '2026-07-20', amount: 900 },
  { rollNo: '148', month: 'July', date: '2026-07-20', amount: 900 },
  { rollNo: '148', month: 'August', date: '2026-09-15', amount: 900 },
  { rollNo: '148', month: 'September', date: '2026-09-15', amount: 900 },
  { rollNo: '148', month: 'October', date: '2026-10-14', amount: 900 },
  { rollNo: '149', month: 'June', date: '2026-09-22', amount: 2000 },
  { rollNo: '151', month: 'June', date: '2026-08-24', amount: 900 },
  { rollNo: '151', month: 'July', date: '2026-08-24', amount: 900 },
  { rollNo: '151', month: 'August', date: '2026-11-05', amount: 900 },
  { rollNo: '151', month: 'September', date: '2026-11-05', amount: 900 },
  { rollNo: '151', month: 'October', date: '2026-11-05', amount: 900 },
  { rollNo: '154', month: 'June', date: '2026-08-20', amount: 850 },
  { rollNo: '154', month: 'July', date: '2026-08-20', amount: 850 },
  { rollNo: '154', month: 'August', date: '2026-08-20', amount: 850 },
  { rollNo: '155', month: 'June', date: '2026-09-10', amount: 850 },
  { rollNo: '155', month: 'July', date: '2026-09-10', amount: 850 },
  { rollNo: '155', month: 'August', date: '2026-09-10', amount: 850 },
  { rollNo: '157', month: 'June', date: '2026-07-13', amount: 850 },
  { rollNo: '157', month: 'July', date: '2026-08-28', amount: 850 },
  { rollNo: '157', month: 'August', date: '2026-10-12', amount: 850 },
  { rollNo: '158', month: 'June', date: '2026-09-03', amount: 750 },
  { rollNo: '158', month: 'July', date: '2026-09-03', amount: 750 },
  { rollNo: '158', month: 'August', date: '2026-09-03', amount: 750 },
  { rollNo: '158', month: 'September', date: '2026-09-03', amount: 750 },
  { rollNo: '158', month: 'October', date: '2026-09-03', amount: 750 },
  { rollNo: '159', month: 'June', date: '2026-07-14', amount: 900 },
  { rollNo: '159', month: 'July', date: '2026-07-14', amount: 900 },
  { rollNo: '159', month: 'August', date: '2026-09-01', amount: 900 },
  { rollNo: '159', month: 'September', date: '2026-09-01', amount: 900 },
  { rollNo: '162', month: 'June', date: '2026-06-16', amount: 950 },
  { rollNo: '162', month: 'July', date: '2026-09-08', amount: 950 },
  { rollNo: '162', month: 'August', date: '2026-09-08', amount: 950 },
  { rollNo: '162', month: 'September', date: '2026-09-08', amount: 950 },
  { rollNo: '163', month: 'June', date: '2026-08-04', amount: 350 },
  { rollNo: '163', month: 'July', date: '2026-08-04', amount: 350 },
  { rollNo: '163', month: 'August', date: '2026-09-15', amount: 350 },
  { rollNo: '164', month: 'June', date: '2026-08-04', amount: 350 },
  { rollNo: '164', month: 'July', date: '2026-08-04', amount: 350 },
  { rollNo: '164', month: 'August', date: '2026-09-15', amount: 350 },
  { rollNo: '165', month: 'June', date: '2026-08-04', amount: 800 },
  { rollNo: '165', month: 'July', date: '2026-09-10', amount: 850 },
  { rollNo: '165', month: 'August', date: '2026-09-10', amount: 850 },
  { rollNo: '165', month: 'September', date: '2026-11-10', amount: 850 },
  { rollNo: '166', month: 'July', date: '2026-08-20', amount: 450 },
  { rollNo: '166', month: 'August', date: '2026-08-20', amount: 450 },

  // 4th Std (Image 7)
  { rollNo: '167', month: 'June', date: '2026-08-19', amount: 2000 },
  { rollNo: '168', month: 'June', date: '2026-07-27', amount: 450 },
  { rollNo: '168', month: 'July', date: '2026-07-27', amount: 450 },
  { rollNo: '168', month: 'August', date: '2026-09-10', amount: 450 },
  { rollNo: '168', month: 'September', date: '2026-09-10', amount: 450 },
  { rollNo: '171', month: 'June', date: '2026-07-16', amount: 850 },
  { rollNo: '171', month: 'July', date: '2026-08-05', amount: 850 },
  { rollNo: '171', month: 'August', date: '2026-08-05', amount: 850 },
  { rollNo: '171', month: 'September', date: '2026-09-03', amount: 850 },
  { rollNo: '171', month: 'October', date: '2026-10-08', amount: 850 },
  { rollNo: '171', month: 'November', date: '2026-11-03', amount: 850 },
  { rollNo: '173', month: 'June', date: '2026-10-09', amount: 750 },
  { rollNo: '173', month: 'July', date: '2026-10-09', amount: 750 },
  { rollNo: '173', month: 'August', date: '2026-10-09', amount: 750 },
  { rollNo: '173', month: 'September', date: '2026-10-10', amount: 750 },
  { rollNo: '175', month: 'June', date: '2026-08-04', amount: 750 },
  { rollNo: '175', month: 'July', date: '2026-08-04', amount: 750 },
  { rollNo: '175', month: 'August', date: '2026-10-14', amount: 750 },
  { rollNo: '175', month: 'September', date: '2026-10-14', amount: 750 },
  { rollNo: '176', month: 'June', date: '2026-07-15', amount: 850 },
  { rollNo: '176', month: 'July', date: '2026-07-15', amount: 850 },
  { rollNo: '176', month: 'August', date: '2026-07-15', amount: 850 },
  { rollNo: '176', month: 'September', date: '2026-07-15', amount: 850 },
  { rollNo: '176', month: 'October', date: '2026-07-15', amount: 850 },
  { rollNo: '178', month: 'June', date: '2026-08-28', amount: 850 },
  { rollNo: '181', month: 'June', date: '2026-07-24', amount: 950 },
  { rollNo: '181', month: 'July', date: '2026-07-24', amount: 950 },
  { rollNo: '184', month: 'June', date: '2026-08-12', amount: 900 },
  { rollNo: '184', month: 'July', date: '2026-08-12', amount: 900 },
  { rollNo: '184', month: 'August', date: '2026-10-29', amount: 900 },
  { rollNo: '184', month: 'September', date: '2026-10-29', amount: 900 },
  { rollNo: '184', month: 'October', date: '2026-10-29', amount: 900 },
  { rollNo: '185', month: 'June', date: '2026-06-08', amount: 850 },
  { rollNo: '185', month: 'July', date: '2026-07-13', amount: 450 },
  { rollNo: '185', month: 'August', date: '2026-08-07', amount: 450 },
  { rollNo: '185', month: 'September', date: '2026-09-17', amount: 450 },
  { rollNo: '185', month: 'October', date: '2026-10-15', amount: 450 },
  { rollNo: '186', month: 'June', date: '2026-08-10', amount: 850 },
  { rollNo: '186', month: 'July', date: '2026-10-09', amount: 850 },
  { rollNo: '186', month: 'August', date: '2026-10-09', amount: 850 },
  { rollNo: '186', month: 'September', date: '2026-10-09', amount: 850 },
  { rollNo: '187', month: 'June', date: '2026-11-05', amount: 650 },
  { rollNo: '187', month: 'July', date: '2026-11-05', amount: 650 },
  { rollNo: '187', month: 'August', date: '2026-11-05', amount: 650 },
  { rollNo: '189', month: 'June', date: '2026-08-31', amount: 400 },
  { rollNo: '189', month: 'July', date: '2026-08-31', amount: 400 },
  { rollNo: '189', month: 'August', date: '2026-08-31', amount: 400 },
  { rollNo: '189', month: 'September', date: '2026-11-11', amount: 400 },
  { rollNo: '189', month: 'October', date: '2026-11-11', amount: 400 },
  { rollNo: '189', month: 'November', date: '2026-11-11', amount: 400 },
  { rollNo: '190', month: 'June', date: '2026-09-18', amount: 750 },
  { rollNo: '190', month: 'July', date: '2026-09-18', amount: 750 },
  { rollNo: '191', month: 'June', date: '2026-07-27', amount: 850 },
  { rollNo: '191', month: 'July', date: '2026-08-18', amount: 850 },
  { rollNo: '191', month: 'August', date: '2026-09-18', amount: 850 },
  { rollNo: '191', month: 'September', date: '2026-11-21', amount: 850 },

  // 5th Std (Image 8)
  { rollNo: '192', month: 'June', date: '2026-06-15', amount: 700 },
  { rollNo: '192', month: 'July', date: '2026-07-15', amount: 700 },
  { rollNo: '192', month: 'August', date: '2026-11-11', amount: 750 },
  { rollNo: '192', month: 'September', date: '2026-11-12', amount: 750 },
  { rollNo: '192', month: 'October', date: '2026-11-12', amount: 750 },
  { rollNo: '193', month: 'June', date: '2026-07-14', amount: 850 },
  { rollNo: '193', month: 'July', date: '2026-07-14', amount: 850 },
  { rollNo: '193', month: 'August', date: '2026-09-22', amount: 850 },
  { rollNo: '193', month: 'September', date: '2026-11-02', amount: 850 },
  { rollNo: '193', month: 'October', date: '2026-11-12', amount: 850 },
  { rollNo: '195', month: 'June', date: '2026-07-21', amount: 800 },
  { rollNo: '195', month: 'July', date: '2026-07-21', amount: 800 },
  { rollNo: '195', month: 'August', date: '2026-09-18', amount: 850 },
  { rollNo: '195', month: 'September', date: '2026-09-18', amount: 850 },
  { rollNo: '197', month: 'June', date: '2026-07-24', amount: 850 },
  { rollNo: '197', month: 'July', date: '2026-07-24', amount: 850 },
  { rollNo: '197', month: 'August', date: '2026-11-05', amount: 850 },
  { rollNo: '197', month: 'September', date: '2026-11-05', amount: 850 },
  { rollNo: '197', month: 'October', date: '2026-11-05', amount: 850 },
  { rollNo: '197', month: 'November', date: '2026-11-05', amount: 850 },
  { rollNo: '197', month: 'December', date: '2026-11-05', amount: 600 },
  { rollNo: '198', month: 'June', date: '2026-07-20', amount: 900 },
  { rollNo: '198', month: 'July', date: '2026-07-20', amount: 900 },
  { rollNo: '198', month: 'August', date: '2026-09-15', amount: 900 },
  { rollNo: '198', month: 'September', date: '2026-09-15', amount: 900 },
  { rollNo: '198', month: 'October', date: '2026-10-14', amount: 900 },
  { rollNo: '199', month: 'June', date: '2026-11-23', amount: 1000 },
  { rollNo: '199', month: 'July', date: '2026-11-23', amount: 1000 },
  { rollNo: '199', month: 'August', date: '2026-11-23', amount: 1000 },
  { rollNo: '199', month: 'September', date: '2026-11-23', amount: 1000 },
  { rollNo: '199', month: 'October', date: '2026-11-23', amount: 1000 },
  { rollNo: '200', month: 'June', date: '2026-07-22', amount: 750 },
  { rollNo: '200', month: 'July', date: '2026-09-03', amount: 750 },
  { rollNo: '200', month: 'August', date: '2026-09-03', amount: 750 },
  { rollNo: '200', month: 'September', date: '2026-10-23', amount: 750 },
  { rollNo: '200', month: 'October', date: '2026-11-23', amount: 750 },
  { rollNo: '202', month: 'June', date: '2026-09-18', amount: 450 },
  { rollNo: '202', month: 'July', date: '2026-09-18', amount: 450 },
  { rollNo: '202', month: 'August', date: '2026-09-18', amount: 450 },
  { rollNo: '204', month: 'June', date: '2026-08-14', amount: 900 },
  { rollNo: '204', month: 'July', date: '2026-08-14', amount: 900 },
  { rollNo: '204', month: 'August', date: '2026-10-08', amount: 900 },
  { rollNo: '204', month: 'September', date: '2026-10-08', amount: 900 },
  { rollNo: '204', month: 'October', date: '2026-11-18', amount: 900 },
  { rollNo: '204', month: 'November', date: '2026-11-18', amount: 700 },
  { rollNo: '206', month: 'June', date: '2026-08-03', amount: 800 },
  { rollNo: '206', month: 'July', date: '2026-08-03', amount: 800 },
  { rollNo: '206', month: 'August', date: '2026-11-16', amount: 800 },
  { rollNo: '206', month: 'September', date: '2026-11-16', amount: 800 },
  { rollNo: '206', month: 'October', date: '2026-11-16', amount: 800 },
  { rollNo: '203', month: 'June', date: '2026-08-03', amount: 850 },
  { rollNo: '203', month: 'July', date: '2026-08-03', amount: 850 },
  { rollNo: '203', month: 'August', date: '2026-11-12', amount: 850 },
  { rollNo: '203', month: 'September', date: '2026-11-12', amount: 850 },
  { rollNo: '203', month: 'October', date: '2026-11-12', amount: 850 },

  // 6th Std (Image 9)
  { rollNo: '209', month: 'June', date: '2026-09-16', amount: 900 },
  { rollNo: '209', month: 'July', date: '2026-09-16', amount: 900 },
  { rollNo: '209', month: 'August', date: '2026-09-16', amount: 900 },
  { rollNo: '210', month: 'June', date: '2026-09-09', amount: 850 },
  { rollNo: '210', month: 'July', date: '2026-09-09', amount: 850 },
  { rollNo: '210', month: 'August', date: '2026-09-09', amount: 850 },
  { rollNo: '211', month: 'June', date: '2026-09-17', amount: 900 },
  { rollNo: '211', month: 'July', date: '2026-09-17', amount: 900 },
  { rollNo: '211', month: 'August', date: '2026-09-17', amount: 900 },
  { rollNo: '214', month: 'June', date: '2026-05-21', amount: 800 },
  { rollNo: '214', month: 'July', date: '2026-05-21', amount: 800 },
  { rollNo: '214', month: 'August', date: '2026-05-21', amount: 800 },
  { rollNo: '214', month: 'September', date: '2026-07-21', amount: 800 },
  { rollNo: '214', month: 'October', date: '2026-07-21', amount: 800 },
  { rollNo: '214', month: 'November', date: '2026-10-05', amount: 800 },
  { rollNo: '214', month: 'December', date: '2026-10-05', amount: 800 },
  { rollNo: '214', month: 'January', date: '2027-10-05', amount: 800 },

  // 7th Std (Image 9)
  { rollNo: '218', month: 'June', date: '2026-07-24', amount: 850 },
  { rollNo: '218', month: 'July', date: '2026-07-24', amount: 850 },
  { rollNo: '218', month: 'August', date: '2026-11-05', amount: 850 },
  { rollNo: '218', month: 'September', date: '2026-11-05', amount: 850 },
  { rollNo: '218', month: 'October', date: '2026-11-05', amount: 850 },
  { rollNo: '218', month: 'November', date: '2026-11-05', amount: 850 },
  { rollNo: '218', month: 'December', date: '2026-11-05', amount: 600 },
  { rollNo: '220', month: 'June', date: '2026-11-23', amount: 1000 },
  { rollNo: '220', month: 'July', date: '2026-11-23', amount: 1000 },
  { rollNo: '220', month: 'August', date: '2026-11-23', amount: 1000 },
  { rollNo: '220', month: 'September', date: '2026-11-23', amount: 1000 },
  { rollNo: '220', month: 'October', date: '2026-11-23', amount: 1000 },

  // 8th Std (Image 9)
  { rollNo: '221', month: 'June', date: '2026-07-24', amount: 850 },
  { rollNo: '221', month: 'July', date: '2026-07-24', amount: 850 },
  { rollNo: '221', month: 'August', date: '2026-11-05', amount: 850 },
  { rollNo: '221', month: 'September', date: '2026-11-05', amount: 850 },
  { rollNo: '221', month: 'October', date: '2026-11-05', amount: 850 },
  { rollNo: '221', month: 'November', date: '2026-11-05', amount: 850 },
  { rollNo: '221', month: 'December', date: '2026-11-05', amount: 600 },
  { rollNo: '222', month: 'June', date: '2026-07-16', amount: 850 },
  { rollNo: '222', month: 'July', date: '2026-07-16', amount: 850 },
  { rollNo: '222', month: 'August', date: '2026-09-09', amount: 850 },
  { rollNo: '222', month: 'September', date: '2026-10-07', amount: 850 },
  { rollNo: '222', month: 'October', date: '2026-11-10', amount: 850 },
  { rollNo: '223', month: 'June', date: '2026-07-14', amount: 850 },
  { rollNo: '223', month: 'July', date: '2026-07-14', amount: 850 },
  { rollNo: '223', month: 'August', date: '2026-09-22', amount: 850 },
  { rollNo: '223', month: 'September', date: '2026-11-12', amount: 850 },
  { rollNo: '223', month: 'October', date: '2026-11-12', amount: 850 }
];

// Keep existing school academic payments
const existingPayments = db.payments.filter(p => !p.feeCategories || !p.feeCategories.includes('Transport / Van Fees'));

let vSeq = 2001;
const newVanReceipts = [];

vanPayments.forEach(vp => {
  const s = findStudent(vp.rollNo);
  if (!s) {
    console.warn('Could not find student for van payment:', vp);
    return;
  }
  const receiptNo = `REC-2026-V${vSeq++}`;
  newVanReceipts.push({
    receiptNo,
    studentId: s.id,
    studentName: s.name,
    grade: s.grade,
    date: vp.date,
    term: `${vp.month} Van Fee`,
    feeCategories: ['Transport / Van Fees'],
    amount: vp.amount,
    paymentMethod: 'Cash',
    transactionId: `VAN-${receiptNo}`,
    remarks: `Van fee for ${vp.month} (Paid on ${vp.date.substring(5)})`,
    receivedBy: 'School Transport Office',
    boardingArea: s.boardingArea || 'School Van Route',
    transportPaymentMode: 'Monthly',
    transportMonth: `${vp.month} 2026`,
    transportFee: vp.amount,
    transportOpted: true
  });
});

const allPayments = [...existingPayments, ...newVanReceipts];
allPayments.sort((a, b) => new Date(b.date) - new Date(a.date));

db.payments = allPayments;

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

const seedPath = path.join(__dirname, 'seed_students.json');
fs.writeFileSync(seedPath, JSON.stringify(db.students, null, 2), 'utf8');

console.log('Successfully recorded', newVanReceipts.length, 'van fee payments!');
const totalVan = newVanReceipts.reduce((sum, p) => sum + p.amount, 0);
console.log('Total Van Fees Collected:', '₹' + totalVan.toLocaleString('en-IN'));
console.log('Total Payments in DB:', db.payments.length);
