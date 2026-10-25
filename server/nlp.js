import {
  getStudentByRoll,
  verifyStudentIdentity,
  getStudentFeeDetails,
  getStudentPayments,
  getLastPayment,
  getAllDepartmentFees,
  getDepartmentByQuery,
  getDepartmentsByDegree
} from './db.js';

// In-memory session store: sessionId -> { verifiedRoll: string, pendingRoll: string, pendingIntent: string, lastContext: string }
const sessions = new Map();

export function getSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      verifiedRoll: null,
      pendingRoll: null,
      pendingIntent: null,
      lastContext: null,
      history: []
    });
  }
  return sessions.get(sessionId);
}

export function clearSession(sessionId) {
  if (sessions.has(sessionId)) {
    sessions.set(sessionId, {
      verifiedRoll: null,
      pendingRoll: null,
      pendingIntent: null,
      lastContext: null,
      history: []
    });
  }
  return { success: true };
}

// Format currency
export function formatINR(val) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
}

// Format date
export function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

// Roll number regex: matches patterns like CS202301, EC202245, BCA202412, BC202330, BBA202408, BSC202319, INVALID007, etc.
const ROLL_REGEX = /\b([A-Za-z]{2,10}\d{3,8})\b/i;

// PIN or DOB regex
const PIN_REGEX = /\b(\d{4})\b/;
const DOB_REGEX = /\b(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{4})\b/;

