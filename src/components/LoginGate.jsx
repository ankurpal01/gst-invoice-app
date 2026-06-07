import React, { useState, useEffect, useRef } from "react";
import { Lock, ShieldCheck, Key, Smartphone, Send, Eye, EyeOff, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";

export default function LoginGate({ onAuthorize, adminPassword, supplierPhone }) {
  const [activeTab, setActiveTab] = useState("passcode"); // "passcode" or "otp"
  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  
  // OTP states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  
  // Feedback states
  const [errorMsg, setErrorMsg] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Simulated SMS Toast state
  const [smsNotification, setSmsNotification] = useState(null);
  
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  const MOCK_OTP = "482901";

  // Handle Passcode Submit
  const handlePasscodeSubmit = (e) => {
    e.preventDefault();
    const cleanInput = passcode.trim();
    if (cleanInput === adminPassword) {
      handleSuccess();
    } else {
      handleFailure("Invalid Security Passcode");
    }
  };

  // Trigger Send OTP simulation
  const handleSendOtp = (e) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      handleFailure("Please enter a valid 10-digit mobile number");
      return;
    }

    setIsSendingOtp(true);
    setErrorMsg("");
    
    // Simulate sending network request
    setTimeout(() => {
      setIsSendingOtp(false);
      setOtpSent(true);
      
      // Trigger the slide-down SMS Notification
      setSmsNotification({
        id: Date.now(),
        sender: "JOSHI-SMS",
        message: `Your verification OTP is: ${MOCK_OTP}. Valid for 5 minutes.`,
        time: "Just now"
      });
    }, 1200);
  };

  // Handle OTP digit changes
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value.substring(value.length - 1);
    setOtpValues(newOtpValues);
    setErrorMsg("");

    // Auto focus next box
    if (value !== "" && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && otpValues[index] === "" && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const chars = pastedData.split("");
      setOtpValues(chars);
      otpRefs[5].current.focus();
    }
  };

  // Verify OTP
  const handleOtpVerify = (e) => {
    e.preventDefault();
    const enteredOtp = otpValues.join("");
    if (enteredOtp === MOCK_OTP) {
      handleSuccess();
    } else {
      handleFailure("Incorrect verification token");
    }
  };

  const handleSuccess = () => {
    setErrorMsg("");
    setIsSuccess(true);
    setTimeout(() => {
      localStorage.setItem("portfolio_authorized", "true");
      onAuthorize();
    }, 1000);
  };

  const handleFailure = (msg) => {
    setErrorMsg(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  // Auto-dismiss SMS notification after 15 seconds
  useEffect(() => {
    if (smsNotification) {
      const timer = setTimeout(() => {
        setSmsNotification(null);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [smsNotification]);

  // Focus utility on tab switch or OTP sent
  useEffect(() => {
    if (otpSent && activeTab === "otp") {
      otpRefs[0].current?.focus();
    }
  }, [otpSent, activeTab]);

  return (
    <div className="fixed inset-0 w-full h-full min-h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden z-[9999] px-4 selection:bg-teal-500/30 selection:text-teal-200">
      {/* Floating Radial Ambience Blobs */}
      <div className="absolute top-1/4 left-1/4 w-[60vw] h-[60vw] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none translate-x-1/2 translate-y-1/2"></div>

      {/* Simulated SMS Toast Push Notification */}
      {smsNotification && (
        <div
          onClick={() => setSmsNotification(null)}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000] w-full max-w-sm mx-auto bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-pointer hover:border-teal-500/50 transition-colors animate-fade-in"
        >
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shrink-0 shadow-lg text-slate-950">
              <MessageSquare size={20} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-[10px] uppercase tracking-wider text-teal-400">Messages</span>
                <span className="text-[10px] text-slate-500">{smsNotification.time}</span>
              </div>
              <h4 className="font-bold text-sm text-white">{smsNotification.sender}</h4>
              <p className="font-sans text-xs text-slate-300 mt-0.5 leading-relaxed">{smsNotification.message}</p>
              <div className="mt-2 text-[10px] text-teal-400/80 font-bold uppercase tracking-wider flex items-center gap-1">
                <span>Touch to copy & auto-fill</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Lock Interface Container */}
      <div
        className={`w-full max-w-md relative z-10 transition-transform duration-300 ${isShaking ? "animate-shake" : ""}`}
        style={{
          animation: isShaking ? "shake 0.5s" : "none"
        }}
      >
        <div className="glass-panel rounded-3xl p-8 border border-slate-850 shadow-2xl relative overflow-hidden">
          {/* Neon Header glow band */}
          <div className={`absolute top-0 left-0 right-0 h-1 transition-all duration-500 ${isSuccess ? 'bg-emerald-500' : errorMsg ? 'bg-rose-500' : 'bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-400'}`}></div>

          {/* Icon Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border transition-all duration-500 ${
                isSuccess 
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                  : errorMsg 
                    ? 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                    : 'bg-slate-800/40 border-slate-700/50 text-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.15)]'
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="h-8 w-8" />
              ) : activeTab === "passcode" ? (
                <Lock className="h-8 w-8" />
              ) : (
                <Smartphone className="h-8 w-8" />
              )}
            </div>

            <h2 className="text-xl font-bold tracking-tight text-white">
              {isSuccess ? "Access Granted" : "GST Invoice Gate"}
            </h2>
            <p className="text-[10px] font-bold text-slate-500 mt-1.5 uppercase tracking-widest">
              {isSuccess ? "Authentication Success" : "Identity Verification Required"}
            </p>
          </div>

          {/* Verification Tab Switcher */}
          {!isSuccess && (
            <div className="grid grid-cols-2 bg-slate-950/60 rounded-xl p-1 mb-8 border border-slate-900">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("passcode");
                  setErrorMsg("");
                }}
                className={`py-2 px-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "passcode"
                    ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md font-extrabold"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Key size={14} />
                Passcode
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("otp");
                  setErrorMsg("");
                }}
                className={`py-2 px-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "otp"
                    ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md font-extrabold"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Smartphone size={14} />
                Mobile OTP
              </button>
            </div>
          )}

          {/* Form Content */}
          <div className="min-h-[190px] flex flex-col justify-center">
            {isSuccess ? (
              <div className="text-center py-6 space-y-3 animate-fade-in">
                <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest rounded-full">
                  Decrypted
                </div>
                <p className="text-sm text-slate-400">Loading invoice workspace...</p>
                <div className="w-24 h-1 bg-slate-900 mx-auto rounded-full overflow-hidden mt-4">
                  <div className="w-1/2 h-full bg-emerald-500 rounded-full animate-[progress_1s_ease-in-out_infinite]"
                       style={{
                         animation: "progress 1s ease-in-out infinite",
                         backgroundImage: "linear-gradient(90deg, #10b981, #34d399)"
                       }}
                  ></div>
                </div>
              </div>
            ) : (
              activeTab === "passcode" ? (
                /* Passcode Flow Form */
                <form onSubmit={handlePasscodeSubmit} className="space-y-6 animate-fade-in">
                  <div className="relative border-b border-slate-800 focus-within:border-teal-500 transition-colors pb-1.5">
                    <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 font-bold">Enter Security Passcode</label>
                    <div className="flex items-center">
                      <input
                        type={showPasscode ? "text" : "password"}
                        value={passcode}
                        onChange={(e) => {
                          setPasscode(e.target.value);
                          setErrorMsg("");
                        }}
                        placeholder="••••••••"
                        className="w-full bg-transparent border-none p-0 focus:ring-0 text-white font-sans text-lg tracking-[0.15em] placeholder-slate-800 outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasscode(!showPasscode)}
                        className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                      >
                        {showPasscode ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {errorMsg && (
                    <p className="text-xs text-rose-400 flex items-center gap-1.5 font-medium">
                      <AlertCircle size={14} />
                      {errorMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={!passcode}
                    className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/10 cursor-pointer"
                  >
                    Unlock App
                    <Key size={16} />
                  </button>
                  <p className="text-center text-[10px] text-slate-600 uppercase tracking-widest font-bold">
                    Default Passcode: `{adminPassword}`
                  </p>
                </form>
              ) : (
                /* OTP Flow Form */
                <div className="animate-fade-in">
                  {!otpSent ? (
                    /* Step 1: Input Phone Number */
                    <form onSubmit={handleSendOtp} className="space-y-6">
                      <div className="relative border-b border-slate-800 focus-within:border-teal-500 transition-colors pb-1.5">
                        <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 font-bold">Mobile Number</label>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-bold text-base">+91</span>
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => {
                              setPhoneNumber(e.target.value.replace(/\D/g, ""));
                              setErrorMsg("");
                            }}
                            placeholder={supplierPhone || "92123 12312"}
                            maxLength={10}
                            className="w-full bg-transparent border-none p-0 focus:ring-0 text-white font-sans text-lg tracking-wider placeholder-slate-800 outline-none"
                            autoFocus
                          />
                        </div>
                      </div>

                      {errorMsg && (
                        <p className="text-xs text-rose-400 flex items-center gap-1.5 font-medium">
                          <AlertCircle size={14} />
                          {errorMsg}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={phoneNumber.length < 10 || isSendingOtp}
                        className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/10 cursor-pointer"
                      >
                        {isSendingOtp ? (
                          <>
                            Generating Code...
                            <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                          </>
                        ) : (
                          <>
                            Request OTP Code
                            <Send size={16} />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    /* Step 2: Input Verification Code */
                    <form onSubmit={handleOtpVerify} className="space-y-6">
                      <div className="space-y-3">
                        <label className="block text-[10px] text-slate-500 uppercase tracking-widest text-center font-bold">
                          Verification code sent to +91 {phoneNumber}
                        </label>
                        <div 
                          className="flex justify-between gap-2.5"
                          onPaste={handleOtpPaste}
                        >
                          {otpValues.map((digit, idx) => (
                            <input
                              key={idx}
                              ref={otpRefs[idx]}
                              type="text"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              className="w-12 h-12 bg-slate-950 border border-slate-800 text-center text-white font-bold text-xl rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all shadow-md"
                            />
                          ))}
                        </div>
                      </div>

                      {errorMsg && (
                        <p className="text-xs text-rose-400 flex items-center justify-center gap-1.5 font-medium">
                          <AlertCircle size={14} />
                          {errorMsg}
                        </p>
                      )}

                      <div className="flex flex-col gap-3">
                        <button
                          type="submit"
                          disabled={otpValues.includes("")}
                          className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/10 cursor-pointer"
                        >
                          Verify OTP
                          <ShieldCheck size={16} />
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtpValues(["", "", "", "", "", ""]);
                            setErrorMsg("");
                          }}
                          className="w-full bg-transparent text-slate-500 font-bold text-[10px] uppercase tracking-widest hover:text-white py-2 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          Change Mobile Number
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )
            )}
          </div>
        </div>

        {/* Sentinel terminal foot info */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-slate-600 font-bold text-[10px] uppercase tracking-widest">
          <ShieldCheck size={12} className="text-slate-600" />
          <span>GST Gateway Security Guard • Active</span>
        </div>
      </div>

      {/* Embedded CSS for custom shake/progress animations */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
