import React from 'react';
import { Building2, ShieldCheck, UserCheck, LogOut, RotateCcw, Sparkles } from 'lucide-react';

export default function Header({ verifiedStudent, onLogout, onResetChat }) {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 py-3 sm:py-3.5 flex flex-wrap items-center justify-between gap-3">
        {/* College Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-100">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight tracking-tight">
                Apex Institute of Technology & Sciences
              </h1>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                Official Assistant
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <span className="font-medium text-slate-600">College Fees & Dues Portal</span>
              <span>•</span>
              <span className="flex items-center text-emerald-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                Database Live
              </span>
            </div>
          </div>
        </div>

        {/* Right side actions & Authentication Status */}
        <div className="flex items-center space-x-2 sm:space-x-3 ml-auto">
          {verifiedStudent ? (
            <div className="flex items-center space-x-2 bg-blue-50/80 border border-blue-200/80 rounded-lg px-2.5 py-1 text-xs sm:text-sm">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="font-semibold text-slate-800 leading-none">{verifiedStudent.name}</div>
                <div className="text-[11px] text-blue-700 font-mono">{verifiedStudent.roll_number}</div>
              </div>
              <button
                onClick={onLogout}
                title="Switch student / Logout"
                className="ml-1 p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Verified Student Dues Access</span>
            </div>
          )}

          {/* Reset Chat Button */}
          <button
            onClick={onResetChat}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition border border-slate-200"
            title="Start new conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
}
