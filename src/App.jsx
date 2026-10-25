import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import QuickPrompts from './components/QuickPrompts';
import ReceiptModal from './components/ReceiptModal';
import {
  FeeSummaryCard,
  PendingDuesCard,
  FeeBreakdownCard,
  LastPaymentCard,
  PaymentHistoryCard,
  DepartmentFeeCard,
  DepartmentComparisonCard,
  AllDegreesCard,
  VerificationCard
} from './components/Cards';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  Shield,
  HelpCircle
} from 'lucide-react';

const INITIAL_WELCOME = {
  id: 'msg-welcome',
  sender: 'bot',
  text: "Hello! Welcome to the College Fees Assistant. I can help you check your fee balance, pending dues, payment history, and department-wise fees. How can I help you today?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  quickReplies: [
    'Check My Fees',
    'Check Pending Dues',
    'Last Payment Details',
    'View Payment History',
    'Department-Wise Fees',
    "Bachelor's Degree Fees"
  ]
};

export default function App() {
  const [messages, setMessages] = useState([INITIAL_WELCOME]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verifiedStudent, setVerifiedStudent] = useState(null);
  const [sessionId, setSessionId] = useState(() => 'sess_' + Math.random().toString(36).substring(2, 9));
  const [receiptModalData, setReceiptModalData] = useState(null);
  const [speechEnabled, setSpeechEnabled] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const speakText = (text) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Clean markdown tags for natural speech
      const clean = text.replace(/[*#`_•]/g, '').slice(0, 250);
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  };

  const handleSendMessage = async (userText) => {
    const textToSend = (userText || inputText).trim();
    if (!textToSend || isLoading) return;

    const userMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          sessionId
        })
      });

      const data = await response.json();

      if (data.verifiedStudent) {
        setVerifiedStudent(data.verifiedStudent);
      } else if (data.verifiedStudent === null && (textToSend.toLowerCase().includes('logout') || textToSend.toLowerCase().includes('switch'))) {
        setVerifiedStudent(null);
      }

      const botMessage = {
        id: 'msg_' + (Date.now() + 1),
        sender: 'bot',
        text: data.reply || "I've retrieved the requested details from the college database.",
        cardType: data.cardType,
        cardData: data.cardData,
        quickReplies: data.quickReplies,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMessage]);
      speakText(botMessage.text);
    } catch (error) {
      console.error('Failed to communicate with fees assistant:', error);
      const errorMessage = {
        id: 'msg_' + (Date.now() + 1),
        sender: 'bot',
        text: 'Sorry, I encountered a temporary connection issue. Please check your connection and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleResetChat = async () => {
    try {
      await fetch('/api/reset-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
    } catch (e) {}

    setSessionId('sess_' + Math.random().toString(36).substring(2, 9));
    setVerifiedStudent(null);
    setMessages([
      {
        ...INITIAL_WELCOME,
        id: 'msg-welcome-' + Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleLogout = () => {
    handleSendMessage('logout');
  };

  const handleSelectStudentProfile = (studentProfile) => {
    handleSendMessage(`Check fees for ${studentProfile.roll_number}`);
  };

  const handleActionClick = (prompt) => {
    handleSendMessage(prompt);
  };

  const handleInlineVerification = (pinOrDob) => {
    handleSendMessage(pinOrDob);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      {/* College Chatbot Header */}
      <Header
        verifiedStudent={verifiedStudent}
        onLogout={handleLogout}
        onResetChat={handleResetChat}
      />

      {/* Centered Chat Window Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto flex flex-col min-h-0 bg-white sm:border-x sm:border-slate-200 sm:shadow-lg overflow-hidden">
        
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 sm:gap-3.5 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              } animate-fade-in`}
            >
              {/* Bot Avatar */}
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-sm flex-shrink-0 mt-0.5">
                  <Bot className="w-5 h-5" />
                </div>
              )}

              {/* Message Content */}
              <div
                className={`max-w-[88%] sm:max-w-[80%] ${
                  msg.sender === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                {/* Bubble */}
                <div
                  className={`inline-block px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-500/10'
                      : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-200/80 shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-line font-normal">
                    {msg.text}
                  </div>

                  {/* Dynamic Structured Cards inside bot responses */}
                  {msg.cardType === 'FEE_SUMMARY' && (
                    <FeeSummaryCard
                      student={msg.cardData?.student}
                      fees={msg.cardData?.fees}
                      onActionClick={handleActionClick}
                    />
                  )}

                  {msg.cardType === 'PENDING_DUES' && (
                    <PendingDuesCard
                      student={msg.cardData?.student}
                      fees={msg.cardData?.fees}
                      onActionClick={handleActionClick}
                    />
                  )}

                  {msg.cardType === 'FEE_BREAKDOWN' && (
                    <FeeBreakdownCard
                      student={msg.cardData?.student}
                      fees={msg.cardData?.fees}
                      onActionClick={handleActionClick}
                    />
                  )}

                  {msg.cardType === 'LAST_PAYMENT' && (
                    <LastPaymentCard
                      student={msg.cardData?.student}
                      lastPayment={msg.cardData?.lastPayment}
                      remaining_balance={msg.cardData?.remaining_balance}
                      onOpenReceipt={(data) => setReceiptModalData(data)}
                    />
                  )}

                  {msg.cardType === 'PAYMENT_HISTORY' && (
                    <PaymentHistoryCard
                      student={msg.cardData?.student}
                      payments={msg.cardData?.payments}
                      total_paid={msg.cardData?.total_paid}
                      remaining_balance={msg.cardData?.remaining_balance}
                      onOpenReceipt={(data) => setReceiptModalData(data)}
                    />
                  )}

                  {msg.cardType === 'DEPARTMENT_FEE' && (
                    <DepartmentFeeCard
                      dept={msg.cardData?.dept}
                      onActionClick={handleActionClick}
                    />
                  )}

                  {msg.cardType === 'DEPARTMENT_COMPARISON' && (
                    <DepartmentComparisonCard
                      dept1={msg.cardData?.dept1}
                      dept2={msg.cardData?.dept2}
                      diffAnnual={msg.cardData?.diffAnnual}
                      diffTotal={msg.cardData?.diffTotal}
                      onActionClick={handleActionClick}
                    />
                  )}

                  {msg.cardType === 'ALL_DEGREES_CATALOG' && (
                    <AllDegreesCard
                      degrees={msg.cardData?.degrees}
                      onActionClick={handleActionClick}
                    />
                  )}

                  {msg.cardType === 'VERIFICATION_REQUIRED' && (
                    <VerificationCard
                      roll_number={msg.cardData?.roll_number}
                      student_name={msg.cardData?.student_name}
                      onSubmitVerification={handleInlineVerification}
                    />
                  )}
                </div>

                {/* Timestamp and Voice indicator */}
                <div
                  className={`flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'bot' && (
                    <button
                      onClick={() => speakText(msg.text)}
                      title="Read aloud"
                      className="hover:text-blue-600 transition"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Inline Quick Action Buttons under message if provided */}
                {msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {msg.quickReplies.map((reply, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(reply)}
                        className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 hover:text-blue-800 border border-blue-200 rounded-full text-[11px] font-medium transition shadow-xs"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User Avatar */}
              {msg.sender === 'user' && (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-sm flex-shrink-0 mt-0.5">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-start gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl rounded-tl-none px-4 py-3 shadow-xs">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></div>
                  <span className="text-xs text-slate-400 ml-2 font-medium">Checking fee records...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts & Sample Roll Numbers bar */}
        <QuickPrompts
          onSelectPrompt={(p) => handleSendMessage(p)}
          onSelectStudentProfile={handleSelectStudentProfile}
        />

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about your fees, dues, payment history, or department fees..."
                className="w-full pl-4 pr-10 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setSpeechEnabled(!speechEnabled)}
                title={speechEnabled ? "Mute speech" : "Enable speech response"}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition ${
                  speechEnabled ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-3 sm:px-5 sm:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl font-medium transition shadow-sm flex items-center justify-center gap-1.5 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline text-xs sm:text-sm font-semibold">Send</span>
            </button>
          </form>

          {/* Privacy & Source-of-Truth Disclaimer */}
          <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 px-1">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-blue-500" />
              Source of truth: Official college financial database. Search fee balance directly by roll number.
            </span>
            <span className="hidden sm:inline">Press Enter to send</span>
          </div>
        </div>
      </main>

      {/* Official Payment Receipt Modal */}
      {receiptModalData && (
        <ReceiptModal
          receiptData={receiptModalData}
          onClose={() => setReceiptModalData(null)}
        />
      )}
    </div>
  );
}
