import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Chrome, Facebook, UserCircle, ArrowRight, ShieldCheck, Globe, AlertCircle } from "lucide-react";

interface LoginPageProps {
  onLogin: (user: any) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load Google Identity Services SDK
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: (import.meta as any).env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button"),
          { 
            theme: "outline", 
            size: "large", 
            width: "100%",
            shape: "pill",
            text: "continue_with",
            logo_alignment: "left"
          }
        );
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleResponse = async (response: any) => {
    setIsLoading("google");
    setError("");
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (data.success) {
        onLogin(data.user);
      } else {
        setError(data.error || "Google login failed");
      }
    } catch (err) {
      setError("Network error during Google login");
    } finally {
      setIsLoading(null);
    }
  };

  const handleLogin = (method: string) => {
    setIsLoading(method);
    setError("");
    // Simulate API call for non-Google methods
    setTimeout(() => {
      let mockUser;
      if (method === "admin") {
        if (adminPassword === "Ayan") {
          mockUser = {
            id: "admin-1",
            username: "Ayan",
            role: "admin",
            isBanned: false,
            method: "Admin",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ayan"
          };
        } else {
          setError("Invalid admin password");
          setIsLoading(null);
          return;
        }
      } else {
        mockUser = {
          id: `user-${Math.random().toString(36).substr(2, 9)}`,
          username: method === "guest" ? "Guest Explorer" : `User_${method}`,
          method,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${method}`,
          isBanned: false,
          role: "user"
        };
      }
      onLogin(mockUser);
      setIsLoading(null);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-accent rounded-3xl flex items-center justify-center text-bg mx-auto mb-6 shadow-2xl shadow-accent/20">
            <TrendingUp size={40} />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter mb-3">Welcome to PIKA</h1>
          <p className="text-white/40">The ultimate destination for anime enthusiasts.</p>
        </div>

        <div className="glass rounded-[32px] p-8 border border-white/5 space-y-4">
          {!showAdminLogin ? (
            <>
              {/* Official Google Sign-In Button */}
              <div id="google-signin-button" className="w-full h-[50px] overflow-hidden rounded-full" />

              <button 
                onClick={() => handleLogin("facebook")}
                disabled={!!isLoading}
                className="w-full flex items-center justify-between bg-[#1877F2] text-white py-4 px-6 rounded-2xl font-bold hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50"
              >
                <div className="flex items-center gap-4">
                  <Facebook size={20} fill="currentColor" />
                  <span>Continue with Facebook</span>
                </div>
                {isLoading === "facebook" ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight size={18} />
                )}
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest">
                  <span className="bg-bg px-4 text-white/20">Or explore as</span>
                </div>
              </div>

              <button 
                onClick={() => handleLogin("guest")}
                disabled={!!isLoading}
                className="w-full flex items-center justify-between bg-white/5 border border-white/10 text-white py-4 px-6 rounded-2xl font-bold hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
              >
                <div className="flex items-center gap-4">
                  <UserCircle size={20} className="text-white/60" />
                  <span>Guest Account</span>
                </div>
                {isLoading === "guest" ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight size={18} className="text-white/40" />
                )}
              </button>

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-xs justify-center mt-4">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              <button 
                onClick={() => setShowAdminLogin(true)}
                className="w-full text-center text-[10px] uppercase tracking-widest text-white/20 hover:text-accent transition-colors pt-4"
              >
                Admin Login
              </button>
            </>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Admin Password</label>
                <input 
                  type="password" 
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-accent transition-all"
                />
              </div>
              {error && <p className="text-red-500 text-xs ml-4">{error}</p>}
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowAdminLogin(false)}
                  className="flex-1 bg-white/5 border border-white/10 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all"
                >
                  Back
                </button>
                <button 
                  onClick={() => handleLogin("admin")}
                  disabled={!!isLoading}
                  className="flex-1 bg-accent text-bg py-4 rounded-2xl font-bold hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isLoading === "admin" ? "Verifying..." : "Login"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20">
              <ShieldCheck size={20} />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Secure</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20">
              <Globe size={20} />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Global</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20">
              <TrendingUp size={20} />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Fast</span>
          </div>
        </div>

        <p className="text-center mt-12 text-[10px] text-white/20 leading-relaxed max-w-[280px] mx-auto uppercase tracking-widest">
          By continuing, you agree to our <a href="#" className="text-white/40 hover:text-accent underline">Terms of Service</a> and <a href="#" className="text-white/40 hover:text-accent underline">Privacy Policy</a>.
        </p>
      </motion.div>
    </div>
  );
}
