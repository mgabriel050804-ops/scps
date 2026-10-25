import React, { useState, useEffect } from 'react';
import { Sparkles, UserCheck, ChevronDown, ChevronUp, KeyRound } from 'lucide-react';

export default function QuickPrompts({ onSelectPrompt, onSelectStudentProfile }) {
  const [sampleStudents, setSampleStudents] = useState([]);
  const [showProfiles, setShowProfiles] = useState(false);

  useEffect(() => {
    fetch('/api/sample-students')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSampleStudents(data.students);
        }
      })
      .catch(err => console.log('Could not load sample students', err));
  }, []);

  const defaultPrompts = [
    'Check My Fees',
    'Check Pending Dues',
    'Last Payment Details',
    'View Payment History',
    'Department-Wise Fees',
    "Bachelor's Degree Fees",
    'Compare CSE and ECE Fees'
  ];

  return (
    <div className="border-t border-slate-200/80 bg-white/95 backdrop-blur px-4 py-2.5 space-y-2">
      {/* Sample Student Profiles Helper Toggle (Ideal for quick testing/reviewing) */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1.5 text-slate-500">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-semibold text-slate-700">Quick Test Profiles:</span>
        </div>
        <button
          onClick={() => setShowProfiles(!showProfiles)}
          className="text-blue-700 hover:text-blue-800 text-[11px] font-medium flex items-center gap-0.5"
        >
          <span>{showProfiles ? 'Hide Profiles' : 'Show Sample Student Roll Numbers'}</span>
          {showProfiles ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Expanded Test Profiles Bar */}
      {showProfiles && sampleStudents.length > 0 && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] animate-fade-in">
          {sampleStudents.map((s) => (
            <button
              key={s.roll_number}
              onClick={() => onSelectStudentProfile(s)}
              className="p-1.5 bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-lg text-left transition flex flex-col justify-between"
            >
              <div className="font-semibold text-slate-800 truncate">{s.name}</div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-0.5">
                <span className="font-mono text-blue-700 font-bold">{s.roll_number}</span>
                <span className="bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-medium">{s.degree}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Suggested Chat Prompt Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        {defaultPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(prompt)}
            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 border border-slate-200 transition font-medium text-[11px] sm:text-xs"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
