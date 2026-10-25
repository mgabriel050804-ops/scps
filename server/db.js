import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'database.sqlite');

let db = null;

// Initial sample data defining the College Fees records
const initialStudents = [
  {
    roll_number: 'CS202301',
    name: 'Aarav Sharma',
    department: 'Computer Science & Engineering',
    degree: 'B.Tech',
    academic_year: '2nd Year (Semester 4)',
    admission_batch: '2023-2027',
    dob: '2005-04-15',
    pin: '1234',
    email: 'aarav.sharma@apex.edu.in',
    phone: '+91 98765 43210'
  },
  {
    roll_number: 'EC202245',
    name: 'Priya Patel',
    department: 'Electronics & Communication Engineering',
    degree: 'B.Tech',
    academic_year: '3rd Year (Semester 5)',
    admission_batch: '2022-2026',
    dob: '2004-09-22',
    pin: '4321',
    email: 'priya.patel@apex.edu.in',
    phone: '+91 98123 45678'
  },
  {
    roll_number: 'BCA202412',
    name: 'Rohan Verma',
    department: 'Computer Applications',
    degree: 'BCA',
    academic_year: '1st Year (Semester 2)',
    admission_batch: '2024-2027',
    dob: '2006-01-18',
    pin: '5678',
    email: 'rohan.verma@apex.edu.in',
    phone: '+91 97234 56789'
  },
  {
    roll_number: 'BC202330',
    name: 'Ananya Iyer',
    department: 'Commerce & Accounting',
    degree: 'B.Com (Honors)',
    academic_year: '2nd Year (Semester 3)',
    admission_batch: '2023-2026',
    dob: '2005-11-03',
    pin: '8765',
    email: 'ananya.iyer@apex.edu.in',
    phone: '+91 96345 67890'
  },
  {
    roll_number: 'BBA202408',
    name: 'Kavya Deshmukh',
    department: 'Management Studies',
    degree: 'BBA',
    academic_year: '1st Year (Semester 1)',
    admission_batch: '2024-2027',
    dob: '2006-05-12',
    pin: '9988',
    email: 'kavya.d@apex.edu.in',
    phone: '+91 95456 78901'
  },
  {
    roll_number: 'BSC202319',
    name: 'Vikram Sengupta',
    department: 'Biotechnology & Life Sciences',
    degree: 'B.Sc (Biotechnology)',
    academic_year: '2nd Year (Semester 4)',
    admission_batch: '2023-2026',
    dob: '2005-08-30',
    pin: '1122',
    email: 'vikram.s@apex.edu.in',
    phone: '+91 94567 89012'
  }
];