// Main processing logic
export async function processUserMessage(rawText, sessionId) {
  const text = (rawText || '').trim();
  const lower = text.toLowerCase();
  const session = getSession(sessionId);

  // 1. Session reset / Logout
  if (
    lower === 'logout' ||
    lower === 'log out' ||
    lower.includes('switch student') ||
    lower.includes('reset session') ||
    lower.includes('change student') ||
    lower.includes('check another roll')
  ) {
    session.verifiedRoll = null;
    session.pendingRoll = null;
    session.pendingIntent = null;
    return {
      reply: "Session cleared. You have been logged out. How can I help you? You can check general department fees or enter another roll number to view personal records.",
      quickReplies: ['Check My Fees', 'Department-Wise Fees', "Bachelor's Degree Fees", 'Compare CSE vs ECE'],
      verifiedStudent: null
    };
  }

  // 2. Greetings
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|greetings)\b/i.test(lower)) {
    const isAuth = !!session.verifiedRoll;
    let authGreeting = "";
    if (isAuth) {
      const student = getStudentByRoll(session.verifiedRoll);
      authGreeting = ` You are currently viewing records for **${student?.name}** (${session.verifiedRoll}).`;
    }
    return {
      reply: `Hello! Welcome to the **College Fees Assistant**. I can help you check your fee balance, pending dues, payment history, and department-wise fees.${authGreeting}\n\nHow can I help you today?`,
      quickReplies: isAuth 
        ? ['Check My Fees', 'Check Pending Dues', 'Last Payment Details', 'View Payment History', 'Department-Wise Fees']
        : ['Check My Fees', 'Check Pending Dues', 'Last Payment Details', 'Department-Wise Fees', "Bachelor's Degree Fees"],
      verifiedStudent: isAuth ? getStudentFeeDetails(session.verifiedRoll)?.student : null
    };
  }

  // 3. Help / FAQs
  if (lower === 'help' || lower.includes('what can you do') || lower.includes('how does this work')) {
    return {
      reply: `Here is what I can assist you with:\n\n` +
        `• **Check Personal Fees**: View your annual tuition, amount paid, and remaining balance.\n` +
        `• **Pending Dues & Deadlines**: Check outstanding dues, payment due dates, and late penalties.\n` +
        `• **Payment History & Receipts**: Review past transactions, payment modes, and last payment details.\n` +
        `• **Department & Bachelor's Fees**: Explore undergraduate fees for B.Tech (CSE, ECE, IT, Mechanical, Civil, AI-DS), BCA, BBA, B.Com, B.Sc, BA, etc.\n` +
        `• **Compare Program Fees**: Compare tuition and total costs between different courses (e.g. *Compare CSE and ECE fees*).\n\n` +
        `What would you like to explore?`,
      quickReplies: ['Check My Fees', 'Department-Wise Fees', 'Compare CSE and ECE', 'Last Payment Details'],
      verifiedStudent: session.verifiedRoll ? getStudentFeeDetails(session.verifiedRoll)?.student : null
    };
  }

  // 4. Check for department comparison query (e.g., "compare CSE and ECE fees", "difference between B.Tech CSE and BCA")
  if (lower.includes('compare') || lower.includes('vs') || lower.includes('difference between')) {
    const compResult = handleDepartmentComparison(text);
    if (compResult) return compResult;
  }

  // 6. Check for bachelor degrees list / all department fees
  if (
    lower.includes("bachelor's degree") ||
    lower.includes('bachelor degree') ||
    lower.includes('all degrees') ||
    lower.includes('all departments') ||
    lower.includes('list of programs') ||
    lower.includes('department-wise fees') ||
    lower.includes('undergraduate programs') ||
    lower.includes('ug programs')
  ) {
    return handleAllDegrees();
  }

  // 7. Check for specific department/degree inquiry (e.g., "B.Tech fee", "CSE fee", "fee for BCA", "B.Com fee", "mechanical fee")
  const deptQueryMatch = detectDepartmentQuery(text);
  if (deptQueryMatch) {
    return handleDepartmentQuery(deptQueryMatch, text);
  }

  // 7. Extract Roll Number from text if explicitly provided
  const rollMatch = text.match(ROLL_REGEX);
  let extractedRoll = rollMatch ? rollMatch[1].toUpperCase() : null;

  // Verify if extracted roll number actually matches a student
  if (extractedRoll) {
    const student = getStudentByRoll(extractedRoll);
    if (!student) {
      return {
        reply: `I could not find any student record with roll number **${extractedRoll}** in the college database. Please double-check your roll number and try again.`,
        quickReplies: ['Check My Fees', 'Department-Wise Fees', 'Help']
      };
    }

    // Set verified roll number directly in session (no PIN required)
    session.verifiedRoll = extractedRoll;
    session.pendingRoll = null;
    const intent = detectPersonalIntent(text) || session.pendingIntent || 'CHECK_FEES';
    session.pendingIntent = null;
    return executePersonalIntent(intent, extractedRoll);
  }

  // 9. Personal Fee Inquiries (Check Fees, Pending Dues, Last Payment, History, Breakdown)
  const personalIntent = detectPersonalIntent(text);
  if (personalIntent) {
    // If user is already verified in this session
    if (session.verifiedRoll) {
      return executePersonalIntent(personalIntent, session.verifiedRoll);
    } else {
      // Need roll number first
      session.pendingIntent = personalIntent;
      return {
        reply: `To view your ${getIntentHumanName(personalIntent)}, I need your college roll number.\n\nPlease enter your **Roll Number** (for example: \`CS202301\` or \`BCA202412\`).`,
        cardType: 'ROLL_NUMBER_REQUIRED',
        quickReplies: ['CS202301', 'EC202245', 'BCA202412', 'BC202330']
      };
    }
  }

  // 10. Unknown / Fallback
  return {
    reply: `I didn't quite catch that. I am here to help with all college fee inquiries.\n\nYou can ask me:\n` +
      `• *"Check my fees"* or *"Do I have any pending dues?"*\n` +
      `• *"When did I last pay my fees?"* or *"Show payment history"*\n` +
      `• *"What is the B.Tech CSE fee?"* or *"Compare CSE and ECE fees"*\n` +
      `• Or enter your roll number directly to check your balance!`,
    quickReplies: ['Check My Fees', 'Check Pending Dues', 'View Payment History', 'Department-Wise Fees', 'Compare CSE vs ECE'],
    verifiedStudent: session.verifiedRoll ? getStudentFeeDetails(session.verifiedRoll)?.student : null
  };
}

