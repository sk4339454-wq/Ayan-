import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, Upload, Shield, Lock, Trash2, Play, HardDrive, MoreVertical, FileText, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { StorageItem } from "../types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function StoragePage() {
  const [items, setItems] = useState<StorageItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isVaultLocked, setIsVaultLocked] = useState(true);
  const [vaultPassword, setVaultPassword] = useState("");
  const [showVault, setShowVault] = useState(false);

  useEffect(() => {
    fetch("/api/storage").then(res => res.json()).then(setItems);
  }, []);

  const onDrop = (acceptedFiles: File[]) => {
    setIsUploading(true);
    // Simulate upload
    setTimeout(() => {
      const file = acceptedFiles[0];
      fetch("/api/storage/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, size: (file.size / (1024 * 1024)).toFixed(1) + "MB" })
      })
      .then(res => res.json())
      .then(newItem => {
        setItems(prev => [newItem, ...prev]);
        setIsUploading(false);
      });
    }, 2000);
  };

  // @ts-ignore
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop
  });

  const storageData = [
    { name: "Used", value: 45, color: "#F27D26" },
    { name: "Free", value: 55, color: "rgba(255,255,255,0.1)" },
  ];

  const handleUnlockVault = () => {
    if (vaultPassword === "1234") {
      setIsVaultLocked(false);
    } else {
      alert("Incorrect password. Hint: 1234");
    }
  };

  return (
    <div className="pt-24 px-6 md:px-16 min-h-screen pb-20" {...getRootProps()}>
      <input {...getInputProps()} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Dashboard & Upload */}
        <div className="lg:col-span-1 space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter mb-4 flex items-center gap-3">
              <Cloud className="text-accent" /> Cloud Storage
            </h1>
            <p className="text-white/40">Securely upload and stream your legally owned anime collection from anywhere.</p>
          </div>

          {/* Storage Usage Card */}
          <div className="glass rounded-3xl p-8">
            <h3 className="font-bold mb-6 flex items-center justify-between">
              Storage Usage
              <span className="text-xs text-white/40 font-normal">45.2 GB / 100 GB</span>
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={storageData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {storageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#121212", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                    itemStyle={{ color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-white/60">
                  <div className="w-2 h-2 rounded-full bg-accent" /> Videos
                </span>
                <span>42.8 GB</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-white/60">
                  <div className="w-2 h-2 rounded-full bg-white/20" /> Others
                </span>
                <span>2.4 GB</span>
              </div>
            </div>
            <button className="w-full mt-8 bg-white/5 hover:bg-white/10 border border-white/5 py-3 rounded-xl text-sm font-bold transition-colors">
              Upgrade Capacity
            </button>
          </div>

          {/* Upload Area */}
          <div 
            className={`relative rounded-3xl border-2 border-dashed transition-all p-12 flex flex-col items-center justify-center text-center ${
              isDragActive ? "border-accent bg-accent/5" : "border-white/10 hover:border-white/20"
            }`}
            onClick={() => document.querySelector('input')?.click()}
          >
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-4">
              <Upload size={32} />
            </div>
            <h4 className="font-bold mb-2">Upload Content</h4>
            <p className="text-xs text-white/40 mb-6">Drag and drop your files here or click to browse</p>
            <div className="flex items-center gap-2 text-[10px] text-white/20 uppercase tracking-widest">
              <Shield size={12} /> Encrypted Transfer
            </div>
            
            <AnimatePresence>
              {isUploading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-bg/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-8"
                >
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-4">
                    <motion.div 
                      className="h-full bg-accent"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                    />
                  </div>
                  <p className="text-sm font-bold">Uploading your content...</p>
                  <p className="text-xs text-white/40 mt-1">Processing high-quality stream encoding</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: File List & Vault */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <button className="text-sm font-bold border-b-2 border-accent pb-2">Recent Files</button>
              <button className="text-sm font-bold text-white/40 pb-2 hover:text-white transition-colors">Shared</button>
              <button 
                className="text-sm font-bold text-white/40 pb-2 hover:text-white transition-colors flex items-center gap-2"
                onClick={() => setShowVault(true)}
              >
                <Lock size={14} /> Private Vault
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <HardDrive size={14} /> Total 124 Files
            </div>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass group rounded-2xl p-4 flex items-center justify-between hover:border-accent/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-bg transition-colors">
                    <Play size={20} fill="currentColor" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm group-hover:text-accent transition-colors">{item.name}</h4>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-white/40 uppercase tracking-wider">
                      <span>{item.size}</span>
                      <span>•</span>
                      <span>{item.quality}</span>
                      <span>•</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Private Vault Modal */}
          <AnimatePresence>
            {showVault && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-bg/95 backdrop-blur-xl flex items-center justify-center p-6"
              >
                <div className="max-w-md w-full text-center">
                  {isVaultLocked ? (
                    <motion.div
                      initial={{ y: 20 }}
                      animate={{ y: 0 }}
                    >
                      <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center text-accent mx-auto mb-6">
                        <Lock size={40} />
                      </div>
                      <h2 className="text-3xl font-bold mb-2 tracking-tighter">Private Vault</h2>
                      <p className="text-white/40 mb-8">Enter your security code to access hidden content.</p>
                      
                      <div className="flex flex-col gap-4">
                        <input
                          type="password"
                          placeholder="Enter PIN"
                          value={vaultPassword}
                          onChange={(e) => setVaultPassword(e.target.value)}
                          className="bg-surface border border-white/5 rounded-2xl px-6 py-4 text-center text-2xl tracking-[1em] focus:outline-none focus:border-accent transition-colors"
                        />
                        <button 
                          onClick={handleUnlockVault}
                          className="bg-accent text-bg font-bold py-4 rounded-2xl hover:scale-[1.02] transition-transform"
                        >
                          Unlock Vault
                        </button>
                        <button 
                          onClick={() => setShowVault(false)}
                          className="text-white/40 text-sm hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                          <Shield className="text-accent" /> Secure Vault
                        </h2>
                        <button 
                          onClick={() => { setIsVaultLocked(true); setShowVault(false); }}
                          className="p-2 hover:bg-white/5 rounded-full"
                        >
                          <Lock size={20} className="text-accent" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-4 text-left">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center text-accent">
                            <AlertCircle size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-sm">No hidden files yet</p>
                            <p className="text-xs text-white/40">Move files here to hide them from the main library.</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