const initialFees = [
  {
    roll_number: 'CS202301',
    total_course_fee: 500000,
    annual_fee: 125000,
    semester_fee: 62500,
    tuition_fee: 85000,
    other_fees: JSON.stringify({
      development_fee: 15000,
      lab_and_technology: 12000,
      examination_fee: 8000,
      library_and_digital_access: 3000,
      student_welfare_and_sports: 2000
    }),
    amount_paid: 75000,
    remaining_balance: 50000,
    payment_deadline: '2026-11-15',
    late_fee: 0,
    penalty_applicable: 0,
    status: 'PENDING'
  },
  {
    roll_number: 'EC202245',
    total_course_fee: 460000,
    annual_fee: 115000,
    semester_fee: 57500,
    tuition_fee: 80000,
    other_fees: JSON.stringify({
      development_fee: 12000,
      lab_and_technology: 11000,
      examination_fee: 7500,
      library_and_digital_access: 2500,
      student_welfare_and_sports: 2000
    }),
    amount_paid: 115000,
    remaining_balance: 0,
    payment_deadline: '2026-08-30',
    late_fee: 0,
    penalty_applicable: 0,
    status: 'FULLY_PAID'
  },
  {
    roll_number: 'BCA202412',
    total_course_fee: 225000,
    annual_fee: 75000,
    semester_fee: 37500,
    tuition_fee: 50000,
    other_fees: JSON.stringify({
      development_fee: 8000,
      computer_lab_fee: 7000,
      examination_fee: 5000,
      library_fee: 3000,
      sports_and_cultural: 2000
    }),
    amount_paid: 25000,
    remaining_balance: 50000,
    payment_deadline: '2026-09-30',
    late_fee: 2000,
    penalty_applicable: 1,
    status: 'OVERDUE'
  },
  {
    roll_number: 'BC202330',
    total_course_fee: 180000,
    annual_fee: 60000,
    semester_fee: 30000,
    tuition_fee: 42000,
    other_fees: JSON.stringify({
      development_fee: 6000,
      computer_accounting_lab: 4000,
      examination_fee: 4000,
      library_fee: 2500,
      student_activities: 1500
    }),
    amount_paid: 30000,
    remaining_balance: 30000,
    payment_deadline: '2026-12-05',
    late_fee: 0,
    penalty_applicable: 0,
    status: 'PENDING'
  },
  {
    roll_number: 'BBA202408',
    total_course_fee: 255000,
    annual_fee: 85000,
    semester_fee: 42500,
    tuition_fee: 60000,
    other_fees: JSON.stringify({
      industry_workshops_and_seminars: 10000,
      management_lab: 5000,
      examination_fee: 5000,
      library_and_cases: 3000,
      student_development: 2000
    }),
    amount_paid: 0,
    remaining_balance: 85000,
    payment_deadline: '2026-11-01',
    late_fee: 0,
    penalty_applicable: 0,
    status: 'PENDING'
  },
  {
    roll_number: 'BSC202319',
    total_course_fee: 210000,
    annual_fee: 70000,
    semester_fee: 35000,
    tuition_fee: 45000,
    other_fees: JSON.stringify({
      wet_lab_and_bio_consumables: 12000,
      development_fee: 5000,
      examination_fee: 4000,
      library_and_journals: 2500,
      student_sports_and_safety: 1500
    }),
    amount_paid: 50000,
    remaining_balance: 20000,
    payment_deadline: '2026-10-31',
    late_fee: 0,
    penalty_applicable: 0,
    status: 'PENDING'
  }
];

const initialPayments = [
  {
    roll_number: 'CS202301',
    transaction_id: 'TXN98241001',
    payment_date: '2026-07-20 11:24:10',
    amount_paid: 40000,
    payment_method: 'UPI (Google Pay)',
    payment_status: 'SUCCESS',
    receipt_no: 'REC-2026-CS-0412'
  },
  {
    roll_number: 'CS202301',
    transaction_id: 'TXN98243512',
    payment_date: '2026-08-15 14:10:45',
    amount_paid: 35000,
    payment_method: 'Net Banking (HDFC Bank)',
    payment_status: 'SUCCESS',
    receipt_no: 'REC-2026-CS-0889'
  },
  {
    roll_number: 'EC202245',
    transaction_id: 'TXN78210944',
    payment_date: '2026-07-10 09:45:00',
    amount_paid: 60000,
    payment_method: 'Credit Card (ICICI)',
    payment_status: 'SUCCESS',
    receipt_no: 'REC-2026-EC-0219'
  },
  {
    roll_number: 'EC202245',
    transaction_id: 'TXN78235490',
    payment_date: '2026-08-05 16:32:18',
    amount_paid: 55000,
    payment_method: 'UPI (PhonePe)',
    payment_status: 'SUCCESS',
    receipt_no: 'REC-2026-EC-0671'
  },
  {
    roll_number: 'BCA202412',
    transaction_id: 'TXN67219904',
    payment_date: '2026-06-15 10:15:30',
    amount_paid: 25000,
    payment_method: 'Debit Card (SBI)',
    payment_status: 'SUCCESS',
    receipt_no: 'REC-2026-BCA-0145'
  },
  {
    roll_number: 'BC202330',
    transaction_id: 'TXN55198273',
    payment_date: '2026-07-28 13:40:22',
    amount_paid: 30000,
    payment_method: 'Net Banking (SBI)',
    payment_status: 'SUCCESS',
    receipt_no: 'REC-2026-BC-0391'
  },
  {
    roll_number: 'BSC202319',
    transaction_id: 'TXN33890123',
    payment_date: '2026-07-14 17:05:11',
    amount_paid: 50000,
    payment_method: 'UPI (Paytm)',
    payment_status: 'SUCCESS',
    receipt_no: 'REC-2026-BSC-0522'
  }
];

