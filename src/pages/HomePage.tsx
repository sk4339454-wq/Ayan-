import { useState, useEffect, useMemo } from "react";
import React from "react";
import { motion } from "framer-motion";
import { Play, Info, Star, ChevronRight, PlayCircle, Clock, TrendingUp, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { Media } from "../types";
import { useFetch } from "../hooks/useFetch";
import { SectionSkeleton } from "../components/Skeletons";

const HeroSlider = ({ media }: { media: Media[] }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (media.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % media.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [media.length]);

  if (!media.length) return <div className="h-[85vh] bg-surface animate-pulse" />;

  const active = media[current];

  return (
    <div className="relative h-[85vh] w-full overflow-hidden">
      <motion.div
        key={active.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0"
      >
        <img
          src={active.banner}
          alt={active.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />
      </motion.div>

      <div className="absolute inset-0 flex items-center px-6 md:px-16">
        <div className="max-w-2xl">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-4"
          >
            <span className="bg-accent text-bg text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              {active.type}
            </span>
            <div className="flex items-center gap-1 text-accent">
              <Star size={14} fill="currentColor" />
              <span className="text-sm font-bold">{active.rating}</span>
            </div>
            <span className="text-white/40 text-sm">{active.year}</span>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-[0.9]"
          >
            {active.title}
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/60 text-lg mb-8 line-clamp-3 max-w-lg"
          >
            {active.description}
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-4"
          >
            <Link
              to={`/player/${active.id}`}
              className="bg-white text-bg px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-accent hover:text-bg transition-colors"
            >
              <Play size={20} fill="currentColor" />
              Watch Now
            </Link>
            <button className="bg-white/10 backdrop-blur-md text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-white/20 transition-colors">
              <Info size={20} />
              More Info
            </button>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-12 right-12 flex gap-2">
        {media.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              current === idx ? "bg-accent w-8" : "bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const MediaCard = ({ item }: { item: Media }) => {
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch("/api/downloads/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaId: item.id,
          title: item.title,
          image: item.image
        })
      });
      if (res.ok) {
        alert(`Download started for ${item.title}!`);
      }
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  return (
    <Link to={`/player/${item.id}`} className="group relative flex-shrink-0 w-48 md:w-64">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-surface border border-white/5 transition-transform duration-500 group-hover:scale-105">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star size={12} className="text-accent" fill="currentColor" />
            <span className="text-xs font-bold">{item.rating}</span>
          </div>
          <h3 className="font-bold text-sm line-clamp-1">{item.title}</h3>
          <p className="text-[10px] text-white/60 uppercase tracking-widest mt-1">
            {item.genre.slice(0, 2).join(" • ")}
          </p>
        </div>
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-bg shadow-xl">
            <Play size={20} fill="currentColor" />
          </div>
          <button 
            onClick={handleDownload}
            className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-xl hover:bg-accent hover:text-bg transition-colors"
          >
            <Download size={18} />
          </button>
        </div>
      </div>
    </Link>
  );
};

const Section = ({ title, items, icon: Icon, loading }: { title: string; items: Media[]; icon?: any; loading?: boolean }) => {
  if (loading) return <SectionSkeleton />;
  if (items.length === 0) return null;

  return (
    <section className="py-12 px-6 md:px-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="text-accent" size={24} />}
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        </div>
        <Link to="/anime" className="text-sm text-white/40 hover:text-accent flex items-center gap-1 transition-colors">
          View All <ChevronRight size={16} />
        </Link>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide no-scrollbar">
        {items.map((item) => (
          <div key={item.id}>
            <MediaCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default function HomePage() {
  const { data: trending, loading: trendingLoading } = useFetch<Media[]>("/api/media/trending");
  const { data: popular, loading: popularLoading } = useFetch<Media[]>("/api/media/popular");
  const { data: airing, loading: airingLoading } = useFetch<Media[]>("/api/media/airing");
  const { data: allMedia, loading: allLoading } = useFetch<Media[]>("/api/media");

  const featured = useMemo(() => allMedia?.slice(0, 4) || [], [allMedia]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-20"
    >
      <HeroSlider media={featured} />
      
      <div className="relative z-10 -mt-20">
        <Section title="Trending Now" items={trending || []} icon={TrendingUp} loading={trendingLoading} />
        <Section title="Airing Today" items={airing || []} icon={Clock} loading={airingLoading} />
        <Section title="Continue Watching" items={popular?.slice(0, 2) || []} icon={Clock} loading={popularLoading} />
        <Section title="Popular Series" items={popular || []} icon={Star} loading={popularLoading} />
        
        {/* Recommendation Banner */}
        <div className="px-6 md:px-16 py-12">
          <div className="relative h-64 rounded-3xl overflow-hidden bg-accent/10 border border-accent/20 flex items-center px-12 group">
            <div className="max-w-md relative z-10">
              <h3 className="text-3xl font-bold mb-4">AI Recommendations</h3>
              <p className="text-white/60 mb-6">Our smart engine analyzes your watch history to suggest titles you'll love. Personalized just for you.</p>
              <button className="bg-accent text-bg px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform active:scale-95">
                Explore Picks
              </button>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-accent/20 to-transparent flex items-center justify-center">
               <PlayCircle size={120} className="text-accent/20 transition-transform duration-700 group-hover:scale-110" />
            </div>
          </div>
        </div>

        <Section title="Recently Added" items={[...(trending || [])].reverse()} loading={trendingLoading} />
      </div>
    </motion.div>
  );
}