function getIntentHumanName(intent) {
  switch (intent) {
    case 'CHECK_FEES': return 'fee balance and summary';
    case 'PENDING_DUES': return 'pending dues and payment deadline';
    case 'LAST_PAYMENT': return 'last fee payment details';
    case 'PAYMENT_HISTORY': return 'fee payment history';
    case 'FEE_BREAKDOWN': return 'detailed fee breakdown';
    default: return 'fee information';
  }
}

function detectPersonalIntent(text) {
  const lower = text.toLowerCase();

  // Last payment
  if (
    lower.includes('last pay') ||
    lower.includes('last payment') ||
    lower.includes('paid last time') ||
    lower.includes('recent payment') ||
    lower.includes('previous payment')
  ) {
    return 'LAST_PAYMENT';
  }

  // Payment history
  if (
    lower.includes('payment history') ||
    lower.includes('previous payments') ||
    lower.includes('all payments') ||
    lower.includes('transactions') ||
    lower.includes('transaction history') ||
    lower.includes('receipts')
  ) {
    return 'PAYMENT_HISTORY';
  }

  // Pending dues / deadlines
  if (
    lower.includes('pending') ||
    lower.includes('dues') ||
    lower.includes('remaining') ||
    lower.includes('need to pay') ||
    lower.includes('last date') ||
    lower.includes('deadline') ||
    lower.includes('penalty') ||
    lower.includes('late fee') ||
    lower.includes('balance')
  ) {
    return 'PENDING_DUES';
  }

  // Breakdown
  if (
    lower.includes('breakdown') ||
    lower.includes('itemized') ||
    lower.includes('tuition fee') ||
    lower.includes('lab fee') ||
    lower.includes('components')
  ) {
    return 'FEE_BREAKDOWN';
  }

  // General check fees
  if (
    lower.includes('check my fees') ||
    lower.includes('check fee') ||
    lower.includes('my fee') ||
    lower.includes('fee details') ||
    lower.includes('fee status') ||
    lower.includes('view fees') ||
    lower === 'fees'
  ) {
    return 'CHECK_FEES';
  }

  return null;
}