const initialDepartmentFees = [
  {
    department_code: 'CSE',
    department_name: 'Computer Science & Engineering',
    degree_name: 'B.Tech',
    academic_year: '2024-2025',
    admission_batch: '2024-2028',
    duration_years: 4,
    annual_fee: 125000,
    semester_fee: 62500,
    tuition_fee: 85000,
    other_fees: JSON.stringify({
      development_fee: 15000,
      advanced_computing_lab: 12000,
      examination_fee: 8000,
      library_and_ieee_access: 3000,
      sports_and_cultural: 2000
    }),
    total_fee: 500000
  },
  {
    department_code: 'ECE',
    department_name: 'Electronics & Communication Engineering',
    degree_name: 'B.Tech',
    academic_year: '2024-2025',
    admission_batch: '2024-2028',
    duration_years: 4,
    annual_fee: 115000,
    semester_fee: 57500,
    tuition_fee: 80000,
    other_fees: JSON.stringify({
      development_fee: 12000,
      vlsi_and_iot_lab: 11000,
      examination_fee: 7500,
      library_fee: 2500,
      sports_and_cultural: 2000
    }),
    total_fee: 460000
  },
  {
    department_code: 'IT',
    department_name: 'Information Technology',
    degree_name: 'B.Tech',
    academic_year: '2024-2025',
    admission_batch: '2024-2028',
    duration_years: 4,
    annual_fee: 120000,
    semester_fee: 60000,
    tuition_fee: 82000,
    other_fees: JSON.stringify({
      development_fee: 14000,
      cloud_and_network_lab: 12000,
      examination_fee: 7500,
      library_fee: 2500,
      sports_and_cultural: 2000
    }),
    total_fee: 480000
  },
  {
    department_code: 'ME',
    department_name: 'Mechanical Engineering',
    degree_name: 'B.Tech',
    academic_year: '2024-2025',
    admission_batch: '2024-2028',
    duration_years: 4,
    annual_fee: 105000,
    semester_fee: 52500,
    tuition_fee: 75000,
    other_fees: JSON.stringify({
      workshop_and_cad_lab: 14000,
      development_fee: 8000,
      examination_fee: 5000,
      library_fee: 2000,
      sports_and_safety: 1000
    }),
    total_fee: 420000
  },
  {
    department_code: 'CE',
    department_name: 'Civil Engineering',
    degree_name: 'B.Tech',
    academic_year: '2024-2025',
    admission_batch: '2024-2028',
    duration_years: 4,
    annual_fee: 100000,
    semester_fee: 50000,
    tuition_fee: 70000,
    other_fees: JSON.stringify({
      surveying_and_materials_lab: 14000,
      development_fee: 8000,
      examination_fee: 5000,
      library_fee: 2000,
      sports_and_safety: 1000
    }),
    total_fee: 400000
  },
  {
    department_code: 'AI-DS',
    department_name: 'Artificial Intelligence & Data Science',
    degree_name: 'B.Tech',
    academic_year: '2024-2025',
    admission_batch: '2024-2028',
    duration_years: 4,
    annual_fee: 130000,
    semester_fee: 65000,
    tuition_fee: 90000,
    other_fees: JSON.stringify({
      gpu_and_cloud_compute_lab: 18000,
      development_fee: 12000,
      examination_fee: 6000,
      library_and_datasets: 2500,
      student_welfare: 1500
    }),
    total_fee: 520000
  },
  {
    department_code: 'BCA',
    department_name: 'Computer Applications',
    degree_name: 'BCA',
    academic_year: '2024-2025',
    admission_batch: '2024-2027',
    duration_years: 3,
    annual_fee: 75000,
    semester_fee: 37500,
    tuition_fee: 50000,
    other_fees: JSON.stringify({
      software_lab_fee: 10000,
      development_fee: 8000,
      examination_fee: 4000,
      library_fee: 2000,
      activities: 1000
    }),
    total_fee: 225000
  },
  {
    department_code: 'BBA',
    department_name: 'Management Studies',
    degree_name: 'BBA',
    academic_year: '2024-2025',
    admission_batch: '2024-2027',
    duration_years: 3,
    annual_fee: 85000,
    semester_fee: 42500,
    tuition_fee: 60000,
    other_fees: JSON.stringify({
      industry_tours_and_seminars: 12000,
      development_fee: 6000,
      examination_fee: 4000,
      library_and_hbr_cases: 2000,
      student_welfare: 1000
    }),
    total_fee: 255000
  },
  {
    department_code: 'BCOM',
    department_name: 'Commerce & Accounting',
    degree_name: 'B.Com (Honors)',
    academic_year: '2024-2025',
    admission_batch: '2024-2027',
    duration_years: 3,
    annual_fee: 60000,
    semester_fee: 30000,
    tuition_fee: 42000,
    other_fees: JSON.stringify({
      tally_and_accounting_lab: 6000,
      development_fee: 5000,
      examination_fee: 4000,
      library_fee: 2000,
      activities: 1000
    }),
    total_fee: 180000
  },
  {
    department_code: 'BSC-CS',
    department_name: 'Computer Science',
    degree_name: 'B.Sc (Computer Science)',
    academic_year: '2024-2025',
    admission_batch: '2024-2027',
    duration_years: 3,
    annual_fee: 65000,
    semester_fee: 32500,
    tuition_fee: 45000,
    other_fees: JSON.stringify({
      computing_lab: 8000,
      development_fee: 5000,
      examination_fee: 4000,
      library_fee: 2000,
      activities: 1000
    }),
    total_fee: 195000
  },
  {
    department_code: 'BSC-BIO',
    department_name: 'Biotechnology & Life Sciences',
    degree_name: 'B.Sc (Biotechnology)',
    academic_year: '2024-2025',
    admission_batch: '2024-2027',
    duration_years: 3,
    annual_fee: 70000,
    semester_fee: 35000,
    tuition_fee: 45000,
    other_fees: JSON.stringify({
      wet_lab_and_chemicals: 12000,
      development_fee: 6000,
      examination_fee: 4000,
      library_fee: 2000,
      activities: 1000
    }),
    total_fee: 210000
  },
  {
    department_code: 'BA-JMC',
    department_name: 'Journalism & Mass Communication',
    degree_name: 'BA',
    academic_year: '2024-2025',
    admission_batch: '2024-2027',
    duration_years: 3,
    annual_fee: 55000,
    semester_fee: 27500,
    tuition_fee: 38000,
    other_fees: JSON.stringify({
      media_studio_and_cameras: 8000,
      development_fee: 4000,
      examination_fee: 3000,
      library_fee: 1500,
      activities: 500
    }),
    total_fee: 165000
  },
  {
    department_code: 'BA-ECO',
    department_name: 'Economics',
    degree_name: 'BA',
    academic_year: '2024-2025',
    admission_batch: '2024-2027',
    duration_years: 3,
    annual_fee: 50000,
    semester_fee: 25000,
    tuition_fee: 35000,
    other_fees: JSON.stringify({
      data_analytics_lab: 5000,
      development_fee: 4000,
      examination_fee: 3500,
      library_fee: 2000,
      activities: 500
    }),
    total_fee: 150000
  }
];

