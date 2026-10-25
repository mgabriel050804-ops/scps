import {
  initDatabase,
  getStudentByRoll,
  verifyStudentIdentity,
  getStudentFeeDetails,
  getStudentPayments,
  getLastPayment,
  getAllDepartmentFees,
  getDepartmentByQuery,
  getSampleStudents
} from './server/db.js';

import {
  processUserMessage,
  clearSession
} from './server/nlp.js';

async function runUnitTests() {
  console.log('=== Starting College Fees Assistant Unit & Intent Test Suite ===\n');

  // Initialize DB
  await initDatabase();

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Database seed checks
  console.log('--- 1. Database Verification ---');
  const sampleStudents = getSampleStudents();
  assert(sampleStudents.length === 6, `Found ${sampleStudents.length} sample students (expected 6)`);

  const departments = getAllDepartmentFees();
  assert(departments.length === 13, `Found ${departments.length} department fee records (expected 13)`);

  const cseDept = getDepartmentByQuery('CSE');
  assert(cseDept && cseDept.annual_fee === 125000, `CSE annual fee is ₹1,25,000 (actual: ${cseDept?.annual_fee})`);

  // 2. Student Lookup & Details
  console.log('\n--- 2. Student Fee Details Verification ---');
  const aaravDetails = getStudentFeeDetails('CS202301');
  assert(aaravDetails !== null, 'Aarav Sharma (CS202301) fee details found');
  assert(aaravDetails.fees.annual_fee === 125000, `Aarav annual fee = 125000 (actual: ${aaravDetails.fees.annual_fee})`);
  assert(aaravDetails.fees.amount_paid === 75000, `Aarav amount paid = 75000 (actual: ${aaravDetails.fees.amount_paid})`);
  assert(aaravDetails.fees.remaining_balance === 50000, `Aarav remaining balance = 50000 (actual: ${aaravDetails.fees.remaining_balance})`);
  assert(aaravDetails.fees.status === 'PENDING', `Aarav status = PENDING (actual: ${aaravDetails.fees.status})`);

  // 3. Payments Check
  console.log('\n--- 3. Payments & Receipts Verification ---');
  const aaravPayments = getStudentPayments('CS202301');
  assert(aaravPayments.length === 2, `Aarav has 2 payments recorded (actual: ${aaravPayments.length})`);
  const lastPayment = getLastPayment('CS202301');
  assert(lastPayment.transaction_id === 'TXN98243512', `Most recent payment is TXN98243512 (actual: ${lastPayment.transaction_id})`);
  assert(lastPayment.amount_paid === 35000, `Most recent payment amount = 35000 (actual: ${lastPayment.amount_paid})`);

  // 4. Fully Paid & Overdue scenarios
  console.log('\n--- 4. Diverse Payment Status Scenarios ---');
  const priyaDetails = getStudentFeeDetails('EC202245');
  assert(priyaDetails.fees.status === 'FULLY_PAID', `Priya status = FULLY_PAID (actual: ${priyaDetails.fees.status})`);
  assert(priyaDetails.fees.remaining_balance === 0, `Priya remaining = 0 (actual: ${priyaDetails.fees.remaining_balance})`);

  const rohanDetails = getStudentFeeDetails('BCA202412');
  assert(rohanDetails.fees.status === 'OVERDUE', `Rohan status = OVERDUE (actual: ${rohanDetails.fees.status})`);
  assert(rohanDetails.fees.late_fee > 0, `Rohan late penalty applied: ₹${rohanDetails.fees.late_fee}`);

  // 5. Identity Verification
  console.log('\n--- 5. Security & Privacy Authentication ---');
  const correctAuth = verifyStudentIdentity('CS202301', '1234');
  assert(correctAuth.success === true, 'Aarav verified with correct PIN (1234)');

  const dobAuth = verifyStudentIdentity('CS202301', '2005-04-15');
  assert(dobAuth.success === true, 'Aarav verified with DOB (2005-04-15)');

  const wrongAuth = verifyStudentIdentity('CS202301', '9999');
  assert(wrongAuth.success === false, 'Verification rejected with incorrect PIN (9999)');

  // 6. Conversational NLP Tests
  console.log('\n--- 6. Conversational NLP & Intent Engine ---');
  const session1 = 'test_sess_nlp_1';
  clearSession(session1);

  // Greeting
  const greetRes = await processUserMessage('Hello!', session1);
  assert(greetRes.reply.includes('College Fees Assistant'), 'Welcome message displayed');

  // Department inquiries
  const deptRes = await processUserMessage('What is the fee for CSE?', session1);
  assert(deptRes.cardType === 'DEPARTMENT_FEE', 'CSE query returned DEPARTMENT_FEE card');
  assert(deptRes.cardData.dept.annual_fee === 125000, 'CSE annual fee correctly retrieved as ₹1,25,000');

  // Department comparison
  const compRes = await processUserMessage('Compare CSE and ECE fees', session1);
  assert(compRes.cardType === 'DEPARTMENT_COMPARISON', 'Comparison query returned DEPARTMENT_COMPARISON card');
  assert(compRes.cardData.dept1 && compRes.cardData.dept2, 'Both departments identified in comparison');

  // Bachelor degrees catalog
  const allDegRes = await processUserMessage('What bachelor degree programs are available?', session1);
  assert(allDegRes.cardType === 'ALL_DEGREES_CATALOG', 'Catalog query returned ALL_DEGREES_CATALOG');

  // Personal inquiry without roll number
  const duesNoRoll = await processUserMessage('Do I have any pending dues?', session1);
  assert(duesNoRoll.cardType === 'ROLL_NUMBER_REQUIRED', 'Personal question without roll number prompted for roll number');

  // Enter roll number directly (no PIN required)
  const rollRes = await processUserMessage('My roll number is CS202301', session1);
  assert(rollRes.verifiedStudent?.name === 'Aarav Sharma', 'Direct roll lookup established session for Aarav without PIN');
  assert(rollRes.cardType === 'PENDING_DUES', 'Auto-resolved previous pending intent (PENDING_DUES) directly');

  // Follow-up 1: Last payment (WITHOUT re-entering roll number!)
  const lastPayRes = await processUserMessage('When did I last pay my fees?', session1);
  assert(lastPayRes.cardType === 'LAST_PAYMENT', 'Follow-up query for last payment succeeded without asking roll number');
  assert(lastPayRes.cardData.lastPayment.transaction_id === 'TXN98243512', 'Correct last payment transaction returned');

  // Follow-up 2: Payment History
  const historyRes = await processUserMessage('Show my fee payment history', session1);
  assert(historyRes.cardType === 'PAYMENT_HISTORY', 'Follow-up query for payment history returned PAYMENT_HISTORY card');
  assert(historyRes.cardData.payments.length === 2, 'Returned all 2 past payment records');

  // Follow-up 3: Fee Breakdown
  const breakdownRes = await processUserMessage('Show fee breakdown', session1);
  assert(breakdownRes.cardType === 'FEE_BREAKDOWN', 'Follow-up query returned FEE_BREAKDOWN card');

  // Logout / Switch student
  const logoutRes = await processUserMessage('switch student', session1);
  assert(logoutRes.verifiedStudent === null, 'Session cleared and student logged out');

  // Invalid roll number
  const invalidRes = await processUserMessage('Check fees for INVALID007', session1);
  assert(invalidRes.reply.includes('could not find any student record'), 'Friendly error message displayed for invalid roll number');

  console.log(`\n========================================`);
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runUnitTests().catch(e => {
  console.error('Test execution failed:', e);
  process.exit(1);
});
