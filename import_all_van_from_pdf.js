const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.json');
const seedPath = path.join(__dirname, 'seed_students.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// All students listed in the 10-page Van Fees PDF
const pdfStudents = [
  // ================= PAGE 1: LKG (27) =================
  { id: '1',      monthly: 375,  payments: [['June','2026-07-20',375],['July','2026-07-20',375],['August','2026-11-03',375],['September','2026-11-03',375],['October','2026-11-03',375],['November','2026-11-03',375]] },
  { id: '14',     monthly: 850,  payments: [['June','2026-08-13',850],['July','2026-08-13',850],['August','2026-08-13',850],['September','2026-11-06',850],['October','2026-11-06',850]] },
  { id: '2',      monthly: 0,    payments: [] }, // DHARSHITH .G
  { id: 'LKG-04', monthly: 0,    payments: [] }, // HARSHA MITHRAN .K
  { id: '3',      monthly: 0,    payments: [] }, // HASWANTH .S
  { id: '4',      monthly: 800,  payments: [['June','2026-07-13',850],['July','2026-07-13',850],['August','2026-09-09',800],['September','2026-09-09',800],['October','2026-11-27',800]] },
  { id: '6',      monthly: 850,  payments: [['June','2026-07-29',850],['July','2026-07-29',850]] },
  { id: '7',      monthly: 750,  payments: [['June','2026-07-22',750],['July','2026-10-20',750],['August','2026-11-10',750]] },
  { id: '8',      monthly: 900,  payments: [['June','2026-08-18',900],['July','2026-08-18',900],['August','2026-08-18',900]] },
  { id: '9',      monthly: 850,  payments: [['June','2026-07-24',850],['July','2026-07-24',850],['August','2026-09-03',850],['September','2026-10-12',850]] },
  { id: '10',     monthly: 900,  payments: [['June','2026-07-23',900],['July','2026-07-23',900],['August','2026-09-21',900],['September','2026-09-21',900],['October','2026-10-29',900]] },
  { id: '12',     monthly: 750,  payments: [['June','2026-08-28',750],['July','2026-08-28',750]] },
  { id: '13',     monthly: 850,  payments: [['June','2026-08-04',850],['July','2026-08-04',850],['August','2026-09-21',850],['September','2026-09-21',850]] },
  { id: '11',     monthly: 900,  payments: [['June','2026-07-24',900],['July','2026-07-24',900],['August','2026-08-05',900],['September','2026-08-31',900],['October','2026-11-18',900],['November','2026-11-18',900]] },
  { id: '15',     monthly: 850,  payments: [['June','2026-08-10',850],['July','2026-08-10',850],['August','2026-08-10',850]] },
  { id: '16',     monthly: 850,  payments: [['June','2026-08-04',850],['July','2026-08-04',850],['August','2026-08-24',850],['September','2026-09-10',850]] },
  { id: '20',     monthly: 900,  payments: [['June','2026-08-21',900],['July','2026-08-21',900],['August','2026-08-21',900]] },
  { id: 'LKG-20', monthly: 0,    payments: [] }, // SHALINI .K
  { id: '19',     monthly: 850,  payments: [['June','2026-06-24',850],['July','2026-08-05',850],['August','2026-08-05',850],['September','2026-09-23',850],['October','2026-10-12',850],['November','2026-10-23',850]] },
  { id: '18',     monthly: 850,  payments: [['June','2026-07-13',850],['July','2026-07-13',850],['August','2026-10-15',850],['September','2026-10-15',850],['October','2026-10-15',850]] },
  { id: '17',     monthly: 900,  payments: [['July','2026-06-29',900],['August','2026-08-24',900],['September','2026-10-29',900],['October','2026-10-29',900],['November','2026-10-29',900]] },
  { id: 'LKG-25', monthly: 850,  payments: [] }, // Varshith (rate only)
  { id: 'LKG-26', monthly: 850,  payments: [] }, // Delvin . M (rate only)
  { id: 'LKG-27', monthly: 850,  payments: [] }, // Ratchagan (rate only)
  { id: 'LKG-29', monthly: 850,  payments: [] }, // Ashvin Joe (rate only)
  { id: 'LKG-30', monthly: 850,  payments: [] }, // Lakshana (rate only)
  { id: 'LKG-31', monthly: 850,  payments: [] }, // Pragathishwaran (rate only)

  // ================= PAGE 2: UKG A (23) =================
  { id: '29',     monthly: 0,    payments: [] }, // DHARSHAN .S
  { id: '42',     monthly: 900,  payments: [['June','2026-07-24',900],['July','2026-07-24',900]] },
  { id: '27',     monthly: 450,  payments: [['June','2026-09-18',450],['July','2026-09-18',450],['August','2026-09-18',450]] },
  { id: '33',     monthly: 850,  payments: [['June','2026-07-24',850],['July','2026-07-24',850]] },
  { id: '32',     monthly: 850,  payments: [['June','2026-11-12',850],['July','2026-11-12',850],['August','2026-11-12',850],['September','2026-11-12',850],['October','2026-11-12',850],['November','2026-11-12',850]] },
  { id: '37',     monthly: 900,  payments: [['June','2026-07-30',900],['July','2026-07-30',900],['August','2026-09-16',900],['September','2026-09-16',900]] },
  { id: '41',     monthly: 900,  payments: [['June','2026-08-10',900],['July','2026-08-10',900],['August','2026-09-17',900],['September','2026-09-17',900],['October','2026-10-01',900],['November','2026-11-01',900]] },
  { id: '45',     monthly: 900,  payments: [['June','2026-08-25',900],['July','2026-08-25',900],['August','2026-08-25',900]] },
  { id: '35',     monthly: 750,  payments: [['June','2026-08-04',750],['July','2026-08-04',750],['August','2026-10-14',750],['September','2026-10-14',750]] },
  { id: '50',     monthly: 550,  payments: [['June','2026-07-03',550]] },
  { id: '38',     monthly: 850,  payments: [['June','2026-07-20',850],['July','2026-09-15',850],['August','2026-09-15',850]] },
  { id: '40',     monthly: 850,  payments: [['June','2026-07-21',850],['July','2026-07-21',850],['August','2026-08-31',850],['September','2026-11-23',850],['October','2026-11-23',850],['November','2026-11-23',850]] },
  { id: '51',     monthly: 850,  payments: [['June','2026-10-07',850],['July','2026-10-07',850],['August','2026-10-07',850],['September','2026-10-07',450]] },
  { id: '52',     monthly: 850,  payments: [['June','2026-08-10',850],['July','2026-08-10',850],['August','2026-08-10',850]] },
  { id: '55',     monthly: 850,  payments: [] }, // AISHWARYA .J.G (rate only)
  { id: '59',     monthly: 850,  payments: [] }, // HARINIGA .T (rate only)
  { id: '62',     monthly: 850,  payments: [['June','2026-08-10',850],['July','2026-08-10',850]] },
  { id: '63',     monthly: 750,  payments: [['June','2026-06-03',750],['July','2026-07-01',750],['August','2026-08-01',750],['September','2026-09-16',750],['October','2026-10-12',750]] },
  { id: '64',     monthly: 750,  payments: [['July','2026-08-05',750],['August','2026-08-05',750]] },
  { id: '73',     monthly: 850,  payments: [['June','2026-08-18',850],['July','2026-08-18',850],['August','2026-08-18',850],['September','2026-09-11',850]] },
  { id: '74',     monthly: 750,  payments: [['June','2026-08-20',750],['July','2026-08-20',750],['August','2026-08-20',750],['September','2026-09-15',375],['October','2026-11-03',375]] },
  { id: '58',     monthly: 425,  payments: [['July','2026-10-12',425],['August','2026-10-12',425],['September','2026-10-12',425],['October','2026-10-12',275]] },
  { id: '61',     monthly: 850,  payments: [['July','2026-09-23',850],['August','2026-09-23',850],['September','2026-11-05',850],['October','2026-11-05',850]] },

  // ================= PAGE 3: UKG B (28) =================
  { id: '46',     monthly: 900,  annual: 9900, payments: [
    ['June','2026-08-18',900],['July','2026-08-18',900],['August','2026-08-18',900],['September','2026-08-18',900],
    ['October','2026-08-18',900],['November','2026-08-18',900],['December','2026-08-18',900],['January','2026-08-18',900],
    ['February','2026-08-18',900],['March','2026-08-18',900],['April','2026-08-18',900]
  ]},
  { id: '26',     monthly: 0,    payments: [] }, // DHARAN SANJAY .D
  { id: '31',     monthly: 700,  payments: [['June','2026-07-22',700],['July','2026-07-22',700],['August','2026-09-17',700],['September','2026-09-17',700]] },
  { id: '30',     monthly: 850,  payments: [['June','2026-11-13',850],['July','2026-11-13',850],['August','2026-11-13',850],['September','2026-11-13',850],['October','2026-11-13',600]] },
  { id: '34',     monthly: 850,  payments: [['June','2026-07-24',850],['July','2026-07-24',850],['August','2026-08-31',850],['September','2026-09-16',850]] },
  { id: '43',     monthly: 900,  payments: [['June','2026-07-20',900],['July','2026-07-20',900],['August','2026-08-20',900],['September','2026-10-15',900],['October','2026-10-15',900]] },
  { id: '53',     monthly: 850,  payments: [['June','2026-09-24',850],['July','2026-09-24',850],['August','2026-09-24',850],['September','2026-09-24',850]] },
  { id: '36',     monthly: 850,  payments: [['June','2026-07-16',850],['July','2026-09-16',850],['August','2026-09-16',850]] },
  { id: '44',     monthly: 850,  payments: [['June','2026-08-18',850],['July','2026-10-14',850],['August','2026-10-14',850],['September','2026-10-14',850]] },
  { id: '22',     monthly: 850,  payments: [['June','2026-08-10',850],['July','2026-08-10',850],['August','2026-08-10',850]] },
  { id: '23',     monthly: 850,  payments: [['June','2026-08-05',850],['July','2026-08-05',850],['August','2026-08-05',850]] },
  { id: '28',     monthly: 850,  payments: [['June','2026-09-22',850],['July','2026-09-22',850],['August','2026-09-22',850],['September','2026-09-22',850]] },
  { id: '39',     monthly: 800,  payments: [['June','2026-09-18',800],['July','2026-09-18',800],['August','2026-09-18',800],['September','2026-09-18',800]] },
  { id: '57',     monthly: 850,  payments: [] }, // DHANSHIKA .D (rate only)
  { id: '54',     monthly: 850,  payments: [['June','2026-11-02',850],['July','2026-11-02',850],['August','2026-11-02',850],['September','2026-11-02',850],['October','2026-11-02',850],['November','2026-11-02',850]] },
  { id: '56',     monthly: 850,  payments: [['June','2026-09-24',850],['July','2026-09-24',850],['August','2026-11-05',850],['September','2026-11-05',850]] },
  { id: '60',     monthly: 850,  payments: [['June','2026-07-01',850],['July','2026-08-01',850],['August','2026-09-01',850],['September','2026-10-26',850],['October','2026-10-26',850]] },
  { id: '66',     monthly: 850,  payments: [['June','2026-08-05',850],['July','2026-09-08',850],['August','2026-09-08',850]] },
  { id: '71',     monthly: 900,  payments: [['June','2026-07-14',900],['July','2026-07-14',900],['August','2026-09-07',900],['September','2026-09-07',900]] },
  { id: '76',     monthly: 700,  payments: [['June','2026-08-07',700],['July','2026-08-07',700],['August','2026-08-07',700],['September','2026-10-14',700],['October','2026-10-14',700]] },
  { id: '68',     monthly: 900,  payments: [['June','2026-07-16',900],['July','2026-07-16',900],['August','2026-07-16',900]] },
  { id: '75',     monthly: 900,  payments: [['June','2026-08-05',900],['July','2026-08-05',900],['August','2026-09-18',900],['September','2026-09-18',900]] },
  { id: '72',     monthly: 900,  payments: [['June','2026-07-16',900],['July','2026-07-16',900],['August','2026-07-16',900],['September','2026-07-16',900],['October','2026-07-16',900],['November','2026-07-16',900]] },
  { id: '65',     monthly: 850,  payments: [['June','2026-08-21',850],['July','2026-08-21',850]] },
  { id: '70',     monthly: 850,  payments: [['June','2026-06-24',850],['July','2026-08-05',850],['August','2026-08-05',850],['September','2026-09-03',850],['October','2026-10-01',850],['November','2026-11-23',850]] },
  { id: 'UKG-56', monthly: 750,  payments: [['July','2026-09-11',750],['August','2026-09-11',750],['September','2026-09-11',750],['October','2026-11-11',750],['November','2026-11-11',750]] },
  { id: '25',     monthly: 850,  payments: [['July','2026-08-31',850],['August','2026-08-31',850]] },
  { id: '48',     monthly: 850,  payments: [['July','2026-10-09',850],['August','2026-10-09',850],['September','2026-10-09',850]] },

  // ================= PAGE 4: I STANDARD (22) =================
  { id: '77',     monthly: 850,  payments: [['June','2026-08-04',850],['July','2026-08-04',850],['August','2026-09-21',850],['September','2026-09-21',850]] },
  { id: '79',     monthly: 850,  payments: [['June','2026-07-13',850],['July','2026-07-13',850],['August','2026-09-09',800],['September','2026-09-09',800],['October','2026-11-27',800]] },
  { id: '81',     monthly: 850,  payments: [['June','2026-08-17',850],['July','2026-08-17',850],['August','2026-08-17',850]] },
  { id: '84',     monthly: 900,  payments: [['June','2026-07-01',900],['July','2026-07-20',900],['August','2026-08-21',900],['September','2026-09-21',900],['October','2026-10-16',900],['November','2026-11-19',900]] },
  { id: '80',     monthly: 900,  payments: [['June','2026-08-06',900],['July','2026-08-10',900]] },
  { id: '87',     monthly: 800,  payments: [['June','2026-07-01',750],['July','2026-10-05',800],['August','2026-10-05',800],['September','2026-10-05',800],['October','2026-11-03',800]] },
  { id: '86',     monthly: 900,  payments: [['June','2026-07-24',900],['July','2026-07-24',900],['August','2026-09-15',900]] },
  { id: '85',     monthly: 1000, payments: [['June','2026-07-15',1000],['July','2026-09-03',1000],['August','2026-11-05',1000]] },
  { id: '89',     monthly: 900,  payments: [['June','2026-07-16',900],['July','2026-07-16',900],['August','2026-07-16',900],['September','2026-07-16',900],['October','2026-07-16',900],['November','2026-07-16',900]] },
  { id: '88',     monthly: 900,  payments: [['June','2026-07-07',900],['July','2026-08-21',900],['August','2026-08-21',900],['September','2026-10-14',900]] },
  { id: '90',     monthly: 850,  payments: [] }, // YSWANTH .V (rate only)
  { id: '83',     monthly: 800,  payments: [['June','2026-07-22',800],['July','2026-07-22',800]] },
  { id: '91',     monthly: 850,  payments: [['June','2026-08-10',850],['July','2026-10-09',850],['August','2026-10-09',850],['September','2026-10-09',850]] },
  { id: '92',     monthly: 850,  payments: [['June','2026-09-08',850],['July','2026-09-08',850],['August','2026-09-08',850],['September','2026-09-08',850]] },
  { id: '97',     monthly: 900,  payments: [['June','2026-08-10',900],['July','2026-08-10',900],['August','2026-09-13',900],['September','2026-09-13',900],['October','2026-11-13',900],['November','2026-11-13',900]] },
  { id: '99',     monthly: 900,  payments: [['June','2026-08-14',900],['July','2026-08-14',900],['August','2026-10-08',900],['September','2026-10-08',900],['October','2026-11-18',900],['November','2026-11-18',900]] },
  { id: '94',     monthly: 850,  payments: [] }, // NARMATHA SRI .M (rate only)
  { id: '95',     monthly: 850,  payments: [['June','2026-07-14',850],['July','2026-07-14',850],['August','2026-08-05',850],['September','2026-10-20',850],['October','2026-10-22',850]] },
  { id: '96',     monthly: 900,  payments: [['June','2026-08-24',900],['July','2026-08-24',900],['August','2026-08-24',900],['September','2026-08-24',900]] },
  { id: '98',     monthly: 900,  payments: [['June','2026-07-24',900],['July','2026-07-24',900],['August','2026-09-15',900]] },
  { id: '100',    monthly: 900,  payments: [['June','2026-08-05',900],['July','2026-08-05',900],['August','2026-08-05',900]] },
  { id: '101',    monthly: 700,  payments: [['June','2026-11-26',700],['July','2026-11-26',700],['August','2026-11-26',700]] },

  // ================= PAGES 5 & 6: II STANDARD (35) =================
  { id: '102',    monthly: 0,    payments: [] }, // AKILAN .K
  { id: '103',    monthly: 1000, payments: [['June','2026-07-21',1000],['July','2026-09-10',1000],['August','2026-11-02',1000]] },
  { id: '104',    monthly: 800,  payments: [['June','2026-09-11',800],['July','2026-09-11',800],['August','2026-09-11',800],['September','2026-11-20',800]] },
  { id: '108',    monthly: 300,  payments: [['June','2026-11-10',300],['July','2026-11-10',300],['August','2026-11-10',300]] },
  { id: '109',    monthly: 900,  payments: [['June','2026-07-09',900],['July','2026-08-07',900],['August','2026-09-07',900],['September','2026-10-16',900],['October','2026-11-11',900]] },
  { id: '110',    monthly: 850,  payments: [['June','2026-09-10',850],['July','2026-09-10',850],['August','2026-09-10',850]] },
  { id: '111',    monthly: 850,  payments: [] }, // MORIS ROMAN .R (rate only)
  { id: '112',    monthly: 850,  payments: [['June','2026-07-09',850],['July','2026-07-09',850],['August','2026-09-16',850],['September','2026-09-16',850],['October','2026-11-11',850],['November','2026-11-11',850]] },
  { id: '113',    monthly: 800,  payments: [['June','2026-07-01',750],['July','2026-10-05',800],['August','2026-10-05',800],['September','2026-10-05',800],['October','2026-11-03',800]] },
  { id: '115',    monthly: 700,  payments: [['June','2026-06-05',700],['July','2026-06-05',700],['August','2026-06-05',700],['September','2026-11-11',700],['October','2026-11-11',700],['November','2026-11-11',700]] },
  { id: '116',    monthly: 850,  payments: [] }, // PRAKUL .S (rate only)
  { id: '117',    monthly: 850,  payments: [['June','2026-10-05',850],['July','2026-10-05',850],['August','2026-10-05',850],['September','2026-10-23',850]] },
  { id: '118',    monthly: 850,  payments: [['June','2026-06-28',850]] },
  { id: '121',    monthly: 850,  payments: [['June','2026-08-21',850],['July','2026-08-21',850],['August','2026-08-21',850],['September','2026-09-18',850],['October','2026-10-19',850]] },
  { id: '122',    monthly: 850,  payments: [['June','2026-05-21',850],['July','2026-07-24',850]] },
  { id: '119',    monthly: 850,  payments: [['June','2026-09-23',850],['July','2026-09-23',850],['August','2026-09-23',850],['September','2026-09-23',850]] },
  { id: '123',    monthly: 750,  payments: [['June','2026-07-20',750],['July','2026-08-20',750],['August','2026-08-20',750],['September','2026-09-15',375],['October','2026-11-03',375]] },
  { id: '124',    monthly: 450,  payments: [['June','2026-06-08',850],['July','2026-07-13',450],['August','2026-08-07',450],['September','2026-09-15',450],['October','2026-10-15',450]] },
  { id: '114',    monthly: 425,  payments: [['June','2026-09-18',425],['July','2026-09-18',425],['August','2026-09-18',425],['September','2026-09-28',425]] },
  { id: '125',    monthly: 850,  payments: [['June','2026-07-13',850],['July','2026-07-13',850],['August','2026-09-15',850],['September','2026-09-15',850]] },
  { id: '126',    monthly: 900,  payments: [['June','2026-06-05',900],['July','2026-08-05',900],['August','2026-08-05',900]] },
  { id: '127',    monthly: 900,  payments: [['June','2026-08-12',900],['July','2026-08-12',900],['August','2026-10-29',900],['September','2026-10-29',900],['October','2026-10-29',900]] },
  { id: '128',    monthly: 950,  payments: [['June','2026-08-25',950],['July','2026-06-25',950],['August','2026-10-05',950],['September','2026-10-05',950]] },
  { id: '130',    monthly: 350,  payments: [['June','2026-07-13',400],['July','2026-07-13',400],['August','2026-08-24',350],['September','2026-10-15',350],['October','2026-10-25',350],['November','2026-11-23',350]] },
  { id: '131',    monthly: 900,  payments: [['June','2026-06-01',900],['July','2026-07-01',900],['August','2026-08-01',900],['September','2026-09-01',900],['October','2026-10-01',900],['November','2026-11-01',900]] },
  { id: '132',    monthly: 750,  payments: [['June','2026-07-22',750],['July','2026-09-03',750],['August','2026-09-03',750],['September','2026-10-23',750],['October','2026-11-20',750]] },
  { id: '133',    monthly: 850,  payments: [['June','2026-07-13',850],['July','2026-10-01',850],['August','2026-10-23',850]] },
  { id: '134',    monthly: 850,  payments: [['June','2026-08-21',850],['July','2026-08-21',850],['August','2026-08-21',850]] },
  { id: '135',    monthly: 850,  payments: [['June','2026-09-16',850],['July','2026-09-16',850],['August','2026-09-16',850],['September','2026-09-16',850]] },
  { id: '136',    monthly: 700,  payments: [['June','2026-07-22',700],['July','2026-07-22',700],['August','2026-09-17',700],['September','2026-09-17',700]] },
  { id: '137',    monthly: 900,  payments: [['June','2026-07-24',900],['July','2026-07-24',900],['August','2026-09-15',900],['September','2026-09-15',900]] },
  { id: '138',    monthly: 800,  payments: [['June','2026-09-16',800],['July','2026-09-16',800],['August','2026-09-16',800]] },
  { id: '139',    monthly: 650,  payments: [['June','2026-07-14',650],['July','2026-08-25',650],['August','2026-08-25',650],['September','2026-11-17',650]] },
  { id: '140',    monthly: 750,  payments: [['June','2026-08-25',750],['July','2026-08-25',750],['August','2026-08-25',750],['September','2026-08-25',750],['October','2026-10-12',750],['November','2026-10-12',750]] },
  { id: '141',    monthly: 900,  payments: [['June','2026-05-22',900],['July','2026-07-20',900]] },

  // ================= PAGE 7: III STANDARD (20) =================
  { id: '142',    monthly: 0,    payments: [] }, // ARUN PRASANTH .R
  { id: '143',    monthly: 850,  payments: [['June','2026-08-03',850],['July','2026-08-03',850],['August','2026-11-12',850],['September','2026-11-12',850],['October','2026-11-12',850]] },
  { id: '145',    monthly: 900,  payments: [['June','2026-08-17',900],['July','2026-08-17',900],['August','2026-10-16',900],['September','2026-10-16',900]] },
  { id: '147',    monthly: 0,    payments: [] }, // MAXLIN .P
  { id: '148',    monthly: 850,  payments: [['June','2026-07-20',850],['July','2026-08-10',850],['August','2026-09-22',850],['September','2026-11-23',850],['October','2026-11-23',850]] },
  { id: '149',    monthly: 900,  payments: [['June','2026-07-20',900],['July','2026-07-20',900],['August','2026-09-15',900],['September','2026-09-15',900],['October','2026-10-14',900]] },
  { id: '150',    monthly: 1000, payments: [['June','2026-09-22',2000]] },
  { id: '151',    monthly: 850,  payments: [] }, // RUKESH .S (rate only)
  { id: '154',    monthly: 900,  payments: [['June','2026-08-24',900],['July','2026-08-24',900],['August','2026-11-05',900],['September','2026-11-05',900],['October','2026-11-05',900]] },
  { id: '155',    monthly: 850,  payments: [['June','2026-08-20',850],['July','2026-08-20',850],['August','2026-08-20',850]] },
  { id: '157',    monthly: 850,  payments: [['June','2026-09-10',850],['July','2026-09-10',850],['August','2026-09-10',850]] },
  { id: '158',    monthly: 850,  payments: [['June','2026-07-13',850],['July','2026-08-28',850],['August','2026-10-12',850]] },
  { id: '161',    monthly: 750,  payments: [['June','2026-09-03',750],['July','2026-09-03',750],['August','2026-09-03',750],['September','2026-09-03',750],['October','2026-09-03',750]] },
  { id: '160',    monthly: 850,  payments: [] }, // KANSHIKA .S (rate only)
  { id: '162',    monthly: 900,  payments: [['June','2026-07-14',900],['July','2026-07-14',900],['August','2026-09-01',900],['September','2026-09-01',900]] },
  { id: '163',    monthly: 950,  payments: [['June','2026-06-16',950],['July','2026-09-08',950],['August','2026-09-08',950],['September','2026-09-08',950]] },
  { id: '164',    monthly: 350,  payments: [['June','2026-08-04',350],['July','2026-08-04',350],['August','2026-09-15',350]] },
  { id: '165',    monthly: 350,  payments: [['June','2026-08-04',350],['July','2026-08-04',350],['August','2026-09-15',350]] },
  { id: '166',    monthly: 850,  payments: [['June','2026-08-04',800],['July','2026-09-10',850],['August','2026-09-10',850],['September','2026-09-10',850]] },
  { id: '153',    monthly: 450,  payments: [['July','2026-08-20',450],['August','2026-08-20',450],['September','2026-11-26',450],['October','2026-11-26',450],['November','2026-11-26',450]] },

  // ================= PAGE 8: IV STANDARD (20) =================
  { id: '167',    monthly: 500,  payments: [['September','2026-08-19',2000]] },
  { id: '168',    monthly: 450,  payments: [['June','2026-07-27',450],['July','2026-07-27',450],['August','2026-09-10',450],['September','2026-09-10',450]] },
  { id: '170',    monthly: 0,    payments: [] }, // PRAVEEN .R
  { id: '171',    monthly: 850,  payments: [['June','2026-07-16',850],['July','2026-08-05',850],['August','2026-08-05',850],['September','2026-09-03',850],['October','2026-10-08',850],['November','2026-11-03',850]] },
  { id: '173',    monthly: 750,  payments: [['June','2026-10-09',750],['July','2026-10-09',750],['August','2026-10-09',750],['September','2026-10-09',750]] },
  { id: '175',    monthly: 750,  payments: [['June','2026-08-04',750],['July','2026-08-04',750],['August','2026-10-14',750],['September','2026-10-14',750]] },
  { id: '176',    monthly: 850,  payments: [['June','2026-07-15',850],['July','2026-07-15',850],['August','2026-07-15',850],['September','2026-07-15',850],['October','2026-07-15',850]] },
  { id: '177',    monthly: 700,  payments: [['June','2026-11-26',700],['July','2026-11-26',700],['August','2026-11-26',700]] },
  { id: '178',    monthly: 850,  payments: [] }, // DHASHIKA .G / DHARSHIKA (rate only)
  { id: '181',    monthly: 850,  payments: [['June','2026-08-28',850]] },
  { id: '182',    monthly: 950,  payments: [['June','2026-07-24',950],['July','2026-07-24',950]] },
  { id: '183',    monthly: 850,  payments: [] }, // KALARANI .S (rate only)
  { id: '179',    monthly: 850,  payments: [] }, // KOWSHIKA .V / GOWSHIKA (rate only)
  { id: '184',    monthly: 900,  payments: [['June','2026-08-12',900],['July','2026-08-12',900],['August','2026-10-29',900],['September','2026-10-29',900],['October','2026-10-29',900]] },
  { id: '185',    monthly: 450,  payments: [['June','2026-06-08',850],['July','2026-07-13',450],['August','2026-08-07',450],['September','2026-09-17',450],['October','2026-10-15',450]] },
  { id: '186',    monthly: 850,  payments: [['June','2026-08-10',850],['July','2026-10-09',850],['August','2026-10-09',850],['September','2026-10-09',850]] },
  { id: '187',    monthly: 650,  payments: [['June','2026-11-05',650],['July','2026-11-05',650],['August','2026-11-05',650],['September','2026-11-26',650],['October','2026-11-26',650],['November','2026-11-26',650]] },
  { id: '189',    monthly: 400,  payments: [['June','2026-08-31',400],['July','2026-08-31',400],['August','2026-08-31',400],['September','2026-11-11',400],['October','2026-11-11',400],['November','2026-11-11',400]] },
  { id: '190',    monthly: 750,  payments: [['June','2026-09-18',750],['July','2026-09-18',750],['August','2026-11-24',750],['September','2026-11-24',750]] },
  { id: '191',    monthly: 850,  payments: [['June','2026-07-27',850],['July','2026-08-18',850],['August','2026-09-18',850],['September','2026-11-23',850]] },

  // ================= PAGE 9: V STANDARD (15) =================
  { id: '192',    monthly: 750,  payments: [['June','2026-11-11',700],['July','2026-11-11',700],['August','2026-11-11',700],['September','2026-11-12',750],['October','2026-11-12',750],['November','2026-11-12',750]] },
  { id: '193',    monthly: 850,  payments: [['June','2026-07-14',850],['July','2026-07-14',850],['August','2026-09-22',850],['September','2026-11-12',850],['October','2026-11-12',850]] },
  { id: '194',    monthly: 0,    payments: [] }, // NAVEEN KUMAR .R
  { id: '195',    monthly: 850,  payments: [['June','2026-07-21',800],['July','2026-07-21',800],['August','2026-09-18',850],['September','2026-09-18',850]] },
  { id: '197',    monthly: 850,  payments: [['June','2026-07-24',850],['July','2026-07-24',850],['August','2026-11-05',850],['September','2026-11-05',850],['October','2026-11-05',850],['November','2026-11-05',850],['December','2026-11-05',600]] },
  { id: '198',    monthly: 900,  payments: [['June','2026-07-20',900],['July','2026-07-20',900],['August','2026-09-15',900],['September','2026-09-15',900],['October','2026-10-14',900]] },
  { id: '199',    monthly: 850,  payments: [['June','2026-11-23',1000],['July','2026-11-23',800],['August','2026-11-23',850],['September','2026-11-23',850],['October','2026-11-23',1000]] },
  { id: '200',    monthly: 750,  payments: [['June','2026-07-22',750],['July','2026-09-03',750],['August','2026-09-03',750],['September','2026-10-23',750],['October','2026-11-23',750]] },
  { id: '201',    monthly: 850,  payments: [] }, // HARINI DEVI .K / HARANI DEVI (rate only)
  { id: '202',    monthly: 450,  payments: [['June','2026-09-18',450],['July','2026-09-18',450],['August','2026-09-18',450]] },
  { id: '204',    monthly: 900,  payments: [['June','2026-08-14',900],['July','2026-08-14',900],['August','2026-10-08',900],['September','2026-10-08',900],['October','2026-11-18',900],['November','2026-11-18',900]] },
  { id: '205',    monthly: 850,  payments: [] }, // NANTHINI .T (rate only)
  { id: '206',    monthly: 800,  payments: [['June','2026-08-03',800],['July','2026-08-03',800],['August','2026-11-16',800],['September','2026-11-16',800],['October','2026-11-16',800]] },
  { id: '207',    monthly: 850,  payments: [] }, // SATHANA .P (rate only)
  { id: '203',    monthly: 850,  payments: [['June','2026-08-03',850],['July','2026-08-03',850],['August','2026-11-12',850],['September','2026-11-12',850],['October','2026-11-12',850]] },

  // ================= PAGE 10: VI, VII, VIII STANDARD (11) =================
  // VI Standard
  { id: '209',    monthly: 900,  payments: [['June','2026-09-16',900],['July','2026-09-16',900],['August','2026-09-16',900]] },
  { id: '210',    monthly: 850,  payments: [['June','2026-09-09',850],['July','2026-09-09',850],['August','2026-09-09',850]] },
  { id: '211',    monthly: 900,  payments: [['June','2026-09-17',900],['July','2026-09-17',900],['August','2026-09-17',900]] },
  { id: '214',    monthly: 800,  payments: [['June','2026-05-21',800],['July','2026-05-21',800],['August','2026-05-21',800],['September','2026-07-21',800],['October','2026-07-21',800],['November','2026-10-05',800],['December','2026-10-05',800],['January','2026-10-05',800]] },
  // VII Standard
  { id: '215',    monthly: 0,    payments: [] }, // Jone prabhakaran .R
  { id: '216',    monthly: 0,    payments: [] }, // Madhan Kumar .K
  { id: '218',    monthly: 850,  payments: [['June','2026-07-24',850],['July','2026-07-24',850],['August','2026-11-05',850],['September','2026-11-05',850],['October','2026-11-05',850],['November','2026-11-05',850],['December','2026-11-05',600]] },
  { id: '220',    monthly: 1000, payments: [['June','2026-11-23',1000],['July','2026-11-23',1000],['August','2026-11-23',1000],['September','2026-11-23',1000],['October','2026-11-23',1000]] },
  // VIII Standard
  { id: '221',    monthly: 850,  payments: [['June','2026-07-24',850],['July','2026-07-24',850],['August','2026-11-05',850],['September','2026-11-05',850],['October','2026-11-05',850],['November','2026-11-05',850],['December','2026-11-05',600]] },
  { id: '222',    monthly: 850,  payments: [['June','2026-07-16',850],['July','2026-07-16',850],['August','2026-09-09',850],['September','2026-10-07',850],['October','2026-11-10',850]] },
  { id: '223',    monthly: 850,  payments: [['June','2026-07-14',850],['July','2026-07-14',850],['August','2026-09-22',850],['September','2026-11-12',850],['October','2026-11-12',850]] },
];

// 1. Reset transport fields on all students
db.students.forEach(s => {
  s.transportOpted = false;
  s.transportMonthlyFee = 0;
  s.transportFee = 0;
});

// 2. Remove ALL existing Transport / Van Fees payments (keep all school academic payments intact)
const keptPayments = db.payments.filter(p => !p.feeCategories || !p.feeCategories.includes('Transport / Van Fees'));
const removedVanCount = db.payments.length - keptPayments.length;

// 3. Apply PDF students & build new van fee receipts
let vSeq = 2001;
const newVanPayments = [];

pdfStudents.forEach(entry => {
  const s = db.students.find(st => st.id === entry.id);
  if (!s) {
    throw new Error(`Student not found in DB: id=${entry.id}`);
  }
  s.transportOpted = true;
  s.transportMonthlyFee = entry.monthly;
  s.transportFee = entry.annual !== undefined ? entry.annual : (entry.monthly > 0 ? entry.monthly * 11 : 0);

  entry.payments.forEach(([month, date, amount]) => {
    const receiptNo = `REC-2026-V${vSeq++}`;
    const yearLabel = ['January', 'February', 'March', 'April'].includes(month) ? '2027' : '2026';
    newVanPayments.push({
      receiptNo,
      studentId: s.id,
      studentName: s.name,
      grade: s.grade,
      date,
      term: `${month} Van Fee`,
      feeCategories: ['Transport / Van Fees'],
      amount,
      paymentMethod: 'Cash',
      transactionId: `VAN-${receiptNo}`,
      remarks: `Van fee for ${month} (Paid on ${date.substring(5)})`,
      receivedBy: 'School Transport Office',
      boardingArea: s.boardingArea || 'School Van Route',
      transportPaymentMode: 'Monthly',
      transportMonth: `${month} ${yearLabel}`,
      transportFee: amount,
      transportOpted: true
    });
  });
});

db.payments = [...keptPayments, ...newVanPayments];
db.payments.sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
fs.writeFileSync(seedPath, JSON.stringify(db.students, null, 2), 'utf8');

console.log(`PDF Students configured: ${pdfStudents.length}`);
console.log(`Removed old van payments: ${removedVanCount}`);
console.log(`Inserted new PDF van payments: ${newVanPayments.length}`);
console.log(`Total payments in DB: ${db.payments.length}`);
const totalVanCollected = newVanPayments.reduce((sum, p) => sum + p.amount, 0);
console.log(`Total Van Fees Collected: ₹${totalVanCollected.toLocaleString('en-IN')}`);
