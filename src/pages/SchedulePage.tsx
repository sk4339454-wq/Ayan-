import { useState, useEffect } from "react";
import React from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, ChevronRight, Play, Star, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { Media } from "../types";
import { useFetch } from "../hooks/useFetch";

interface AiringMedia extends Media {
  airingAt: number;
  episode: number;
}

export default function SchedulePage() {
  const { data: airing, loading } = useFetch<AiringMedia[]>("/api/media/airing");

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="pt-32 px-6 md:px-16 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 md:px-16 min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-3 text-accent mb-4">
              <Calendar size={24} />
              <span className="text-sm font-bold uppercase tracking-widest">Airing Schedule</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">Release Calendar</h1>
            <p className="text-white/40 max-w-xl">
              Stay up to date with the latest anime releases. Every episode is published here as soon as it airs officially.
            </p>
          </div>
          
          <div className="bg-surface border border-white/5 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest">Current Time</p>
              <p className="text-lg font-bold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          {airing && airing.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {airing.map((item, idx) => (
                <motion.div
                  key={`${item.id}-${idx}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative bg-surface border border-white/5 rounded-3xl overflow-hidden hover:border-accent/30 transition-all"
                >
                  <div className="flex flex-col md:flex-row items-center">
                    <div className="w-full md:w-64 aspect-video md:aspect-[4/3] overflow-hidden relative">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-60" />
                      <div className="absolute bottom-4 left-4">
                        <span className="bg-accent text-bg text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          EP {item.episode}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div className="max-w-xl">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-accent font-mono text-sm">{formatTime(item.airingAt)}</span>
                          <span className="text-white/20">•</span>
                          <span className="text-white/40 text-xs uppercase tracking-widest">{formatDate(item.airingAt)}</span>
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight mb-2 group-hover:text-accent transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-white/40 line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right hidden lg:block">
                          <div className="flex items-center gap-1 text-accent justify-end mb-1">
                            <Star size={14} fill="currentColor" />
                            <span className="text-sm font-bold">{item.rating}</span>
                          </div>
                          <p className="text-[10px] text-white/20 uppercase tracking-widest">{item.genre[0]}</p>
                        </div>
                        <Link 
                          to={`/player/${item.id}`}
                          className="bg-white text-bg px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-accent hover:text-bg transition-all active:scale-95"
                        >
                          <Play size={18} fill="currentColor" />
                          Watch Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/10 mx-auto mb-6">
                <Calendar size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-2">No airings scheduled</h3>
              <p className="text-white/40">Check back later for the latest updates.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