// Executes an authorized personal intent
function executePersonalIntent(intent, rollNumber, prefixMessage = '') {
  const details = getStudentFeeDetails(rollNumber);
  if (!details) {
    return {
      reply: `${prefixMessage ? prefixMessage + '\n\n' : ''}We could not locate fee records for roll number **${rollNumber}**. Please reach out to the college finance office.`,
      quickReplies: ['Check Another Roll', 'Department-Wise Fees']
    };
  }

  const { student, fees } = details;
  const isFullyPaid = fees.status === 'FULLY_PAID';
  const isOverdue = fees.status === 'OVERDUE';

  switch (intent) {
    case 'PENDING_DUES': {
      let statusDesc = '';
      if (isFullyPaid) {
        statusDesc = `Great news! You have **no pending dues**. Your fees are fully paid for the academic year.`;
      } else if (isOverdue) {
        statusDesc = `⚠️ **Payment Overdue!** Your pending fee balance is **${formatINR(fees.remaining_balance)}**. Since the due date (${formatDate(fees.payment_deadline)}) has passed, a late penalty of **${formatINR(fees.late_fee)}** applies, making your total outstanding due **${formatINR(fees.total_due_with_late_fee)}**.`;
      } else {
        statusDesc = `Your pending fee balance is **${formatINR(fees.remaining_balance)}**. Please ensure payment is completed by the deadline: **${formatDate(fees.payment_deadline)}**. No late penalty currently applies.`;
      }

      return {
        reply: `${prefixMessage ? prefixMessage + '\n\n' : ''}Here are your pending dues and payment deadline details:\n\n${statusDesc}`,
        cardType: 'PENDING_DUES',
        cardData: {
          student,
          fees
        },
        quickReplies: ['View Fee Breakdown', 'View Payment History', 'Last Payment Details', 'Log Out'],
        verifiedStudent: student
      };
    }

    case 'LAST_PAYMENT': {
      const lastPayment = getLastPayment(rollNumber);
      if (!lastPayment) {
        return {
          reply: `${prefixMessage ? prefixMessage + '\n\n' : ''}No payment records were found for **${student.name}** (${student.roll_number}). Your total pending balance is **${formatINR(fees.remaining_balance)}**.`,
          cardType: 'NO_PAYMENT_FOUND',
          cardData: { student, fees },
          quickReplies: ['Check Pending Dues', 'View Fee Breakdown', 'Log Out'],
          verifiedStudent: student
        };
      }

      return {
        reply: `${prefixMessage ? prefixMessage + '\n\n' : ''}Here are details of your most recent fee payment:\n\n` +
          `• **Amount Paid:** ${formatINR(lastPayment.amount_paid)}\n` +
          `• **Payment Date:** ${formatDate(lastPayment.payment_date)}\n` +
          `• **Payment Method:** ${lastPayment.payment_method}\n` +
          `• **Transaction ID:** \`${lastPayment.transaction_id}\`\n` +
          `• **Receipt No:** \`${lastPayment.receipt_no}\`\n` +
          `• **Status:** ${lastPayment.payment_status} ✅`,
        cardType: 'LAST_PAYMENT',
        cardData: {
          student,
          lastPayment,
          remaining_balance: fees.remaining_balance
        },
        quickReplies: ['View Full Payment History', 'Check Pending Dues', 'Fee Breakdown', 'Log Out'],
        verifiedStudent: student
      };
    }

    case 'PAYMENT_HISTORY': {
      const payments = getStudentPayments(rollNumber);
      if (payments.length === 0) {
        return {
          reply: `${prefixMessage ? prefixMessage + '\n\n' : ''}There are no previous payment transactions recorded for roll number **${rollNumber}**.`,
          cardType: 'NO_PAYMENT_FOUND',
          cardData: { student, fees },
          quickReplies: ['Check My Fees', 'Pending Dues', 'Log Out'],
          verifiedStudent: student
        };
      }

      return {
        reply: `${prefixMessage ? prefixMessage + '\n\n' : ''}Here is your complete fee payment history (${payments.length} transaction${payments.length > 1 ? 's' : ''}):`,
        cardType: 'PAYMENT_HISTORY',
        cardData: {
          student,
          payments,
          total_paid: fees.amount_paid,
          remaining_balance: fees.remaining_balance
        },
        quickReplies: ['Check Pending Dues', 'View Fee Breakdown', 'Last Payment Details', 'Log Out'],
        verifiedStudent: student
      };
    }

    case 'FEE_BREAKDOWN': {
      return {
        reply: `${prefixMessage ? prefixMessage + '\n\n' : ''}Here is the itemized fee breakdown for **${student.name}** (${student.degree} - ${student.department}, ${student.academic_year}):`,
        cardType: 'FEE_BREAKDOWN',
        cardData: {
          student,
          fees
        },
        quickReplies: ['Check Pending Dues', 'View Payment History', 'Last Payment Details', 'Log Out'],
        verifiedStudent: student
      };
    }

    case 'CHECK_FEES':
    default: {
      return {
        reply: `${prefixMessage ? prefixMessage + '\n\n' : ''}Here is your current fee status summary for **${student.name}**:\n\n` +
          `• **Roll Number:** ${student.roll_number}\n` +
          `• **Program:** ${student.degree} - ${student.department}\n` +
          `• **Academic Year:** ${student.academic_year} (Batch ${student.admission_batch})\n` +
          `• **Annual Fee:** ${formatINR(fees.annual_fee)}\n` +
          `• **Amount Paid:** ${formatINR(fees.amount_paid)}\n` +
          `• **Remaining Balance:** ${formatINR(fees.remaining_balance)} ` +
          (isFullyPaid ? '*(Paid in full 🎉)*' : isOverdue ? '*(Overdue ⚠️)*' : `*(Due by ${formatDate(fees.payment_deadline)})*`),
        cardType: 'FEE_SUMMARY',
        cardData: {
          student,
          fees
        },
        quickReplies: ['View Fee Breakdown', 'Check Pending Dues', 'View Payment History', 'Last Payment Details', 'Log Out'],
        verifiedStudent: student
      };
    }
  }
}

