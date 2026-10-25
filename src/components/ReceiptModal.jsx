import React from 'react';
import { X, Printer, CheckCircle2, Shield, Building2 } from 'lucide-react';

export default function ReceiptModal({ receiptData, onClose }) {
  if (!receiptData) return null;

  const { student, payment } = receiptData;

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden relative">
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Official Payment Receipt
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 sm:p-7 space-y-5 print:p-0">
          {/* College Header */}
          <div className="text-center pb-4 border-b border-slate-200">
            <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-md">
              <Building2 className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              Apex Institute of Technology & Sciences
            </h2>
            <p className="text-xs text-slate-500">Autonomous Institution • Approved by AICTE • Affiliated to State Tech Univ</p>
            <p className="text-xs font-semibold text-blue-800 mt-1 uppercase tracking-wider">
              Student Fee Payment Voucher
            </p>
          </div>

          {/* Receipt Meta */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-slate-500 block">Receipt Number</span>
              <span className="font-mono font-bold text-slate-800">{payment.receipt_no}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Payment Date</span>
              <span className="font-semibold text-slate-800">{payment.payment_date}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Transaction Reference</span>
              <span className="font-mono font-bold text-blue-700">{payment.transaction_id}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Payment Mode</span>
              <span className="font-medium text-slate-800">{payment.payment_method}</span>
            </div>
          </div>

          {/* Student Info */}
          <div className="text-xs space-y-2">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Student Name:</span>
              <span className="font-bold text-slate-800">{student?.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Roll Number:</span>
              <span className="font-mono font-semibold text-slate-800">{student?.roll_number}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Degree & Branch:</span>
              <span className="font-medium text-slate-800">{student?.degree} ({student?.department})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Academic Year / Batch:</span>
              <span className="font-medium text-slate-800">{student?.academic_year} ({student?.admission_batch})</span>
            </div>
          </div>

          {/* Amount Paid Box */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-emerald-800 block">Total Amount Paid</span>
              <span className="text-2xl font-extrabold text-emerald-700">
                {formatCurrency(payment.amount_paid)}
              </span>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified
            </div>
          </div>

          {/* Digital Signature Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>System-Generated Electronic Slip</span>
            </div>
            <div className="text-right">
              <span className="font-semibold text-slate-600">Comptroller of Finance</span>
              <p className="text-[10px]">No physical signature required</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