// Helper to save sqlite db to disk
function saveDatabase() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Failed to persist database file:', err);
  }
}

// Convert SQL query result to array of objects
function queryAll(sql, params = []) {
  if (!db) return [];
  const stmt = db.prepare(sql);
  if (params && params.length > 0) {
    stmt.bind(params);
  }
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function initDatabase() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      db = new SQL.Database(fileBuffer);
      console.log('Loaded existing database from disk.');
      return db;
    } catch (e) {
      console.warn('Could not read existing database, re-creating schema and seed data.', e);
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
  }

  // Schema creation
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      roll_number TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      department TEXT NOT NULL,
      degree TEXT NOT NULL,
      academic_year TEXT NOT NULL,
      admission_batch TEXT NOT NULL,
      dob TEXT NOT NULL,
      pin TEXT NOT NULL,
      email TEXT,
      phone TEXT
    );

    CREATE TABLE IF NOT EXISTS fees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roll_number TEXT UNIQUE NOT NULL,
      total_course_fee INTEGER NOT NULL,
      annual_fee INTEGER NOT NULL,
      semester_fee INTEGER NOT NULL,
      tuition_fee INTEGER NOT NULL,
      other_fees TEXT NOT NULL,
      amount_paid INTEGER NOT NULL,
      remaining_balance INTEGER NOT NULL,
      payment_deadline TEXT NOT NULL,
      late_fee INTEGER DEFAULT 0,
      penalty_applicable INTEGER DEFAULT 0,
      status TEXT NOT NULL,
      FOREIGN KEY (roll_number) REFERENCES students (roll_number)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roll_number TEXT NOT NULL,
      transaction_id TEXT UNIQUE NOT NULL,
      payment_date TEXT NOT NULL,
      amount_paid INTEGER NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      receipt_no TEXT NOT NULL,
      FOREIGN KEY (roll_number) REFERENCES students (roll_number)
    );

    CREATE TABLE IF NOT EXISTS department_fees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      department_code TEXT UNIQUE NOT NULL,
      department_name TEXT NOT NULL,
      degree_name TEXT NOT NULL,
      academic_year TEXT NOT NULL,
      admission_batch TEXT NOT NULL,
      duration_years INTEGER NOT NULL,
      annual_fee INTEGER NOT NULL,
      semester_fee INTEGER NOT NULL,
      tuition_fee INTEGER NOT NULL,
      other_fees TEXT NOT NULL,
      total_fee INTEGER NOT NULL
    );
  `);

  // Seed students
  for (const s of initialStudents) {
    db.run(
      `INSERT OR REPLACE INTO students (roll_number, name, department, degree, academic_year, admission_batch, dob, pin, email, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.roll_number, s.name, s.department, s.degree, s.academic_year, s.admission_batch, s.dob, s.pin, s.email, s.phone]
    );
  }

  // Seed fees
  for (const f of initialFees) {
    db.run(
      `INSERT OR REPLACE INTO fees (roll_number, total_course_fee, annual_fee, semester_fee, tuition_fee, other_fees, amount_paid, remaining_balance, payment_deadline, late_fee, penalty_applicable, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [f.roll_number, f.total_course_fee, f.annual_fee, f.semester_fee, f.tuition_fee, f.other_fees, f.amount_paid, f.remaining_balance, f.payment_deadline, f.late_fee, f.penalty_applicable, f.status]
    );
  }

  // Seed payments
  for (const p of initialPayments) {
    db.run(
      `INSERT OR REPLACE INTO payments (roll_number, transaction_id, payment_date, amount_paid, payment_method, payment_status, receipt_no)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [p.roll_number, p.transaction_id, p.payment_date, p.amount_paid, p.payment_method, p.payment_status, p.receipt_no]
    );
  }

  // Seed department fees
  for (const d of initialDepartmentFees) {
    db.run(
      `INSERT OR REPLACE INTO department_fees (department_code, department_name, degree_name, academic_year, admission_batch, duration_years, annual_fee, semester_fee, tuition_fee, other_fees, total_fee)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [d.department_code, d.department_name, d.degree_name, d.academic_year, d.admission_batch, d.duration_years, d.annual_fee, d.semester_fee, d.tuition_fee, d.other_fees, d.total_fee]
    );
  }

  saveDatabase();
  console.log('Database initialized successfully with sample college fee records.');
  return db;
}

// Data Access Service Functions

export function getStudentByRoll(rollNumber) {
  if (!rollNumber) return null;
  const roll = rollNumber.trim().toUpperCase();
  return queryOne('SELECT * FROM students WHERE UPPER(roll_number) = ?', [roll]);
}

export function verifyStudentIdentity(rollNumber, secret) {
  if (!rollNumber || !secret) return { success: false, reason: 'Missing credentials' };
  const roll = rollNumber.trim().toUpperCase();
  const student = queryOne('SELECT * FROM students WHERE UPPER(roll_number) = ?', [roll]);
  if (!student) {
    return { success: false, reason: 'Student roll number not found' };
  }

  const cleanSecret = secret.trim().replace(/\//g, '-').toLowerCase();
  const cleanDob = student.dob.toLowerCase();
  const cleanPin = student.pin.toLowerCase();

  // Support match with PIN or DOB (YYYY-MM-DD or DD-MM-YYYY)
  const [y, m, d] = cleanDob.split('-');
  const dobAlternative = `${d}-${m}-${y}`;

  if (
    cleanSecret === cleanPin ||
    cleanSecret === cleanDob ||
    cleanSecret === dobAlternative
  ) {
    return { success: true, student };
  }

  return {
    success: false,
    reason: 'Security verification failed. Please check your PIN or Date of Birth.'
  };
}

export function getStudentFeeDetails(rollNumber) {
  if (!rollNumber) return null;
  const roll = rollNumber.trim().toUpperCase();
  const student = queryOne('SELECT * FROM students WHERE UPPER(roll_number) = ?', [roll]);
  if (!student) return null;

  const fee = queryOne('SELECT * FROM fees WHERE UPPER(roll_number) = ?', [roll]);
  if (!fee) return null;

  let otherFees = {};
  try {
    otherFees = JSON.parse(fee.other_fees);
  } catch (e) {
    otherFees = {};
  }

  // Calculate dynamic overdue status if applicable
  const today = new Date().toISOString().split('T')[0];
  let calculatedStatus = fee.status;
  let dynamicLateFee = fee.late_fee;

  if (fee.remaining_balance > 0 && today > fee.payment_deadline) {
    calculatedStatus = 'OVERDUE';
    if (dynamicLateFee === 0) {
      dynamicLateFee = 1500; // Standard late penalty
    }
  }

  return {
    student: {
      roll_number: student.roll_number,
      name: student.name,
      department: student.department,
      degree: student.degree,
      academic_year: student.academic_year,
      admission_batch: student.admission_batch,
      email: student.email,
      phone: student.phone
    },
    fees: {
      total_course_fee: fee.total_course_fee,
      annual_fee: fee.annual_fee,
      semester_fee: fee.semester_fee,
      tuition_fee: fee.tuition_fee,
      other_fees: otherFees,
      amount_paid: fee.amount_paid,
      remaining_balance: fee.remaining_balance,
      payment_deadline: fee.payment_deadline,
      late_fee: dynamicLateFee,
      total_due_with_late_fee: fee.remaining_balance + dynamicLateFee,
      penalty_applicable: fee.penalty_applicable || dynamicLateFee > 0 ? 1 : 0,
      status: calculatedStatus
    }
  };
}

export function getStudentPayments(rollNumber) {
  if (!rollNumber) return [];
  const roll = rollNumber.trim().toUpperCase();
  const payments = queryAll(
    'SELECT * FROM payments WHERE UPPER(roll_number) = ? ORDER BY payment_date DESC',
    [roll]
  );
  return payments;
}

export function getLastPayment(rollNumber) {
  const payments = getStudentPayments(rollNumber);
  return payments.length > 0 ? payments[0] : null;
}

export function getAllDepartmentFees() {
  const depts = queryAll('SELECT * FROM department_fees ORDER BY degree_name, annual_fee DESC');
  return depts.map(d => {
    let otherFees = {};
    try {
      otherFees = JSON.parse(d.other_fees);
    } catch (e) {}
    return { ...d, other_fees: otherFees };
  });
}

export function getDepartmentByQuery(searchTerm) {
  if (!searchTerm) return null;
  const term = searchTerm.trim().toLowerCase();
  const all = getAllDepartmentFees();

  // Exact code match
  const exactCode = all.find(d => d.department_code.toLowerCase() === term);
  if (exactCode) return exactCode;

  // Name or degree matching
  const match = all.find(d => 
    d.department_name.toLowerCase().includes(term) ||
    d.department_code.toLowerCase().includes(term) ||
    d.degree_name.toLowerCase().includes(term)
  );
  return match || null;
}

export function getDepartmentsByDegree(degreeTerm) {
  if (!degreeTerm) return [];
  const term = degreeTerm.trim().toLowerCase();
  const all = getAllDepartmentFees();
  return all.filter(d => 
    d.degree_name.toLowerCase().includes(term) ||
    d.department_code.toLowerCase().includes(term)
  );
}

export function getSampleStudents() {
  return initialStudents.map(s => ({
    roll_number: s.roll_number,
    name: s.name,
    department: s.department,
    degree: s.degree,
    pin: s.pin,
    dob: s.dob
  }));
}