// Detect department or degree query
function detectDepartmentQuery(text) {
  const lower = text.toLowerCase();
  
  // Specific department codes
  if (/\b(cse|computer science & engineering|computer science and engineering)\b/i.test(lower)) return 'CSE';
  if (/\b(ece|electronics & communication|electronics and communication)\b/i.test(lower)) return 'ECE';
  if (/\b(it|information technology)\b/i.test(lower)) return 'IT';
  if (/\b(mechanical|mech|me)\b/i.test(lower)) return 'ME';
  if (/\b(civil|ce)\b/i.test(lower)) return 'CE';
  if (/\b(ai-ds|ai & data science|artificial intelligence|data science)\b/i.test(lower)) return 'AI-DS';
  if (/\b(bca|computer applications)\b/i.test(lower)) return 'BCA';
  if (/\b(bba|business administration|management)\b/i.test(lower)) return 'BBA';
  if (/\b(b\.?com|commerce|accounting)\b/i.test(lower)) return 'BCOM';
  if (/\b(b\.?sc\s*computer|bsc\s*cs)\b/i.test(lower)) return 'BSC-CS';
  if (/\b(b\.?sc\s*bio|biotechnology|life sciences)\b/i.test(lower)) return 'BSC-BIO';
  if (/\b(b\.?sc|bsc)\b/i.test(lower)) return 'BSC-CS';
  if (/\b(ba\s*journalism|journalism|mass communication|media)\b/i.test(lower)) return 'BA-JMC';
  if (/\b(ba\s*economics|economics)\b/i.test(lower)) return 'BA-ECO';
  if (/\b(b\.?tech|engineering)\b/i.test(lower)) return 'BTECH';
  if (/\b(ba)\b/i.test(lower)) return 'BA-JMC';

  return null;
}

function handleDepartmentQuery(deptCode, text) {
  // If general B.Tech requested
  if (deptCode === 'BTECH') {
    const btechDepts = getDepartmentsByDegree('B.Tech');
    return {
      reply: `The college offers **B.Tech (4-Year Bachelor of Technology)** in multiple engineering disciplines. Here are the annual fee details for each branch:`,
      cardType: 'DEGREE_LIST',
      cardData: {
        degree_name: 'B.Tech',
        duration_years: 4,
        departments: btechDepts
      },
      quickReplies: ['Compare CSE and ECE', 'BCA Fees', 'BBA Fees', 'B.Com Fees', 'Check My Fees']
    };
  }

  const dept = getDepartmentByQuery(deptCode);
  if (!dept) {
    return {
      reply: `Fee details for the requested program are currently unavailable in the database. Please contact the admissions office for official notification.`,
      quickReplies: ['Department-Wise Fees', "Bachelor's Degree Fees", 'Check My Fees']
    };
  }

  return {
    reply: `Here are the official fee details for **${dept.degree_name} in ${dept.department_name}** (${dept.academic_year}, Batch ${dept.admission_batch}):\n\n` +
      `• **Annual Fee:** ${formatINR(dept.annual_fee)}\n` +
      `• **Semester Fee:** ${formatINR(dept.semester_fee)}\n` +
      `• **Tuition Fee:** ${formatINR(dept.tuition_fee)}\n` +
      `• **Duration:** ${dept.duration_years} Years\n` +
      `• **Total Course Fee:** ${formatINR(dept.total_fee)}`,
    cardType: 'DEPARTMENT_FEE',
    cardData: {
      dept
    },
    quickReplies: [
      `Compare ${dept.department_code} and ECE`,
      'Bachelor\'s Degree Fees',
      'Check My Fees',
      'Department-Wise Fees'
    ]
  };
}

