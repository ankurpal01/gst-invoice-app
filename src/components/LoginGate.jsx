import React, { useState } from "react";
import { Lock, ShieldCheck, User, Key, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

export default function LoginGate({ onAuthorize, adminPassword }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Feedback states
  const [errorMsg, setErrorMsg] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle Login Submit
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Validate username (Harish Joshi) and password (from settings / Joshi@123)
    if (cleanUsername === "harish joshi" && cleanPassword === adminPassword) {
      handleSuccess();
    } else if (cleanUsername !== "harish joshi" && cleanPassword === adminPassword) {
      handleFailure("Incorrect Username");
    } else if (cleanUsername === "harish joshi" && cleanPassword !== adminPassword) {
      handleFailure("Incorrect Password");
    } else {
      handleFailure("Invalid Username & Password");
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

  return (
    <div className="fixed inset-0 w-full h-full min-h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden z-[9999] px-4 selection:bg-teal-500/30 selection:text-teal-200">
      {/* Floating Radial Ambience Blobs */}
      <div className="absolute top-1/4 left-1/4 w-[60vw] h-[60vw] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none translate-x-1/2 translate-y-1/2"></div>

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
              ) : (
                <Lock className="h-8 w-8" />
              )}
            </div>

            <h2 className="text-xl font-bold tracking-tight text-white">
              {isSuccess ? "Access Granted" : "GST Invoice Hub Login"}
            </h2>
            <p className="text-[10px] font-bold text-slate-500 mt-1.5 uppercase tracking-widest">
              {isSuccess ? "Authentication Success" : "Administrator Portal"}
            </p>
          </div>

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
              /* Credentials Form */
              <form onSubmit={handleLoginSubmit} className="space-y-5 animate-fade-in">
                {/* Username Input */}
                <div className="relative border-b border-slate-800 focus-within:border-teal-500 transition-colors pb-1.5">
                  <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 font-bold flex items-center gap-1">
                    <User size={12} />
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setErrorMsg("");
                    }}
                    placeholder="Harish Joshi"
                    className="w-full bg-transparent border-none p-0 focus:ring-0 text-white font-sans text-sm outline-none placeholder-slate-700"
                    autoFocus
                    required
                  />
                </div>

                {/* Password Input */}
                <div className="relative border-b border-slate-800 focus-within:border-teal-500 transition-colors pb-1.5">
                  <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 font-bold flex items-center gap-1">
                    <Key size={12} />
                    Password
                  </label>
                  <div className="flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrorMsg("");
                      }}
                      placeholder="••••••••"
                      className="w-full bg-transparent border-none p-0 focus:ring-0 text-white font-sans text-sm outline-none placeholder-slate-850"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                  disabled={!username || !password}
                  className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/10 cursor-pointer mt-2"
                >
                  Sign In
                  <ShieldCheck size={16} />
                </button>
              </form>
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
