import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Trash2, Play, Clock, HardDrive, Shield, AlertCircle, ChevronRight, Pause, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { DownloadItem } from "../types";

export default function OfflinePage() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/downloads").then(res => res.json()).then(setDownloads);
  }, []);

  const handleDelete = (id: string) => {
    setIsDeleting(id);
    fetch(`/api/downloads/${id}`, { method: "DELETE" })
      .then(() => {
        setDownloads(prev => prev.filter(d => d.id !== id));
        setIsDeleting(null);
      });
  };

  const completed = downloads.filter(d => d.status === "Completed");
  const active = downloads.filter(d => d.status !== "Completed");

  return (
    <div className="pt-24 px-6 md:px-16 min-h-screen pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 flex items-center gap-4">
            <Download className="text-accent" /> Offline Library
          </h1>
          <p className="text-white/40 max-w-lg">
            Access your downloaded anime anytime, anywhere. No internet connection required for these titles.
          </p>
        </div>
        
        <div className="flex items-center gap-6 glass rounded-2xl px-6 py-4">
          <div className="flex items-center gap-3">
            <HardDrive size={20} className="text-accent" />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40">Offline Storage</p>
              <p className="font-bold text-sm">2.2 GB Used</p>
            </div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-accent" />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40">Security</p>
              <p className="font-bold text-sm">DRM Protected</p>
            </div>
          </div>
        </div>
      </div>

      {active.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Clock size={20} className="text-accent" /> Active Downloads
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {active.map((item) => (
              <div key={item.id} className="glass rounded-2xl p-4 flex gap-4 items-center">
                <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 relative">
                  <img src={item.image} className="w-full h-full object-cover opacity-50" alt={item.title} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-sm line-clamp-1">{item.title}</h3>
                    <span className="text-[10px] font-bold text-accent">{item.progress}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-accent"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">{item.status}...</span>
                    <div className="flex gap-2">
                      <button className="p-1 hover:text-accent transition-colors"><Pause size={14} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <PlayCircle size={20} className="text-accent" /> Ready to Watch
        </h2>
        {completed.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {completed.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group"
              >
                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-surface border border-white/5 mb-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="w-full space-y-2">
                      <Link 
                        to={`/player/${item.mediaId}`}
                        className="w-full bg-white text-bg py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                      >
                        <Play size={14} fill="currentColor" />
                        Play Offline
                      </Link>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="w-full bg-red-500/20 text-red-500 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className="bg-accent text-bg p-1.5 rounded-full shadow-xl">
                      <Download size={14} />
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-sm line-clamp-1 group-hover:text-accent transition-colors">{item.title}</h3>
                <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">{item.size} • {item.date}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-white/20 border-2 border-dashed border-white/5 rounded-3xl">
            <AlertCircle size={64} strokeWidth={1} />
            <p className="mt-4 text-xl font-medium">No offline content available</p>
            <Link to="/anime" className="mt-6 text-accent hover:underline flex items-center gap-2">
              Browse Anime to Download <ChevronRight size={16} />
            </Link>
          </div>
        )}
      </section>

      {/* Storage Management Card */}
      <div className="mt-20 glass rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
            <HardDrive size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">Manage Offline Storage</h3>
            <p className="text-white/40 text-sm">You have 47.8 GB of free space remaining on this device.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-colors">
            Clear All Downloads
          </button>
          <button className="px-6 py-3 bg-accent text-bg rounded-xl text-sm font-bold hover:scale-105 transition-transform">
            Storage Settings
          </button>
        </div>
      </div>
    </div>
  );
}
