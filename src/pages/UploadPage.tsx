import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileVideo, CheckCircle, AlertTriangle, ShieldCheck, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UploadPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [season, setSeason] = useState("1");
  const [episodeNumber, setEpisodeNumber] = useState("1");
  const [languages, setLanguages] = useState("Japanese, English");
  const [isCopyrightFree, setIsCopyrightFree] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCopyrightFree) {
      alert("You must confirm that this content is copyright-free or owned by you.");
      return;
    }

    setIsUploading(true);
    try {
      const res = await fetch("/api/media/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          season: parseInt(season),
          episodeNumber: parseInt(episodeNumber),
          languages: languages.split(",").map(l => l.trim()),
          uploaderId: "user-1", // Mock current user
          isCopyrightFree,
          role: "user" // Mock role
        })
      });
      
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/"), 3000);
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-8 mx-auto">
            <CheckCircle size={48} />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter mb-4">Upload Successful!</h1>
          <p className="text-white/40 mb-8">Your video is being processed and will be available shortly.</p>
          <button 
            onClick={() => navigate("/")}
            className="bg-accent text-bg px-8 py-3 rounded-full font-bold"
          >
            Go to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 px-6 md:px-16 min-h-screen pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">Share Your Content</h1>
          <p className="text-white/40 max-w-lg">Upload your own copyright-free videos or songs to the PIKA community.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <form onSubmit={handleUpload} className="space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Anime Title</label>
              <input 
                required
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Naruto Shippuden"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-accent transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Season</label>
                <input 
                  required
                  type="number" 
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  placeholder="1"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-accent transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Episode Number</label>
                <input 
                  required
                  type="number" 
                  value={episodeNumber}
                  onChange={(e) => setEpisodeNumber(e.target.value)}
                  placeholder="1"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-accent transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Audio Languages (comma separated)</label>
              <input 
                required
                type="text" 
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                placeholder="Japanese, English, Spanish"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-accent transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Description</label>
              <textarea 
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us about your video..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-accent transition-all resize-none"
              />
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-start gap-4">
                <input 
                  type="checkbox" 
                  id="copyright"
                  checked={isCopyrightFree}
                  onChange={(e) => setIsCopyrightFree(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-white/10 bg-white/5 text-accent focus:ring-accent"
                />
                <label htmlFor="copyright" className="text-sm text-white/60 leading-relaxed cursor-pointer">
                  I confirm that this video is my own original work or is copyright-free. I understand that uploading copyrighted material without permission may result in a ban.
                </label>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isUploading}
              className="w-full bg-accent text-bg py-4 rounded-2xl font-bold hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
            >
              {isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Publish Video
                </>
              )}
            </button>
          </form>

          <div className="space-y-8">
            <div className="glass rounded-3xl p-8 border border-white/5">
              <div className="flex items-center gap-3 mb-6 text-accent">
                <ShieldCheck size={24} />
                <h3 className="text-xl font-bold tracking-tight">Community Guidelines</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex gap-3 text-sm text-white/60">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 flex-shrink-0" />
                  Only upload content you own or have rights to.
                </li>
                <li className="flex gap-3 text-sm text-white/60">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 flex-shrink-0" />
                  No explicit, violent, or hateful content.
                </li>
                <li className="flex gap-3 text-sm text-white/60">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 flex-shrink-0" />
                  Respect other creators and their work.
                </li>
              </ul>
            </div>

            <div className="glass rounded-3xl p-8 border border-white/5 bg-yellow-500/5">
              <div className="flex items-center gap-3 mb-4 text-yellow-500">
                <AlertTriangle size={20} />
                <h3 className="font-bold">Copyright Notice</h3>
              </div>
              <p className="text-sm text-white/40 leading-relaxed">
                Our automated system scans all uploads for copyrighted material. If a violation is detected, your content will be removed and your account may be penalized.
              </p>
            </div>

            <div className="flex items-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white/40">
                <FileVideo size={24} />
              </div>
              <div>
                <p className="text-sm font-bold">Supported Formats</p>
                <p className="text-xs text-white/40">MP4, MKV, MOV (Max 2GB)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
