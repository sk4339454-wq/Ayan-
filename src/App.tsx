import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Play, Film, Tv, Cloud, Search, User, Menu, X, ChevronRight, Star, PlayCircle, Info, Download, Settings, Shield, Clock, TrendingUp, Ban } from "lucide-react";
import { useState, useEffect } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Pages
import HomePage from "./pages/HomePage";
import CategoryPage from "./pages/CategoryPage";
import StoragePage from "./pages/StoragePage";
import PlayerPage from "./pages/PlayerPage";
import OfflinePage from "./pages/OfflinePage";
import AdminPanel from "./pages/AdminPanel";
import UploadPage from "./pages/UploadPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import SchedulePage from "./pages/SchedulePage";
import ErrorBoundary from "./components/ErrorBoundary";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NavbarProps {
  user: any;
  onLogout: () => void;
}

const Navbar = ({ user, onLogout }: NavbarProps) => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Anime", path: "/anime", icon: Play },
    { name: "Movies", path: "/movies", icon: Film },
    { name: "Series", path: "/series", icon: Tv },
    { name: "Schedule", path: "/schedule", icon: Calendar },
    { name: "Storage", path: "/storage", icon: Cloud },
    { name: "Offline", path: "/offline", icon: Download },
    { name: "Upload", path: "/upload", icon: PlayCircle },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 flex items-center justify-between",
      isScrolled ? "bg-bg/80 backdrop-blur-md border-b border-white/5" : "bg-transparent"
    )}>
      <div className="flex items-center gap-12">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-2xl font-bold tracking-tighter text-accent flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-bg">
              <TrendingUp size={20} />
            </div>
            PIKA
          </Link>
          <div className="h-6 w-[1px] bg-white/10 hidden sm:block" />
          <Link 
            to="/profile" 
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all hover:bg-white/5 group",
              location.pathname === "/profile" ? "bg-accent/10 text-accent" : "text-white/60"
            )}
          >
            <div className="w-6 h-6 rounded-lg overflow-hidden border border-white/10 group-hover:border-accent/50 transition-colors">
              <img 
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                alt="Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-xs font-bold hidden lg:block">Profile</span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-accent",
                location.pathname === item.path ? "text-accent" : "text-white/60"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <Search size={20} className="text-white/60" />
        </button>
        <div className="p-2 hover:bg-white/5 rounded-full transition-colors hidden md:block group relative cursor-pointer">
          <User size={20} className="text-white/60 group-hover:text-accent transition-colors" />
          {user && (
            <div className="absolute top-full right-0 mt-2 w-48 glass rounded-2xl p-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all translate-y-2 group-hover:translate-y-0 border border-white/5 z-[60]">
              <div className="p-3 border-b border-white/5 mb-2">
                <p className="text-xs font-bold truncate">{user.username}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">{user.method} Account</p>
              </div>
              <button 
                onClick={onLogout}
                className="w-full text-left p-3 text-xs font-bold text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
        <Link to="/admin" className="p-2 hover:bg-accent/10 rounded-full transition-colors text-white/40 hover:text-accent">
          <Shield size={20} />
        </Link>
        <button 
          className="md:hidden p-2 hover:bg-white/5 rounded-full transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-bg border-b border-white/5 p-6 md:hidden flex flex-col gap-4"
          >
            <div className="flex flex-col gap-4">
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-4 text-lg font-medium p-4 bg-white/5 rounded-2xl",
                  location.pathname === "/profile" ? "text-accent" : "text-white/60"
                )}
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10">
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <p className="text-sm font-bold">{user.username}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">View Profile</p>
                </div>
              </Link>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-4 text-lg font-medium px-4",
                    location.pathname === item.path ? "text-accent" : "text-white/60"
                  )}
                >
                  <item.icon size={20} />
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        }
      } catch (err) {
        console.error("Auth check failed", err);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <ErrorBoundary>
        <LoginPage onLogin={handleLogin} />
      </ErrorBoundary>
    );
  }

  if (user.isBanned) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md glass rounded-3xl p-8 border border-white/5 text-center"
        >
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
            <Ban size={40} />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter mb-4">Account Banned</h1>
          <p className="text-white/40 mb-8">
            Your account has been suspended for violating our community guidelines. If you believe this is a mistake, please contact support.
          </p>
          <button 
            onClick={handleLogout}
            className="w-full bg-white/5 border border-white/10 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all"
          >
            Return to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-bg text-white font-sans selection:bg-accent selection:text-bg">
          <Navbar user={user} onLogout={handleLogout} />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/anime" element={<CategoryPage type="Series" title="Anime Series" />} />
              <Route path="/movies" element={<CategoryPage type="Movie" title="Anime Movies" />} />
              <Route path="/series" element={<CategoryPage type="Series" title="Featured Series" />} />
              <Route path="/storage" element={<StoragePage />} />
              <Route path="/offline" element={<OfflinePage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/profile" element={<ProfilePage user={user} onLogout={handleLogout} />} />
              <Route path="/player/:id" element={<PlayerPage />} />
            </Routes>
          </main>
        
        <footer className="py-12 px-6 border-top border-white/5 mt-20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="text-2xl font-bold tracking-tighter text-accent flex items-center gap-2 mb-4">
                PIKA
              </Link>
              <p className="text-white/40 max-w-sm">
                The ultimate destination for anime enthusiasts. Stream high-quality content and manage your personal library with ease.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-white/40 text-sm">
                <li><Link to="/anime" className="hover:text-accent">Anime</Link></li>
                <li><Link to="/movies" className="hover:text-accent">Movies</Link></li>
                <li><Link to="/series" className="hover:text-accent">Series</Link></li>
                <li><Link to="/storage" className="hover:text-accent">Cloud Storage</Link></li>
                <li><Link to="/offline" className="hover:text-accent">Offline Downloads</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-white/40 text-sm">
                <li><a href="#" className="hover:text-accent">Help Center</a></li>
                <li><a href="#" className="hover:text-accent">Terms of Service</a></li>
                <li><a href="#" className="hover:text-accent">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-accent">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 text-center text-white/20 text-xs">
            © 2024 pika.studio. All rights reserved. Licensed content only.
          </div>
        </footer>
      </div>
    </Router>
  </ErrorBoundary>
  );
}
