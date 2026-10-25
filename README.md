# 🎓 College Fees Management Chatbot
> **Apex Institute of Technology & Sciences — Student Financial Services**

A modern, intelligent, and user-friendly College Fees Management Chatbot interface designed specifically for students to check their fee balances, pending dues, payment deadlines, payment histories, downloadable official receipts, and department-wise undergraduate bachelor's degree fee schedules through natural conversation.

---

## 🌟 Key Features

### 1. 🔍 Check Fees by Roll Number (Direct Lookup)
* Students enter their college roll number (e.g., `CS202301`, `EC202245`, `BCA202412`).
* Fetches verified records instantly from the connected database without requiring a PIN.
* Displays Student Name, Roll Number, Department, Degree, Academic Year, Total Course Fee, Annual Fee, Amount Paid, and Remaining Balance.
* Displays a clear visual progress bar and friendly error messages for unlisted roll numbers.

### 2. ⏳ Check Pending Fees & Dues
* Understands natural language questions:
  * *"How much fees do I need to pay?"*
  * *"Do I have any pending fees?"*
  * *"What is my remaining fee balance?"*
  * *"What is my last date to pay fees?"*
* Clearly distinguishes **Paid**, **Pending**, and **Overdue** amounts:
  * **Fully Paid**: Celebratory confirmation with zero balance.
  * **Pending**: Outstanding amount, upcoming deadline, and confirmation of zero late fees.
  * **Overdue**: Immediate alert displaying the elapsed due date, statutory late penalty calculation, and total payable amount.

### 3. 📜 Payment History & Official Receipts
* Displays previous fee payments ordered with the most recent transaction first.
* Answers questions like:
  * *"When did I last pay my fees?"*
  * *"How much did I pay last time?"*
  * *"Show my fee payment history."*
* Shows Payment Date, Amount Paid, Payment Method (UPI, Net Banking, Credit/Debit Card), Transaction ID, and Receipt Number.
* Includes an interactive **"View / Print Receipt"** modal generating an official institutional payment voucher.
* Politely informs students when no transactions exist.

### 4. 🏛️ Department & Bachelor's Degree Fees
* General access without requiring authentication.
* Comprehensive catalog of **13 undergraduate programs** across **B.Tech, BCA, BBA, B.Com (Honors), B.Sc, and BA**:
  * **B.Tech**: Computer Science & Engineering (CSE), Electronics & Communication (ECE), Information Technology (IT), Mechanical Engineering (ME), Civil Engineering (CE), AI & Data Science (AI-DS)
  * **BCA**: Computer Applications (3 Years)
  * **BBA**: Bachelor of Business Administration (3 Years)
  * **B.Com**: Honors in Accounting & Finance (3 Years)
  * **B.Sc**: Computer Science, Biotechnology & Life Sciences (3 Years)
  * **BA**: Journalism & Mass Communication (JMC), Economics (3 Years)
* Answers department inquiries:
  * *"What is the B.Tech fee?"*
  * *"What is the fee for CSE?"*
  * *"Compare CSE and ECE fees."*
  * *"What is the total fee for BCA?"*
  * *"What is the first-year fee for B.Com?"*
* Displays Annual Fee, Semester Fee, Tuition Fee, Other fees breakdown, and Total Course Fee.
* **Side-by-Side Comparison Matrix**: Compares two programs side-by-side with annual and total variance calculations.

### 5. 🔒 Privacy & Security Authentication
* Roll numbers are treated as public identifiers, not proof of identity.
* Accessing personal dues and payment histories triggers an identity verification step:
  * Requires student's registered **4-digit PIN** or **Date of Birth (YYYY-MM-DD or DD/MM/YYYY)**.
* Maintains session context so follow-up questions do **not** force re-entering roll numbers.
* Easy 1-click **"Sign Out / Change Student"** button.

---

## 👥 Demo Student Profiles (For Testing)

| Student Name | Roll Number | Degree & Department | Status |
| :--- | :--- | :--- | :--- |
| **Aarav Sharma** | `CS202301` | B.Tech (CSE) - 2nd Year | ⏳ Dues Pending (₹50,000 due 15-Nov) |
| **Priya Patel** | `EC202245` | B.Tech (ECE) - 3rd Year | ✅ Fully Paid (₹0 Due) |
| **Rohan Verma** | `BCA202412` | BCA - 1st Year | ⚠️ Overdue (₹50,000 + ₹2,000 late fee) |
| **Ananya Iyer** | `BC202330` | B.Com (Honors) - 2nd Year | ⏳ Dues Pending (₹30,000 due 05-Dec) |
| **Kavya Deshmukh** | `BBA202408` | BBA - 1st Year | ⏳ Pending (No payments yet) |
| **Vikram Sengupta** | `BSC202319` | B.Sc (Biotech) - 2nd Year | ⏳ Urgent Due (₹20,000 due 31-Oct) |

*(Note: The chatbot interface also features a collapsible **"Quick Test Profiles"** bar at the bottom for instant 1-click test population!)*

---

## 🛠️ Technology Architecture

* **Frontend**:
  * React 18
  * Vite
  * Tailwind CSS (Custom College Theme: Navy/Royal Blue `#1e40af`, Slate, Emerald, Amber, Rose)
  * Lucide Icons
  * Canvas-Confetti (celebratory triggers for zero dues)
  * Web Speech API (Text-to-speech option)
* **Backend**:
  * Node.js & Express
  * SQL.js (WebAssembly SQLite engine with automated disk persistence to `server/database.sqlite`)
  * Conversational Natural Language Intent Engine (`server/nlp.js`)
  * Deterministic Source-of-Truth database queries (Zero hallucination of fee amounts)

---

## 🚀 How to Run the Application

### 1. Development Mode (with Live Hot-Reloading)
```bash
# From project directory:
pnpm run dev
```
* Backend API: `http://localhost:5001`
* Frontend App: `http://localhost:5173` (proxies `/api` to port 5001)

### 2. Production Server (Single Port Delivery)
```bash
# Build production bundle:
pnpm run build

# Start the unified server:
pnpm start
```
* App & API available at: `http://localhost:5001`

---

## 🧪 Automated Testing
A complete unit and intent test suite is included:
```bash
node test-unit.js
```
Runs 35 automated checks covering:
* Database seeds and table schemas
* Fee balance and late penalty calculations
* Payment records and receipt numbers
* Privacy and PIN authentication
* All NLP intents, comparisons, follow-up memory, and error handling.
