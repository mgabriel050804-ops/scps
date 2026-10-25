import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  ArrowRight,
  TrendingUp,
  FileText,
  CreditCard,
  Building,
  GraduationCap,
  Calendar,
  Lock,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

const formatINR = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val || 0);
};

// 1. Fee Summary Card
export function FeeSummaryCard({ student, fees, onActionClick }) {
  const isFullyPaid = fees?.status === 'FULLY_PAID';
  const isOverdue = fees?.status === 'OVERDUE';
  const percentPaid = fees?.annual_fee > 0 ? Math.round((fees.amount_paid / fees.annual_fee) * 100) : 0;

  return (
    <div className="mt-3 bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
      {/* Top Banner with Student identity */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-4 text-white">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 bg-white/10 px-2 py-0.5 rounded-full">
              Official Student Record
            </span>
            <h3 className="text-base font-bold mt-1 text-white">{student?.name}</h3>
            <p className="text-xs text-blue-100 flex items-center gap-1.5 mt-0.5">
              <span>{student?.degree} ({student?.department})</span>
              <span>•</span>
              <span className="font-mono bg-blue-800/60 px-1.5 py-0.2 rounded">{student?.roll_number}</span>
            </p>
          </div>
          <div className="text-right">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                isFullyPaid
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  : isOverdue
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
              }`}
            >
              {isFullyPaid ? '● Fully Paid' : isOverdue ? '● Overdue' : '● Dues Pending'}
            </span>
            <div className="text-[11px] text-blue-200 mt-1">{student?.academic_year}</div>
          </div>
        </div>
      </div>

      {/* Main Figures Grid */}
      <div className="p-4 grid grid-cols-3 gap-3 border-b border-slate-100 bg-slate-50/50">
        <div>
          <span className="text-[11px] text-slate-500 font-medium block">Total Annual Fee</span>
          <span className="text-sm sm:text-base font-bold text-slate-900">
            {formatINR(fees?.annual_fee)}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-emerald-600 font-medium block">Amount Paid</span>
          <span className="text-sm sm:text-base font-bold text-emerald-600">
            {formatINR(fees?.amount_paid)}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 font-medium block">Remaining Due</span>
          <span className={`text-sm sm:text-base font-bold ${fees?.remaining_balance > 0 ? (isOverdue ? 'text-rose-600' : 'text-amber-600') : 'text-emerald-600'}`}>
            {formatINR(fees?.remaining_balance)}
          </span>
        </div>
      </div>

      {/* Payment Progress Bar */}
      <div className="px-4 py-3 bg-white">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-500 font-medium">Payment Clearance</span>
          <span className="font-bold text-slate-700">{percentPaid}% Completed</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              isFullyPaid ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500' : 'bg-blue-600'
            }`}
            style={{ width: `${Math.min(percentPaid, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center mt-2 text-[11px] text-slate-500">
          <span>Total 4-Year Course Fee: <strong>{formatINR(fees?.total_course_fee)}</strong></span>
          <span>Due Date: <strong>{fees?.payment_deadline}</strong></span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
        <button
          onClick={() => onActionClick('View Fee Breakdown')}
          className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-medium transition flex items-center gap-1"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Fee Breakdown</span>
        </button>
        <button
          onClick={() => onActionClick('Check Pending Dues')}
          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-medium transition flex items-center gap-1"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Dues</span>
        </button>
        <button
          onClick={() => onActionClick('View Payment History')}
          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-medium transition flex items-center gap-1"
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Payment History</span>
        </button>
      </div>
    </div>
  );
}

// 2. Pending Dues Card
export function PendingDuesCard({ student, fees, onActionClick }) {
  const isFullyPaid = fees?.status === 'FULLY_PAID';
  const isOverdue = fees?.status === 'OVERDUE';

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  React.useEffect(() => {
    if (isFullyPaid) {
      triggerConfetti();
    }
  }, [isFullyPaid]);

  return (
    <div className="mt-3 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header status */}
      <div className={`p-4 border-b ${
        isFullyPaid 
          ? 'bg-emerald-50 border-emerald-100 text-emerald-900' 
          : isOverdue 
          ? 'bg-rose-50 border-rose-100 text-rose-900' 
          : 'bg-amber-50 border-amber-100 text-amber-900'
      }`}>
        <div className="flex items-center gap-2.5">
          {isFullyPaid ? (
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          ) : isOverdue ? (
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          )}
          <div>
            <h4 className="text-sm font-bold leading-tight">
              {isFullyPaid
                ? 'All Dues Cleared!'
                : isOverdue
                ? 'Overdue Notice: Payment Deadline Expired'
                : 'Pending Dues Notice'}
            </h4>
            <p className="text-xs opacity-80">
              Student: {student?.name} ({student?.roll_number})
            </p>
          </div>
        </div>
      </div>

      {/* Main Details */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-baseline py-1 border-b border-slate-100">
          <span className="text-xs text-slate-500">Remaining Tuition & Fee Dues</span>
          <span className="text-lg font-extrabold text-slate-900">
            {formatINR(fees?.remaining_balance)}
          </span>
        </div>

        {fees?.late_fee > 0 && (
          <div className="flex justify-between items-baseline py-1 border-b border-rose-100 bg-rose-50/50 px-2 rounded-lg">
            <span className="text-xs font-medium text-rose-700 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              Late Fee Penalty (Overdue)
            </span>
            <span className="text-sm font-bold text-rose-700">
              +{formatINR(fees?.late_fee)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-baseline py-1.5 border-b border-slate-100 font-bold">
          <span className="text-xs text-slate-700">Total Net Amount Payable</span>
          <span className={`text-xl ${isOverdue ? 'text-rose-700' : 'text-slate-900'}`}>
            {formatINR(fees?.total_due_with_late_fee || fees?.remaining_balance)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Payment Deadline</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              {fees?.payment_deadline}
            </span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Late Penalty Status</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">
              {fees?.late_fee > 0 ? `Applied (${formatINR(fees.late_fee)})` : 'None (Pay before due date)'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-500">
          Payment modes: Net Banking, UPI, Cards, Demand Draft
        </span>
        <button
          onClick={() => onActionClick('View Payment History')}
          className="text-xs text-blue-700 hover:text-blue-800 font-semibold flex items-center gap-1"
        >
          <span>Payment History</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// 3. Fee Breakdown Card
export function FeeBreakdownCard({ student, fees, onActionClick }) {
  const otherFees = fees?.other_fees || {};
  const items = [
    { label: 'Annual Tuition Fee', amount: fees?.tuition_fee || 0 },
    ...Object.entries(otherFees).map(([k, v]) => ({
      label: k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      amount: v
    }))
  ];

  const total = fees?.annual_fee || items.reduce((a, b) => a + b.amount, 0);

  return (
    <div className="mt-3 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-slate-900 text-white p-3.5 px-4 flex justify-between items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">
            Itemized Fee Structure
          </span>
          <h4 className="text-sm font-bold">{student?.degree} - {student?.department}</h4>
        </div>
        <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-slate-200">
          {student?.academic_year}
        </span>
      </div>

      <div className="p-4 space-y-2.5 text-xs">
        {items.map((item, idx) => {
          const pct = total > 0 ? Math.round((item.amount / total) * 100) : 0;
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-medium">{item.label}</span>
                <span className="font-bold text-slate-900">{formatINR(item.amount)}</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-1.5 rounded-full"
                  style={{ width: `${pct}%` }}
                ></div>
              </div>
            </div>
          );
        })}

        <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-bold text-slate-900">
          <span>Total Annual Payable Fee</span>
          <span className="text-base text-blue-700">{formatINR(total)}</span>
        </div>
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs">
        <span className="text-slate-500">Amount Paid so far: <strong className="text-emerald-700">{formatINR(fees?.amount_paid)}</strong></span>
        <button
          onClick={() => onActionClick('Check Pending Dues')}
          className="text-blue-700 hover:underline font-semibold"
        >
          Check Dues →
        </button>
      </div>
    </div>
  );
}

// 4. Last Payment Card
export function LastPaymentCard({ student, lastPayment, remaining_balance, onOpenReceipt }) {
  if (!lastPayment) return null;

  return (
    <div className="mt-3 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex justify-between items-start">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 bg-white/10 px-2 py-0.5 rounded-full">
            Most Recent Payment
          </span>
          <h4 className="text-xl font-extrabold mt-1 text-white">
            {formatINR(lastPayment.amount_paid)}
          </h4>
          <p className="text-xs text-emerald-100 mt-0.5">
            Paid on {lastPayment.payment_date}
          </p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs px-2.5 py-0.5 rounded-full font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            {lastPayment.payment_status}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-2 text-xs">
        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500">Transaction ID:</span>
          <span className="font-mono font-bold text-slate-800">{lastPayment.transaction_id}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500">Payment Gateway / Mode:</span>
          <span className="font-medium text-slate-800">{lastPayment.payment_method}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500">Receipt Voucher:</span>
          <span className="font-mono text-blue-700 font-semibold">{lastPayment.receipt_no}</span>
        </div>
        <div className="flex justify-between py-1 pt-2">
          <span className="text-slate-500">Current Outstanding Balance:</span>
          <span className="font-bold text-slate-800">{formatINR(remaining_balance)}</span>
        </div>
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
        <button
          onClick={() => onOpenReceipt({ student, payment: lastPayment })}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>View / Print Receipt</span>
        </button>
      </div>
    </div>
  );
}

// 5. Payment History Card
export function PaymentHistoryCard({ student, payments, total_paid, remaining_balance, onOpenReceipt }) {
  return (
    <div className="mt-3 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-slate-900 text-white p-3.5 px-4 flex justify-between items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">
            Payment Transaction History
          </span>
          <h4 className="text-sm font-bold">{student?.name} ({student?.roll_number})</h4>
        </div>
        <span className="text-xs font-medium text-emerald-400 bg-white/10 px-2 py-0.5 rounded">
          {payments.length} Transaction{payments.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
        {payments.map((p, idx) => (
          <div key={idx} className="p-3.5 hover:bg-slate-50/80 transition flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{formatINR(p.amount_paid)}</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {p.payment_status}
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">
                {p.payment_method} • {p.payment_date}
              </p>
              <p className="text-slate-400 font-mono text-[10px]">
                Ref: {p.transaction_id}
              </p>
            </div>
            <button
              onClick={() => onOpenReceipt({ student, payment: p })}
              className="px-2.5 py-1 text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-lg text-xs font-medium flex items-center gap-1 transition"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Receipt</span>
            </button>
          </div>
        ))}
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs">
        <span className="text-slate-600">Total Paid: <strong className="text-emerald-700">{formatINR(total_paid)}</strong></span>
        <span className="text-slate-600">Remaining Due: <strong className="text-rose-700">{formatINR(remaining_balance)}</strong></span>
      </div>
    </div>
  );
}

// 6. Department Fee Card
export function DepartmentFeeCard({ dept, onActionClick }) {
  const otherFees = dept?.other_fees || {};

  return (
    <div className="mt-3 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white p-4">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 bg-white/10 px-2 py-0.5 rounded-full">
              {dept.degree_name} Program
            </span>
            <h4 className="text-base font-bold mt-1 text-white">{dept.department_name}</h4>
            <p className="text-xs text-blue-100">
              Department Code: <strong className="font-mono">{dept.department_code}</strong> • {dept.duration_years} Years Course
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 grid grid-cols-3 gap-2 bg-slate-50 border-b border-slate-100 text-center">
        <div>
          <span className="text-[11px] text-slate-500 block">Annual Fee</span>
          <span className="text-sm font-bold text-slate-900">{formatINR(dept.annual_fee)}</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 block">Semester Fee</span>
          <span className="text-sm font-bold text-blue-700">{formatINR(dept.semester_fee)}</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 block">Total ({dept.duration_years} Yrs)</span>
          <span className="text-sm font-bold text-slate-900">{formatINR(dept.total_fee)}</span>
        </div>
      </div>

      <div className="p-4 space-y-2 text-xs">
        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] block">
          Breakdown of Annual Components
        </span>
        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-600">Base Tuition Fee</span>
          <span className="font-semibold text-slate-800">{formatINR(dept.tuition_fee)}</span>
        </div>
        {Object.entries(otherFees).map(([key, val]) => (
          <div key={key} className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-600 capitalize">{key.replace(/_/g, ' ')}</span>
            <span className="font-semibold text-slate-800">{formatINR(val)}</span>
          </div>
        ))}
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
        <button
          onClick={() => onActionClick(`Compare ${dept.department_code} and ECE`)}
          className="text-blue-700 hover:bg-blue-50 px-2 py-1 rounded border border-blue-200 font-medium"
        >
          Compare with ECE
        </button>
        <button
          onClick={() => onActionClick("Bachelor's Degree Fees")}
          className="text-slate-600 hover:bg-slate-100 px-2 py-1 rounded border border-slate-200 font-medium"
        >
          All Bachelor Programs
        </button>
      </div>
    </div>
  );
}

// 7. Department Comparison Card
export function DepartmentComparisonCard({ dept1, dept2, diffAnnual, diffTotal, onActionClick }) {
  return (
    <div className="mt-3 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-slate-900 text-white p-3.5 px-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
          Side-by-Side Fee Comparison
        </span>
        <h4 className="text-sm font-bold">
          {dept1.department_code} ({dept1.degree_name}) vs {dept2.department_code} ({dept2.degree_name})
        </h4>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <th className="p-2.5 font-semibold">Parameter</th>
              <th className="p-2.5 font-bold text-blue-800 bg-blue-50/50">{dept1.department_code}</th>
              <th className="p-2.5 font-bold text-indigo-800 bg-indigo-50/50">{dept2.department_code}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            <tr>
              <td className="p-2.5 font-medium text-slate-500">Degree & Branch</td>
              <td className="p-2.5 font-semibold">{dept1.degree_name} ({dept1.department_name})</td>
              <td className="p-2.5 font-semibold">{dept2.degree_name} ({dept2.department_name})</td>
            </tr>
            <tr>
              <td className="p-2.5 font-medium text-slate-500">Annual Fee</td>
              <td className="p-2.5 font-bold text-slate-900">{formatINR(dept1.annual_fee)}</td>
              <td className="p-2.5 font-bold text-slate-900">{formatINR(dept2.annual_fee)}</td>
            </tr>
            <tr>
              <td className="p-2.5 font-medium text-slate-500">Semester Fee</td>
              <td className="p-2.5">{formatINR(dept1.semester_fee)}</td>
              <td className="p-2.5">{formatINR(dept2.semester_fee)}</td>
            </tr>
            <tr>
              <td className="p-2.5 font-medium text-slate-500">Base Tuition Fee</td>
              <td className="p-2.5">{formatINR(dept1.tuition_fee)}</td>
              <td className="p-2.5">{formatINR(dept2.tuition_fee)}</td>
            </tr>
            <tr>
              <td className="p-2.5 font-medium text-slate-500">Duration</td>
              <td className="p-2.5">{dept1.duration_years} Years</td>
              <td className="p-2.5">{dept2.duration_years} Years</td>
            </tr>
            <tr className="bg-slate-50 font-semibold">
              <td className="p-2.5 text-slate-900">Total Course Fee</td>
              <td className="p-2.5 font-bold text-blue-700">{formatINR(dept1.total_fee)}</td>
              <td className="p-2.5 font-bold text-indigo-700">{formatINR(dept2.total_fee)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-blue-50/60 border-t border-blue-100 text-xs text-blue-900">
        <span className="font-bold">Fee Variance: </span>
        Annual difference is <strong>{formatINR(diffAnnual)}</strong> ({dept1.annual_fee > dept2.annual_fee ? dept1.department_code : dept2.department_code} is higher).
        Total course fee difference is <strong>{formatINR(diffTotal)}</strong>.
      </div>
    </div>
  );
}

// 8. All Degrees Catalog Card
export function AllDegreesCard({ degrees, onActionClick }) {
  return (
    <div className="mt-3 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-slate-900 text-white p-3.5 px-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
          Undergraduate Degree Directory
        </span>
        <h4 className="text-sm font-bold">Bachelor's Degree Programs & Annual Fees</h4>
      </div>

      <div className="p-3.5 space-y-4 max-h-80 overflow-y-auto">
        {Object.entries(degrees || {}).map(([degreeName, depts]) => (
          <div key={degreeName} className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>{degreeName} Programs</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {depts.map((d, idx) => (
                <button
                  key={idx}
                  onClick={() => onActionClick(`What is the fee for ${d.department_code}?`)}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition flex justify-between items-center group"
                >
                  <div>
                    <span className="font-semibold text-slate-800 group-hover:text-blue-700 block">
                      {d.department_name} ({d.department_code})
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {d.duration_years} Yrs • Sem: {formatINR(d.semester_fee)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block text-xs">
                      {formatINR(d.annual_fee)}
                    </span>
                    <span className="text-[10px] text-blue-600 group-hover:underline">View →</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 9. Inline Security Verification Card
export function VerificationCard({ roll_number, student_name, onSubmitVerification }) {
  const [pinInput, setPinInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pinInput.trim()) {
      onSubmitVerification(pinInput.trim());
    }
  };

  return (
    <div className="mt-3 bg-white border border-blue-200 rounded-2xl shadow-sm p-4 space-y-3">
      <div className="flex items-center gap-2.5 text-blue-900">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
          <Lock className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Student Identity Verification
          </h4>
          <p className="text-xs text-slate-600">
            Verifying records for <strong className="text-slate-900">{student_name || roll_number}</strong>
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Please enter your registered <strong>4-digit Student PIN</strong> (e.g. <code>1234</code>) or <strong>Date of Birth</strong> (DD/MM/YYYY or YYYY-MM-DD):
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={pinInput}
          onChange={(e) => setPinInput(e.target.value)}
          placeholder="Enter PIN (e.g. 1234) or DOB"
          className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <button
          type="submit"
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition"
        >
          Verify
        </button>
      </form>
    </div>
  );
}
