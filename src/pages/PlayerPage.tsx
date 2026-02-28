import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Settings, Maximize, Minimize, Subtitles, ChevronLeft, Star, Clock, Download, Share2, MessageSquare, Users, MonitorPlay, List } from "lucide-react";
import { Media, Episode } from "../types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function PlayerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [media, setMedia] = useState<Media | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [isPip, setIsPip] = useState(false);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState("Japanese");
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [activeTab, setActiveTab] = useState<"comments" | "reviews">("comments");
  
  const [error, setError] = useState<string | null>(null);
  const [longPressSpeed, setLongPressSpeed] = useState(2); // Default long press speed
  
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  const user = JSON.parse(localStorage.getItem("pika_user") || "{}");

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await fetch(`/api/media/${id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          username: user.username,
          avatar: user.avatar,
          text: commentText
        })
      });
      if (res.ok) {
        const newComment = await res.json();
        setMedia(prev => prev ? { ...prev, comments: [newComment, ...(prev.comments || [])] } : null);
        setCommentText("");
      }
    } catch (err) {
      console.error("Failed to post comment", err);
    }
  };

  const handlePostReview = async () => {
    if (!reviewText.trim()) return;
    try {
      const res = await fetch(`/api/media/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          username: user.username,
          rating: reviewRating,
          comment: reviewText
        })
      });
      if (res.ok) {
        const newReview = await res.json();
        setMedia(prev => prev ? { ...prev, reviews: [newReview, ...(prev.reviews || [])] } : null);
        setReviewText("");
      }
    } catch (err) {
      console.error("Failed to post review", err);
    }
  };

  useEffect(() => {
    fetch(`/api/media/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch media");
        return res.json();
      })
      .then(data => {
        setMedia(data);
        if (data.episodes && data.episodes.length > 0) {
          setCurrentEpisode(data.episodes[0]);
        }
        // Immediate playback simulation
        setIsPlaying(true);
      })
      .catch(err => {
        console.error(err);
        setError("Unable to load media. Please try again later.");
      });
  }, [id]);

  const handleLongPressStart = () => {
    longPressTimeout.current = setTimeout(() => {
      setPlaybackSpeed(longPressSpeed);
    }, 500); // 500ms for long press
  };

  const handleLongPressEnd = () => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
    }
    setPlaybackSpeed(1);
  };

  const toggleFullscreen = async () => {
    const elem = videoRef.current;
    if (!elem) return;

    try {
      if (!document.fullscreenElement) {
        await elem.requestFullscreen();
        // Try to lock orientation to landscape
        if (screen.orientation && (screen.orientation as any).lock) {
          await (screen.orientation as any).lock("landscape").catch((err: any) => {
            console.warn("Orientation lock failed:", err);
          });
        }
      } else {
        await document.exitFullscreen();
        // Try to unlock orientation
        if (screen.orientation && (screen.orientation as any).unlock) {
          (screen.orientation as any).unlock();
        }
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.code === "ArrowRight") {
        setProgress(prev => Math.min(100, prev + 5));
      } else if (e.code === "ArrowLeft") {
        setProgress(prev => Math.max(0, prev - 5));
      } else if (e.code === "KeyM") {
        setIsMuted(prev => !prev);
      } else if (e.code === "KeyF") {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
      controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress(prev => (prev >= 100 ? 100 : prev + 0.1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const handleDownload = async () => {
    if (!media) return;
    try {
      const res = await fetch("/api/downloads/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaId: media.id,
          title: media.title,
          image: media.image
        })
      });
      if (res.ok) {
        alert("Download started! You can find it in your Offline Library.");
      }
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-bg flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-6">
          <Settings size={40} className="animate-spin-slow" />
        </div>
        <h2 className="text-3xl font-bold mb-2 tracking-tighter">Oops! Something went wrong</h2>
        <p className="text-white/40 mb-8 max-w-md">{error}</p>
        <button 
          onClick={() => navigate("/")}
          className="bg-accent text-bg px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (!media) return (
    <div className="fixed inset-0 bg-bg flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div 
      ref={videoRef}
      className="fixed inset-0 z-[100] bg-black flex flex-col overflow-hidden select-none"
      onMouseDown={handleLongPressStart}
      onMouseUp={handleLongPressEnd}
      onMouseLeave={handleLongPressEnd}
      onTouchStart={handleLongPressStart}
      onTouchEnd={handleLongPressEnd}
    >
      {/* Video Background (Mock) */}
      <div className="absolute inset-0 bg-surface">
        <img 
          src={currentEpisode?.thumbnail || media.banner} 
          className="w-full h-full object-cover opacity-40 blur-sm"
          alt="Video Background"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          {playbackSpeed > 1 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-3 border border-white/10"
            >
              <SkipForward size={24} className="text-accent animate-pulse" />
              <span className="text-2xl font-bold tracking-tighter">{playbackSpeed}x Speed</span>
            </motion.div>
          )}
          <Play size={120} className="text-white/10" />
        </div>
      </div>

      {/* Top Bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 p-8 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between z-10"
          >
            <div className="flex items-center gap-6">
              <button 
                onClick={() => navigate(-1)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold tracking-tighter">{media.title}</h1>
                <p className="text-sm text-white/60">
                  {currentEpisode ? `S1 : E${currentEpisode.number} • ${currentEpisode.title}` : "S1 : E1 • The Beginning"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowComments(!showComments)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all",
                  showComments ? "bg-accent text-bg" : "bg-white/10 hover:bg-white/20"
                )}
              >
                <MessageSquare size={18} /> Comments
              </button>
              <button 
                onClick={() => setShowEpisodes(!showEpisodes)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all",
                  showEpisodes ? "bg-accent text-bg" : "bg-white/10 hover:bg-white/20"
                )}
              >
                <List size={18} /> Episodes
              </button>
              <button className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm font-bold hover:bg-accent hover:text-bg transition-all">
                <Users size={18} /> Watch Party
              </button>
              <button 
                onClick={handleDownload}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <Download size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comments & Reviews Sidebar */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="absolute top-0 right-0 bottom-0 w-96 bg-bg/95 backdrop-blur-xl border-l border-white/5 z-50 p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex gap-4">
                <button 
                  onClick={() => setActiveTab("comments")}
                  className={cn("text-xl font-bold tracking-tighter transition-colors", activeTab === "comments" ? "text-accent" : "text-white/40")}
                >
                  Comments
                </button>
                <button 
                  onClick={() => setActiveTab("reviews")}
                  className={cn("text-xl font-bold tracking-tighter transition-colors", activeTab === "reviews" ? "text-accent" : "text-white/40")}
                >
                  Reviews
                </button>
              </div>
              <button onClick={() => setShowComments(false)} className="p-2 hover:bg-white/5 rounded-full">
                <ChevronLeft size={20} className="rotate-180" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
              {activeTab === "comments" ? (
                <>
                  <div className="space-y-4">
                    <div className="relative">
                      <textarea 
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-accent transition-all resize-none"
                        rows={3}
                      />
                      <button 
                        onClick={handlePostComment}
                        className="absolute bottom-4 right-4 bg-accent text-bg px-4 py-1.5 rounded-lg text-xs font-bold hover:scale-105 transition-transform"
                      >
                        Post
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {media.comments?.map((comment) => (
                      <div key={comment.id} className="flex gap-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-white/10">
                          <img src={comment.avatar} alt={comment.username} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold">{comment.username}</span>
                            <span className="text-[10px] text-white/20">{new Date(comment.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-white/60 leading-relaxed">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4 bg-white/5 p-6 rounded-3xl border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star} 
                          onClick={() => setReviewRating(star)}
                          className={cn("transition-colors", star <= reviewRating ? "text-yellow-500" : "text-white/10")}
                        >
                          <Star size={20} fill={star <= reviewRating ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                    <textarea 
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Write a review..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-accent transition-all resize-none"
                      rows={3}
                    />
                    <button 
                      onClick={handlePostReview}
                      className="w-full bg-accent text-bg py-3 rounded-2xl font-bold hover:scale-[1.02] transition-transform active:scale-95"
                    >
                      Submit Review
                    </button>
                  </div>

                  <div className="space-y-6">
                    {media.reviews?.map((review) => (
                      <div key={review.id} className="glass rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold">{review.username}</span>
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star size={12} fill="currentColor" />
                            <span className="text-xs font-bold">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed">{review.comment}</p>
                        <p className="text-[10px] text-white/20 mt-2">{new Date(review.date).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Episode Sidebar */}
      <AnimatePresence>
        {showEpisodes && media.episodes && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="absolute top-0 right-0 bottom-0 w-80 bg-bg/95 backdrop-blur-xl border-l border-white/5 z-50 p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold tracking-tighter">Episodes</h3>
              <button onClick={() => setShowEpisodes(false)} className="p-2 hover:bg-white/5 rounded-full">
                <ChevronLeft size={20} className="rotate-180" />
              </button>
            </div>
            <div className="space-y-4">
              {media.episodes.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => {
                    setCurrentEpisode(ep);
                    setProgress(0);
                    setShowEpisodes(false);
                  }}
                  className={cn(
                    "w-full text-left p-3 rounded-xl transition-all flex gap-4 group",
                    currentEpisode?.id === ep.id ? "bg-accent/10 border border-accent/30" : "hover:bg-white/5 border border-transparent"
                  )}
                >
                  <div className="w-24 h-14 rounded-lg overflow-hidden flex-shrink-0 relative">
                    <img src={ep.thumbnail} className="w-full h-full object-cover" alt={ep.title} />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play size={16} fill="currentColor" />
                    </div>
                  </div>
                  <div>
                    <p className={cn("text-xs font-bold mb-1", currentEpisode?.id === ep.id ? "text-accent" : "text-white")}>
                      EP {ep.number}
                    </p>
                    <p className="text-[10px] text-white/40 line-clamp-2">{ep.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 flex items-center justify-center gap-12 z-10"
          >
            <button className="p-4 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
              <SkipBack size={32} fill="currentColor" />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-24 h-24 bg-accent text-bg rounded-full flex items-center justify-center hover:scale-110 transition-transform"
            >
              {isPlaying ? <Pause size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" className="ml-2" />}
            </button>
            <button className="p-4 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
              <SkipForward size={32} fill="currentColor" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent z-10"
          >
            {/* Progress Bar */}
            <div className="relative h-1.5 w-full bg-white/10 rounded-full mb-8 group cursor-pointer">
              <div 
                className="absolute top-0 left-0 h-full bg-accent rounded-full" 
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-accent rounded-full scale-0 group-hover:scale-100 transition-transform shadow-xl" />
              </div>
              <div className="absolute -top-8 left-[45%] bg-accent text-bg text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                12:45 / 24:00
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-4">
                  <button onClick={() => setIsMuted(!isMuted)} className="text-white/60 hover:text-white transition-colors">
                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                  </button>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={isMuted ? 0 : volume} 
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="w-24 accent-accent h-1 bg-white/10 rounded-full cursor-pointer"
                  />
                </div>
                <div className="text-sm font-mono text-white/60">
                  <span className="text-white">12:45</span> / 24:00
                </div>
              </div>

              <div className="flex items-center gap-6">
                <button className="flex items-center gap-2 text-sm font-bold bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-colors">
                  Skip Intro
                </button>
                <button className="text-white/60 hover:text-white transition-colors">
                  <Subtitles size={24} />
                </button>
                <button 
                  onClick={() => setIsPip(!isPip)}
                  className={isPip ? "text-accent" : "text-white/60 hover:text-white"}
                >
                  <MonitorPlay size={24} />
                </button>
                <div className="relative">
                  <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <Settings size={24} />
                  </button>
                  
                  {showSettings && (
                    <div className="absolute bottom-full right-0 mb-4 w-48 glass rounded-2xl p-4 space-y-4">
                      <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-widest text-white/40">Audio Language</p>
                        <div className="flex flex-wrap gap-2">
                          {(media.languages || ["Japanese"]).map(lang => (
                            <button 
                              key={lang}
                              onClick={() => setCurrentLanguage(lang)}
                              className={`px-2 py-1 rounded text-xs font-bold ${currentLanguage === lang ? "bg-accent text-bg" : "bg-white/5"}`}
                            >
                              {lang}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-widest text-white/40">Playback Speed</p>
                        <div className="flex flex-wrap gap-2">
                          {[0.5, 1, 1.5, 2].map(speed => (
                            <button 
                              key={speed}
                              onClick={() => setPlaybackSpeed(speed)}
                              className={`px-2 py-1 rounded text-xs font-bold ${playbackSpeed === speed ? "bg-accent text-bg" : "bg-white/5"}`}
                            >
                              {speed}x
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-widest text-white/40">Quality</p>
                        <div className="flex flex-wrap gap-2">
                          {["4K", "1080p", "720p", "Auto"].map(q => (
                            <button key={q} className={`px-2 py-1 rounded text-xs font-bold ${q === "Auto" ? "bg-accent text-bg" : "bg-white/5"}`}>
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <p className="text-[10px] uppercase tracking-widest text-white/40">Long Press Speed</p>
                        <div className="flex flex-wrap gap-2">
                          {[2, 3, 4, 5].map(speed => (
                            <button 
                              key={speed}
                              onClick={() => setLongPressSpeed(speed)}
                              className={`px-2 py-1 rounded text-xs font-bold ${longPressSpeed === speed ? "bg-accent text-bg" : "bg-white/5"}`}
                            >
                              {speed}x
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <button 
                  onClick={toggleFullscreen}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <Maximize size={24} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resume Watching Prompt */}
      <AnimatePresence>
        {progress === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 glass rounded-2xl p-6 flex items-center gap-6 z-20"
          >
            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center text-accent">
              <Clock size={24} />
            </div>
            <div>
              <p className="font-bold">Resume Watching?</p>
              <p className="text-xs text-white/40">You were at 12:45 last time.</p>
            </div>
            <button 
              onClick={() => setProgress(45)}
              className="bg-accent text-bg px-6 py-2 rounded-xl font-bold hover:scale-105 transition-transform"
            >
              Resume
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
