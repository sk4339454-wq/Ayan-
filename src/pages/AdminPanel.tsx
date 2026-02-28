import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Users, Ban, Clock, CheckCircle, XCircle, Search, Lock, AlertCircle } from "lucide-react";
import { User } from "../types";
import { useFetch } from "../hooks/useFetch";

export default function AdminPanel() {
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: users, refetch: refetchUsers } = useFetch<User[]>("/api/admin/users");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (data.success) {
      setIsAuthorized(true);
      setError("");
    } else {
      setError("Invalid password. Access denied.");
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    const res = await fetch(`/api/admin/user/${userId}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });
    if (res.ok) {
      refetchUsers();
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md glass rounded-3xl p-8 border border-white/5"
        >
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-8 mx-auto">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter text-center mb-2">Admin Access</h1>
          <p className="text-white/40 text-center mb-8">Enter the master password to continue.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-accent transition-all"
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm ml-4">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            <button 
              type="submit"
              className="w-full bg-accent text-bg py-4 rounded-2xl font-bold hover:scale-[1.02] transition-transform active:scale-95"
            >
              Verify Identity
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const filteredUsers = users?.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  return (
    <div className="pt-24 px-6 md:px-16 min-h-screen pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-bg">
              <Shield size={24} />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">Admin Control</h1>
          </div>
          <p className="text-white/40 max-w-lg">Manage users, enforce community guidelines, and monitor platform activity.</p>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-full pl-12 pr-6 py-3 text-sm focus:outline-none focus:border-accent transition-all w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Management List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-6 ml-4">
            <Users size={20} className="text-accent" />
            <h2 className="text-xl font-bold tracking-tight">Active Users</h2>
          </div>
          
          {filteredUsers.map((user) => (
            <motion.div 
              key={user.id}
              layout
              className="glass rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/5"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white/40 font-bold">
                  {user.username[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{user.username}</h3>
                    {user.role === "admin" && (
                      <span className="bg-accent/10 text-accent text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Admin</span>
                    )}
                  </div>
                  <p className="text-xs text-white/40">ID: {user.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {user.isBanned ? (
                  <button 
                    onClick={() => handleUserAction(user.id, "unban")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 text-green-500 text-xs font-bold hover:bg-green-500/20 transition-all"
                  >
                    <CheckCircle size={16} /> Unban
                  </button>
                ) : (
                  <button 
                    onClick={() => handleUserAction(user.id, "ban")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-all"
                  >
                    <Ban size={16} /> Ban
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats & Activity */}
        <div className="space-y-8">
          <div className="glass rounded-3xl p-8 border border-white/5">
            <h3 className="text-lg font-bold mb-6">Platform Stats</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-sm">Total Users</span>
                <span className="font-bold">{users?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-sm">Banned Users</span>
                <span className="font-bold text-red-500">{users?.filter(u => u.isBanned).length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-sm">Active Streams</span>
                <span className="font-bold text-accent">1,248</span>
              </div>
            </div>
          </div>

          <div className="glass rounded-3xl p-8 border border-white/5 bg-accent/5">
            <div className="flex items-center gap-3 mb-4 text-accent">
              <AlertCircle size={20} />
              <h3 className="font-bold">Admin Notice</h3>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              All actions are logged. Misuse of admin privileges will result in immediate revocation of access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
