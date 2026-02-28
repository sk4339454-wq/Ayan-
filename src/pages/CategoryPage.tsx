import { useState, useEffect } from "react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, ChevronDown, Star, Play, Search, X, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { Media, GENRES } from "../types";

export default function CategoryPage({ type, title }: { type: string; title: string }) {
  const [media, setMedia] = useState<Media[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<Media[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Popularity");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const query = new URLSearchParams({
      type,
      genre: selectedGenre || "",
      year: selectedYear?.toString() || "",
      search: searchQuery
    });

    fetch(`/api/media?${query.toString()}`)
      .then(res => res.json())
      .then(data => {
        setMedia(data);
        setFilteredMedia(data);
      })
      .finally(() => setIsLoading(false));
  }, [type, selectedGenre, selectedYear, searchQuery]);

  useEffect(() => {
    let result = [...media];
    
    if (sortBy === "Rating") {
      result.sort((a, b) => Number(b.rating) - Number(a.rating));
    } else if (sortBy === "Year") {
      result.sort((a, b) => b.year - a.year);
    }
    
    setFilteredMedia(result);
  }, [sortBy, media]);

  const handleDownload = async (e: React.MouseEvent, item: Media) => {
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
    <div className="pt-24 px-6 md:px-16 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">{title}</h1>
          <p className="text-white/40 max-w-lg">
            Explore our curated collection of {title.toLowerCase()}. Filter by genre, rating, or release year to find your next favorite.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search titles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-surface border border-white/5 rounded-full pl-12 pr-6 py-2 text-sm focus:outline-none focus:border-accent/50 transition-colors w-64"
            />
          </div>
          
          <div className="flex items-center gap-2 bg-surface border border-white/5 rounded-full px-4 py-2 text-sm">
            <span className="text-white/40">Year:</span>
            <input 
              type="number" 
              placeholder="Any"
              value={selectedYear || ""}
              onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
              className="bg-transparent focus:outline-none w-16 text-center"
            />
          </div>

          <div className="flex items-center gap-2 bg-surface border border-white/5 rounded-full px-4 py-2 text-sm">
            <Filter size={16} className="text-accent" />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="Popularity">Popularity</option>
              <option value="Rating">Rating</option>
              <option value="Year">Release Year</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Genre Pills */}
      <div className="flex gap-3 overflow-x-auto pb-8 no-scrollbar">
        <button
          onClick={() => setSelectedGenre(null)}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
            selectedGenre === null ? "bg-accent text-bg" : "bg-surface border border-white/5 text-white/60 hover:border-white/20"
          }`}
        >
          All Genres
        </button>
        {GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedGenre === genre ? "bg-accent text-bg" : "bg-surface border border-white/5 text-white/60 hover:border-white/20"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredMedia.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Link to={`/player/${item.id}`} className="group block">
                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-surface border border-white/5 mb-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="w-full space-y-2">
                      <div className="flex items-center gap-1 mb-1">
                        <Star size={12} className="text-accent" fill="currentColor" />
                        <span className="text-xs font-bold">{item.rating}</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-grow bg-white text-bg py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                          <Play size={14} fill="currentColor" />
                          Watch
                        </button>
                        <button 
                          onClick={(e) => handleDownload(e, item)}
                          className="bg-white/10 backdrop-blur-md text-white p-2 rounded-lg hover:bg-accent hover:text-bg transition-all"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-sm line-clamp-1 group-hover:text-accent transition-colors">{item.title}</h3>
                <p className="text-xs text-white/40 mt-1">{item.year} • {item.genre[0]}</p>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredMedia.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-white/20">
          <X size={64} strokeWidth={1} />
          <p className="mt-4 text-xl font-medium">No results found matching your filters</p>
          <button 
            onClick={() => { setSelectedGenre(null); setSearchQuery(""); }}
            className="mt-6 text-accent hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
