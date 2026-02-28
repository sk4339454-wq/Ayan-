import React from "react";
import { motion } from "framer-motion";
import { User, Mail, Shield, Clock, Heart, Play, Download, Settings, LogOut, Camera, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface ProfilePageProps {
  user: any;
  onLogout: () => void;
}

export default function ProfilePage({ user, onLogout }: ProfilePageProps) {
  const stats = [
    { label: "Watched", value: "124", icon: Play, color: "text-blue-400" },
    { label: "Favorites", value: "48", icon: Heart, color: "text-red-400" },
    { label: "Offline", value: "12", icon: Download, color: "text-emerald-400" },
    { label: "Hours", value: "342", icon: Clock, color: "text-amber-400" },
  ];

  return (
    <div className="pt-24 pb-12 px-6 max-w-5xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Breadcrumbs / Back */}
        <div className="flex items-center gap-4 mb-4">
          <Link to="/" className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white">
            <ChevronLeft size={24} />
          </Link>
          <h2 className="text-sm font-bold uppercase tracking-widest text-white/40">Personal Profile</h2>
        </div>

        {/* Header Section */}
        <div className="glass rounded-[32px] p-8 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full -mr-32 -mt-32" />
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl">
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                  alt={user.username}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <button className="absolute bottom-[-8px] right-[-8px] w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-bg shadow-lg hover:scale-110 transition-transform">
                <Camera size={18} />
              </button>
            </div>

            <div className="text-center md:text-left flex-grow">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                <h1 className="text-4xl font-bold tracking-tighter">{user.username}</h1>
                <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-bold uppercase tracking-widest self-center md:self-auto">
                  {user.method} Account
                </span>
              </div>
              <p className="text-white/40 mb-6 max-w-md">
                Anime enthusiast since 2024. Exploring the vast worlds of pika.studio one episode at a time.
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <button className="bg-white text-bg px-6 py-2 rounded-xl font-bold text-sm hover:scale-105 transition-transform active:scale-95">
                  Edit Profile
                </button>
                <button 
                  onClick={onLogout}
                  className="bg-red-500/10 text-red-500 border border-red-500/20 px-6 py-2 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all active:scale-95"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 border border-white/5 text-center"
            >
              <stat.icon className={cn("mx-auto mb-3", stat.color)} size={24} />
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="glass rounded-3xl p-8 border border-white/5">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Shield size={20} className="text-accent" />
                Account Security
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Email Address</p>
                      <p className="text-xs text-white/40">Linked via {user.method}</p>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-accent hover:underline">Change</button>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <Shield size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Two-Factor Auth</p>
                      <p className="text-xs text-white/40">Enhanced security active</p>
                    </div>
                  </div>
                  <div className="w-10 h-5 bg-accent/20 rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-accent rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass rounded-3xl p-8 border border-white/5">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Settings size={20} className="text-accent" />
                Preferences
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Auto-play</span>
                  <div className="w-10 h-5 bg-accent rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-bg rounded-full" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Subtitles</span>
                  <span className="text-xs font-bold text-accent">English</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Quality</span>
                  <span className="text-xs font-bold text-accent">Auto (4K)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Helper function for class names
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
