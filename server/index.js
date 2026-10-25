import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  initDatabase,
  getStudentFeeDetails,
  verifyStudentIdentity,
  getStudentPayments,
  getAllDepartmentFees,
  getSampleStudents
} from './db.js';
import { processUserMessage, clearSession } from './nlp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Initialize SQLite database
await initDatabase();

// API Routes

// Main Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default-session' } = req.body;
    if (!message && typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const response = await processUserMessage(message, sessionId);
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...response
    });
  } catch (error) {
    console.error('Chat processing error:', error);
    res.status(500).json({
      success: false,
      reply: 'An internal error occurred while retrieving fee details. Please try again.',
      error: error.message
    });
  }
});

// Clear / Reset session
app.post('/api/reset-session', (req, res) => {
  const { sessionId = 'default-session' } = req.body;
  clearSession(sessionId);
  res.json({ success: true, message: 'Session reset successfully' });
});

// Student Verification Endpoint
app.post('/api/verify', (req, res) => {
  try {
    const { rollNumber, secret } = req.body;
    if (!rollNumber || !secret) {
      return res.status(400).json({ success: false, message: 'Roll number and secret PIN/DOB are required' });
    }

    const result = verifyStudentIdentity(rollNumber, secret);
    if (!result.success) {
      return res.status(401).json({ success: false, message: result.reason });
    }

    const feeDetails = getStudentFeeDetails(rollNumber);
    res.json({
      success: true,
      message: 'Verification successful',
      student: feeDetails.student,
      fees: feeDetails.fees
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ success: false, message: 'Verification service error' });
  }
});

// Student Fee Details Lookup (with optional check)
app.get('/api/student/:roll', (req, res) => {
  try {
    const { roll } = req.params;
    const details = getStudentFeeDetails(roll);
    if (!details) {
      return res.status(404).json({ success: false, message: 'Student roll number not found' });
    }
    res.json({ success: true, ...details });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Student Payment History
app.get('/api/student/:roll/payments', (req, res) => {
  try {
    const { roll } = req.params;
    const payments = getStudentPayments(roll);
    res.json({ success: true, count: payments.length, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// All Department Fees
app.get('/api/departments', (req, res) => {
  try {
    const departments = getAllDepartmentFees();
    res.json({ success: true, count: departments.length, departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Sample students for UI quick-test helper
app.get('/api/sample-students', (req, res) => {
  res.json({
    success: true,
    students: getSampleStudents()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', service: 'College Fees Chatbot API', timestamp: new Date().toISOString() });
});

// Production static file serving
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send('Application build not found. Run "pnpm run build" first.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`College Fees Chatbot backend running on http://localhost:${PORT}`);
});