function handleDepartmentComparison(text) {
  const lower = text.toLowerCase();
  const allDepts = getAllDepartmentFees();

  let matchedDepts = [];

  // Match codes or department keywords
  for (const d of allDepts) {
    const codeRegex = new RegExp(`\\b${d.department_code}\\b`, 'i');
    const nameWords = d.department_name.toLowerCase().split(' ');
    
    if (codeRegex.test(lower) || lower.includes(d.department_code.toLowerCase())) {
      if (!matchedDepts.some(m => m.department_code === d.department_code)) {
        matchedDepts.push(d);
      }
    } else if (nameWords.some(w => w.length > 3 && lower.includes(w))) {
      if (!matchedDepts.some(m => m.department_code === d.department_code)) {
        matchedDepts.push(d);
      }
    }
  }

  // Handle common comparisons if less than 2 matched
  if (matchedDepts.length < 2) {
    if (lower.includes('cse') && lower.includes('ece')) {
      matchedDepts = [getDepartmentByQuery('CSE'), getDepartmentByQuery('ECE')].filter(Boolean);
    } else if (lower.includes('cse') && lower.includes('it')) {
      matchedDepts = [getDepartmentByQuery('CSE'), getDepartmentByQuery('IT')].filter(Boolean);
    } else if (lower.includes('bca') && lower.includes('cse')) {
      matchedDepts = [getDepartmentByQuery('CSE'), getDepartmentByQuery('BCA')].filter(Boolean);
    } else if (lower.includes('bba') && lower.includes('bcom')) {
      matchedDepts = [getDepartmentByQuery('BBA'), getDepartmentByQuery('BCOM')].filter(Boolean);
    }
  }

  if (matchedDepts.length >= 2) {
    const d1 = matchedDepts[0];
    const d2 = matchedDepts[1];
    const diffAnnual = Math.abs(d1.annual_fee - d2.annual_fee);
    const diffTotal = Math.abs(d1.total_fee - d2.total_fee);
    const higherDept = d1.annual_fee > d2.annual_fee ? d1.department_code : d2.department_code;

    return {
      reply: `Here is the fee comparison between **${d1.department_code} (${d1.degree_name})** and **${d2.department_code} (${d2.degree_name})**:\n\n` +
        `• **${d1.department_code} Annual Fee:** ${formatINR(d1.annual_fee)} (Total ${d1.duration_years} yrs: ${formatINR(d1.total_fee)})\n` +
        `• **${d2.department_code} Annual Fee:** ${formatINR(d2.annual_fee)} (Total ${d2.duration_years} yrs: ${formatINR(d2.total_fee)})\n` +
        `• **Annual Difference:** ${formatINR(diffAnnual)} (${higherDept} is higher)\n` +
        `• **Total Difference:** ${formatINR(diffTotal)} over the full course duration.`,
      cardType: 'DEPARTMENT_COMPARISON',
      cardData: {
        dept1: d1,
        dept2: d2,
        diffAnnual,
        diffTotal
      },
      quickReplies: ['Bachelor\'s Degree Fees', 'Check My Fees', 'Compare CSE vs IT']
    };
  }

  return null;
}

function handleAllDegrees() {
  const allDepts = getAllDepartmentFees();
  
  // Group by degree
  const degrees = {};
  for (const d of allDepts) {
    if (!degrees[d.degree_name]) {
      degrees[d.degree_name] = [];
    }
    degrees[d.degree_name].push(d);
  }

  return {
    reply: `Here is the official fee schedule for all available **Undergraduate (Bachelor's Degree)** programs at Apex College:\n\n` +
      `We offer **B.Tech, BCA, BBA, B.Com (Honors), B.Sc, and BA** programs across 13 departments. Click any program below or ask for specific details or comparisons.`,
    cardType: 'ALL_DEGREES_CATALOG',
    cardData: {
      degrees,
      totalPrograms: allDepts.length
    },
    quickReplies: ['B.Tech CSE Fee', 'BCA Fees', 'BBA Fees', 'Compare CSE and ECE', 'Check My Fees']
  };
}
