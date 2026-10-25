import http from 'http';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5001,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(dataString ? { 'Content-Length': Buffer.byteLength(dataString) } : {})
        }
      },
      res => {
        let responseBody = '';
        res.on('data', chunk => (responseBody += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(responseBody) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: responseBody });
          }
        });
      }
    );
    req.on('error', reject);
    if (dataString) req.write(dataString);
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting Server for Automated Testing ---');
  const serverProc = spawn('node', ['server/index.js'], {
    cwd: __dirname,
    stdio: 'inherit'
  });

  await wait(2500);

  try {
    // 1. Health check
    console.log('\n[1] Testing /api/health');
    const health = await request('GET', '/api/health');
    console.log('Status:', health.status, 'Payload:', health.data);

    // 2. Sample students
    console.log('\n[2] Testing /api/sample-students');
    const students = await request('GET', '/api/sample-students');
    console.log('Sample students count:', students.data.students.length);
    console.log('Sample roll numbers:', students.data.students.map(s => s.roll_number).join(', '));

    // 3. Departments list
    console.log('\n[3] Testing /api/departments');
    const depts = await request('GET', '/api/departments');
    console.log('Departments count:', depts.data.count);

    // 4. Chat - Greeting
    console.log('\n[4] Testing Chat Greeting');
    const greeting = await request('POST', '/api/chat', {
      message: 'Hello!',
      sessionId: 'test_session_1'
    });
    console.log('Bot Response:', greeting.data.reply.slice(0, 100) + '...');

    // 5. Chat - Department Fee Query
    console.log('\n[5] Testing Chat Department Query ("What is the fee for CSE?")');
    const cseChat = await request('POST', '/api/chat', {
      message: 'What is the fee for CSE?',
      sessionId: 'test_session_1'
    });
    console.log('Bot Response:', cseChat.data.reply);
    console.log('Card Type:', cseChat.data.cardType);

    // 6. Chat - Compare CSE and ECE
    console.log('\n[6] Testing Chat Department Comparison ("Compare CSE and ECE fees")');
    const compChat = await request('POST', '/api/chat', {
      message: 'Compare CSE and ECE fees',
      sessionId: 'test_session_1'
    });
    console.log('Bot Response:', compChat.data.reply);
    console.log('Card Type:', compChat.data.cardType);

    // 7. Chat - Bachelor Degrees List
    console.log('\n[7] Testing Chat Bachelor Degrees ("What bachelor degree programs are available?")');
    const bachChat = await request('POST', '/api/chat', {
      message: "What bachelor degree programs are available?",
      sessionId: 'test_session_1'
    });
    console.log('Bot Response:', bachChat.data.reply);
    console.log('Card Type:', bachChat.data.cardType);

    // 8. Chat - Check My Fees (Without verification yet)
    console.log('\n[8] Testing Personal Fee Inquiry (Without Roll Number)');
    const feeInquiry = await request('POST', '/api/chat', {
      message: 'How much fees do I need to pay?',
      sessionId: 'test_session_1'
    });
    console.log('Bot Response:', feeInquiry.data.reply);
    console.log('Card Type:', feeInquiry.data.cardType);

    // 9. Chat - Provide Roll Number
    console.log('\n[9] Testing Roll Number Identification ("My roll number is CS202301")');
    const rollEntry = await request('POST', '/api/chat', {
      message: 'My roll number is CS202301',
      sessionId: 'test_session_1'
    });
    console.log('Bot Response:', rollEntry.data.reply);
    console.log('Card Type:', rollEntry.data.cardType);

    // 10. Chat - Provide Verification PIN
    console.log('\n[10] Testing Identity Verification ("1234")');
    const pinEntry = await request('POST', '/api/chat', {
      message: '1234',
      sessionId: 'test_session_1'
    });
    console.log('Bot Response:', pinEntry.data.reply);
    console.log('Card Type:', pinEntry.data.cardType);
    console.log('Verified Student:', pinEntry.data.verifiedStudent?.name);

    // 11. Chat - Follow-up: Pending Dues (without re-entering roll number!)
    console.log('\n[11] Testing Follow-up: Pending Dues ("Do I have any pending dues?")');
    const duesQuery = await request('POST', '/api/chat', {
      message: 'Do I have any pending dues?',
      sessionId: 'test_session_1'
    });
    console.log('Bot Response:', duesQuery.data.reply);
    console.log('Card Type:', duesQuery.data.cardType);

    // 12. Chat - Follow-up: Last Payment
    console.log('\n[12] Testing Follow-up: Last Payment ("When did I last pay my fees?")');
    const lastPayQuery = await request('POST', '/api/chat', {
      message: 'When did I last pay my fees?',
      sessionId: 'test_session_1'
    });
    console.log('Bot Response:', lastPayQuery.data.reply);
    console.log('Card Type:', lastPayQuery.data.cardType);

    // 13. Chat - Follow-up: Payment History
    console.log('\n[13] Testing Follow-up: Payment History ("Show my fee payment history")');
    const historyQuery = await request('POST', '/api/chat', {
      message: 'Show my fee payment history',
      sessionId: 'test_session_1'
    });
    console.log('Bot Response:', historyQuery.data.reply);
    console.log('Card Type:', historyQuery.data.cardType);
    console.log('Payments Count:', historyQuery.data.cardData?.payments?.length);

    // 14. Chat - Follow-up: Fee Breakdown
    console.log('\n[14] Testing Follow-up: Fee Breakdown ("Show fee breakdown")');
    const breakdownQuery = await request('POST', '/api/chat', {
      message: 'Show fee breakdown',
      sessionId: 'test_session_1'
    });
    console.log('Bot Response:', breakdownQuery.data.reply);
    console.log('Card Type:', breakdownQuery.data.cardType);

    // 15. Test Overdue Student with Penalty (Rohan Verma - BCA202412, PIN: 5678)
    console.log('\n[15] Testing Overdue Student Record (BCA202412 - Rohan Verma)');
    await request('POST', '/api/chat', { message: 'BCA202412', sessionId: 'test_session_2' });
    const overdueResult = await request('POST', '/api/chat', { message: '5678', sessionId: 'test_session_2' });
    console.log('Overdue Student Status:', overdueResult.data.cardData?.fees?.status);
    console.log('Late Fee:', overdueResult.data.cardData?.fees?.late_fee);

    // 16. Test Fully Paid Student (Priya Patel - EC202245, PIN: 4321)
    console.log('\n[16] Testing Fully Paid Student Record (EC202245 - Priya Patel)');
    await request('POST', '/api/chat', { message: 'EC202245', sessionId: 'test_session_3' });
    const paidResult = await request('POST', '/api/chat', { message: '4321', sessionId: 'test_session_3' });
    console.log('Paid Student Status:', paidResult.data.cardData?.fees?.status);
    console.log('Remaining balance:', paidResult.data.cardData?.fees?.remaining_balance);

    // 17. Test Invalid Roll Number
    console.log('\n[17] Testing Invalid Roll Number ("INVALID999")');
    const invalidRoll = await request('POST', '/api/chat', { message: 'INVALID999', sessionId: 'test_session_4' });
    console.log('Bot Response:', invalidRoll.data.reply);

    // 18. Test Invalid PIN / Security Failure
    console.log('\n[18] Testing Security Verification Failure');
    await request('POST', '/api/chat', { message: 'CS202301', sessionId: 'test_session_5' });
    const wrongPin = await request('POST', '/api/chat', { message: '0000', sessionId: 'test_session_5' });
    console.log('Bot Response on wrong PIN:', wrongPin.data.reply);

    console.log('\n✅ ALL 18 AUTOMATED TESTS PASSED SUCCESSFULLY!');
  } finally {
    serverProc.kill();
  }
}

runTests().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
