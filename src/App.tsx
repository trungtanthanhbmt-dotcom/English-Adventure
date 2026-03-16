/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Play, Gamepad2, Dice5, ClipboardList, 
  Settings, Plus, Trash2, Save, Upload, Mic, 
  Volume2, Edit3, Check, X, User, Shield, 
  Video, Image as ImageIcon, FileSpreadsheet, Wand2,
  Move, Palette, MoreHorizontal, Layout, Cloud, CloudOff, Wifi, WifiOff,
  Loader2, AlertCircle, Trophy, Star, Share2, Sparkles, Map as MapIcon,
  ChevronLeft, ChevronRight, GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- FIREBASE IMPORTS & SETUP ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { 
  getFirestore, collection, doc, addDoc, updateDoc, 
  deleteDoc, onSnapshot, query, orderBy, setDoc, enableIndexedDbPersistence 
} from 'firebase/firestore';

// Note: In a real applet environment, firebase-applet-config.json would be used.
// For this UI-focused update, we assume the logic remains consistent.
const firebaseConfig = {
  apiKey: "placeholder",
  authDomain: "placeholder",
  projectId: "placeholder",
  storageBucket: "placeholder",
  messagingSenderId: "placeholder",
  appId: "placeholder"
};

// Initialize Firebase (Standard Pattern)
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.warn("Firebase initialization failed. Using mock data for preview.");
}

const appId = 'english-adventure-v1';

// --- CONSTANTS ---

const AVAILABLE_ICONS = [
  { id: 'book', icon: <BookOpen size={24} />, label: 'Học Từ Vựng' },
  { id: 'video', icon: <Video size={24} />, label: 'Xem Video' },
  { id: 'game', icon: <Gamepad2 size={24} />, label: 'Trò Chơi 1' },
  { id: 'dice', icon: <Dice5 size={24} />, label: 'Trò Chơi 2' },
  { id: 'list', icon: <ClipboardList size={24} />, label: 'Tổng Kết' },
  { id: 'mic', icon: <Mic size={24} />, label: 'Luyện Nói' },
];

const THEMES = [
  { name: 'Sky', bg: 'bg-sky-50', path: 'stroke-sky-400', hex: '#38bdf8', island: 'bg-sky-100' },
  { name: 'Forest', bg: 'bg-emerald-50', path: 'stroke-emerald-400', hex: '#34d399', island: 'bg-emerald-100' },
  { name: 'Candy', bg: 'bg-pink-50', path: 'stroke-pink-400', hex: '#f472b6', island: 'bg-pink-100' },
  { name: 'Sunset', bg: 'bg-orange-50', path: 'stroke-orange-400', hex: '#fb923c', island: 'bg-orange-100' },
  { name: 'Galaxy', bg: 'bg-indigo-50', path: 'stroke-indigo-400', hex: '#818cf8', island: 'bg-indigo-100' },
];

const INITIAL_LECTURES_SEED = [
  {
    id: "demo-lecture-1",
    title: "Thế Giới Động Vật",
    subTitle: "Khám phá các loài vật quanh ta",
    colorTheme: 'Sky',
    bgColor: "bg-sky-50",
    pathColor: "stroke-sky-400",
    createdAt: Date.now(),
    nodes: [
      { id: 'n1', type: 'vocab', label: 'Từ Vựng', icon: 'book', top: 45, left: 15, content: [{ id: 1, word: 'Lion', ipa: '/ˈlaɪ.ən/', meaning: 'Sư tử', example: 'The lion is the king of the jungle.', image: '🦁' }] },
      { id: 'n2', type: 'video', label: 'Bài Giảng', icon: 'video', top: 65, left: 35, videoUrl: 'https://www.youtube.com/embed/S2hX3E7Q2gY' },
      { id: 'n3', type: 'game1', label: 'Luyện Tập', icon: 'game', top: 40, left: 60 },
      { id: 'n4', type: 'summary', label: 'Về Đích', icon: 'list', top: 30, left: 85 },
    ]
  }
];

// --- COMPONENTS ---

const AuthScreen = ({ onLogin, isConnecting }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-sky-400 relative overflow-hidden">
    {/* Decorative Clouds */}
    <motion.div animate={{ x: [0, 50, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute top-20 left-10 text-white/40"><Cloud size={100} fill="currentColor" /></motion.div>
    <motion.div animate={{ x: [0, -40, 0] }} transition={{ duration: 12, repeat: Infinity }} className="absolute bottom-40 right-10 text-white/40"><Cloud size={120} fill="currentColor" /></motion.div>
    
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md text-center border-8 border-sky-200 relative z-10"
    >
      <div className="w-24 h-24 bg-yellow-400 rounded-3xl mx-auto mb-6 flex items-center justify-center text-white font-bold text-5xl shadow-lg border-4 border-white animate-bounce">
        <GraduationCap size={50} />
      </div>
      <h1 className="text-4xl font-black text-sky-600 mb-2 tracking-tight">English Adventure</h1>
      <p className="text-slate-500 mb-10 font-medium text-lg">Học tiếng Anh thật vui!</p>
      
      {isConnecting ? (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-sky-500" size={40} />
          <p className="text-sky-600 font-bold">Đang tải hành trình...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <button 
            onClick={() => onLogin('student')}
            className="w-full group flex items-center gap-4 p-5 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl transition-all shadow-lg hover:shadow-sky-200 transform hover:-translate-y-1"
          >
            <div className="p-3 bg-white/20 rounded-xl"><User size={28} /></div>
            <div className="text-left">
              <span className="block font-black text-xl">Bắt Đầu Học</span>
              <span className="text-sm opacity-80">Dành cho học sinh</span>
            </div>
          </button>
          
          <button 
            onClick={() => onLogin('admin')}
            className="w-full group flex items-center gap-4 p-5 bg-white border-4 border-slate-100 hover:border-sky-400 rounded-2xl transition-all"
          >
            <div className="p-3 bg-slate-100 rounded-xl text-slate-500 group-hover:text-sky-500"><Shield size={28} /></div>
            <div className="text-left">
              <span className="block font-bold text-slate-700 text-lg">Giáo Viên</span>
              <span className="text-sm text-slate-400">Quản lý bài học</span>
            </div>
          </button>
        </div>
      )}
    </motion.div>
  </div>
);

const GameMap = ({ lecture, onNodeClick, isAdmin, isStructureMode, onUpdateLecture, onNodeDragEnd }) => {
  const mapRef = useRef(null);
  const [draggingId, setDraggingId] = useState(null);
  const [tempPos, setTempPos] = useState(null); 
  const [isDragging, setIsDragging] = useState(false);

  const pathD = "M 50 350 C 150 200, 250 500, 350 400 C 450 300, 550 100, 650 250 C 750 400, 850 550, 950 450";

  const getIcon = (iconName) => {
    const found = AVAILABLE_ICONS.find(i => i.id === iconName);
    return found ? found.icon : <BookOpen size={24} />;
  };

  const handleMouseDown = (e, nodeId) => {
    if (!isStructureMode) return;
    e.stopPropagation();
    setDraggingId(nodeId);
    setIsDragging(false);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!draggingId || !mapRef.current) return;
      setIsDragging(true);
      const rect = mapRef.current.getBoundingClientRect();
      let left = ((e.clientX - rect.left) / rect.width) * 100;
      let top = ((e.clientY - rect.top) / rect.height) * 100;
      left = Math.max(0, Math.min(100, left));
      top = Math.max(0, Math.min(100, top));
      setTempPos({ left, top });
    };

    const handleMouseUp = () => {
      if (draggingId && tempPos) onNodeDragEnd(draggingId, tempPos); 
      setDraggingId(null);
      setTempPos(null);
      setTimeout(() => setIsDragging(false), 100);
    };

    if (draggingId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, tempPos, onNodeDragEnd]);

  return (
    <div ref={mapRef} className={`relative w-full h-full rounded-[40px] overflow-hidden shadow-2xl ${lecture.bgColor} transition-colors duration-700 border-8 border-white`}>
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <motion.div animate={{ x: [0, 30, 0], y: [0, 10, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-10 left-[10%] text-white"><Cloud size={80} fill="currentColor" /></motion.div>
        <motion.div animate={{ x: [0, -20, 0], y: [0, 15, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute top-40 right-[15%] text-white"><Cloud size={100} fill="currentColor" /></motion.div>
        <motion.div animate={{ x: [0, 40, 0] }} transition={{ duration: 15, repeat: Infinity }} className="absolute bottom-20 left-[30%] text-white"><Cloud size={60} fill="currentColor" /></motion.div>
      </div>

      {/* Header */}
      <div className="absolute top-10 w-full text-center z-10 px-6">
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl font-black text-slate-800 tracking-tight drop-shadow-sm" 
          contentEditable={isAdmin}
          suppressContentEditableWarning={true}
          onBlur={(e) => isAdmin && onUpdateLecture('title', e.target.innerText)}
        >
          {lecture.title}
        </motion.h1>
        <motion.p 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold text-slate-500 mt-2 bg-white/50 inline-block px-4 py-1 rounded-full backdrop-blur-sm"
          contentEditable={isAdmin}
          suppressContentEditableWarning={true}
          onBlur={(e) => isAdmin && onUpdateLecture('subTitle', e.target.innerText)}
        >
          {lecture.subTitle}
        </motion.p>
      </div>

      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" viewBox="0 0 1000 600" preserveAspectRatio="none">
        <path d={pathD} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="100" strokeLinecap="round" />
        <path d={pathD} fill="none" className={`${lecture.pathColor} transition-colors`} strokeWidth="80" strokeLinecap="round" />
        <path d={pathD} fill="none" stroke="white" strokeWidth="6" strokeDasharray="20 20" strokeLinecap="round" />
      </svg>

      {lecture.nodes && lecture.nodes.map((node, index) => {
        const isBeingDragged = draggingId === node.id;
        const displayLeft = isBeingDragged && tempPos ? tempPos.left : node.left;
        const displayTop = isBeingDragged && tempPos ? tempPos.top : node.top;

        return (
          <motion.div 
            key={node.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center 
              ${isStructureMode ? 'cursor-grab active:cursor-grabbing z-30' : 'cursor-pointer z-20'} 
              group`}
            style={{ 
              top: `${displayTop}%`, 
              left: `${displayLeft}%`,
              transition: isBeingDragged ? 'none' : 'top 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), left 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
            onMouseDown={(e) => handleMouseDown(e, node.id)}
            onClick={(e) => {
              e.stopPropagation();
              if (!isDragging) onNodeClick(node);
            }}
          >
            {/* Island Base */}
            <div className="absolute -bottom-2 w-24 h-8 bg-black/5 rounded-[100%] blur-md"></div>
            
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl border-4 border-white animate-float
              ${isStructureMode ? 'bg-slate-400' : 
                index % 4 === 0 ? 'bg-orange-400' : index % 4 === 1 ? 'bg-sky-400' :
                index % 4 === 2 ? 'bg-purple-400' : 'bg-rose-400'
              }
              group-hover:scale-110 transition-transform duration-300 relative
            `}>
              <div className="text-white drop-shadow-md">{getIcon(node.icon)}</div>
              
              {/* Sparkles for completed or active nodes */}
              {!isStructureMode && (
                <div className="absolute -top-2 -right-2 text-yellow-300 animate-pulse">
                  <Sparkles size={20} fill="currentColor" />
                </div>
              )}
            </div>
            
            <div className="mt-4 px-4 py-2 bg-white rounded-2xl shadow-lg border-2 border-slate-100 min-w-[120px] text-center group-hover:bg-sky-50 transition-colors">
              <span className="font-black text-slate-700 text-sm uppercase tracking-wider">{node.label}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// --- MODULES ---

const VocabModule = ({ data, isAdmin, onUpdate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [localData, setLocalData] = useState(data || []);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => { if(data) setLocalData(data); }, [data]);

  const showNotify = (msg, type = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSave = async () => { 
    setIsSaving(true);
    try {
      await onUpdate(localData);
      showNotify("Đã lưu thành công!");
    } catch(e) {
      showNotify("Lỗi khi lưu!", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const currentCard = localData[currentIndex] || {};

  return (
    <div className="flex flex-col items-center w-full h-full p-4 md:p-6 overflow-y-auto">
      {/* Admin Quick Bar */}
      {isAdmin && (
        <div className="w-full max-w-4xl mb-4 flex justify-between items-center bg-white p-3 rounded-2xl shadow-md border-2 border-slate-100 shrink-0">
          <div className="flex gap-2">
            <button onClick={() => {
              const newWord = { id: Date.now(), word: 'New Word', ipa: '', meaning: 'Nghĩa...', example: 'Example...', image: '📝' };
              setLocalData([...localData, newWord]);
              setCurrentIndex(localData.length);
            }} className="p-2 bg-sky-100 text-sky-600 rounded-xl hover:bg-sky-200 transition"><Plus size={20}/></button>
          </div>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-sky-500 text-white font-black rounded-xl shadow-lg hover:bg-sky-600 flex items-center gap-2 transition text-sm">
            {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} LƯU BÀI
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentIndex}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          className="w-full max-w-5xl bg-white rounded-[40px] shadow-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-10 items-center border-4 md:border-8 border-sky-100 shrink-0"
        >
          {/* Image Section */}
          <div className="w-full md:w-1/2 aspect-square md:aspect-auto md:h-[350px] bg-slate-50 rounded-[30px] overflow-hidden border-4 border-white shadow-inner relative group flex items-center justify-center">
            {currentCard.image && (currentCard.image.startsWith('http') || currentCard.image.startsWith('data:')) ? (
              <img src={currentCard.image} alt="vocab" className="w-full h-full object-contain p-4" />
            ) : (
              <div className="text-8xl md:text-9xl">{currentCard.image || '🖼️'}</div>
            )}
            
            {isAdmin && (
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current.click()}>
                <div className="bg-white px-4 py-2 rounded-xl font-black text-sky-600 shadow-xl flex items-center gap-2 text-sm">
                  <Upload size={16}/> Tải Ảnh
                </div>
              </div>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  const updated = localData.map((item, idx) => idx === currentIndex ? { ...item, image: reader.result } : item);
                  setLocalData(updated);
                };
                reader.readAsDataURL(file);
              }
            }} />
            
            <button 
              onClick={() => speak(currentCard.word)} 
              className="absolute bottom-4 right-4 w-14 h-14 md:w-16 md:h-16 bg-yellow-400 text-white rounded-2xl flex items-center justify-center shadow-xl hover:bg-yellow-500 transform hover:scale-110 transition-all border-4 border-white"
            >
              <Volume2 size={28} md:size={32} />
            </button>
          </div>

          {/* Text Section */}
          <div className="w-full md:w-1/2 space-y-4 md:space-y-6">
            <div>
              {isAdmin ? (
                <input 
                  className="w-full text-4xl md:text-5xl font-black text-slate-800 bg-transparent border-b-4 border-sky-100 focus:border-sky-400 outline-none mb-1" 
                  value={currentCard.word} 
                  onChange={e => {
                    const updated = localData.map((item, idx) => idx === currentIndex ? { ...item, word: e.target.value } : item);
                    setLocalData(updated);
                  }}
                />
              ) : (
                <h1 className="text-5xl md:text-6xl font-black text-slate-800 tracking-tight">{currentCard.word}</h1>
              )}
              <div className="inline-block px-3 py-1 bg-sky-100 text-sky-600 rounded-lg font-bold font-mono text-lg mt-1">
                {currentCard.ipa}
              </div>
            </div>

            <div className="bg-emerald-50 rounded-[24px] p-4 md:p-6 border-l-8 border-emerald-400">
              <h4 className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1">Nghĩa là</h4>
              <p className="text-2xl md:text-3xl font-black text-emerald-800">{currentCard.meaning}</p>
            </div>

            <div className="bg-amber-50 rounded-[24px] p-4 md:p-6 border-l-8 border-amber-400 relative">
              <h4 className="text-amber-400 text-[10px] font-black uppercase tracking-widest mb-1">Ví dụ</h4>
              <p className="text-lg md:text-xl font-bold text-amber-800 italic">"{currentCard.example}"</p>
              <button onClick={() => speak(currentCard.example)} className="absolute top-4 right-4 text-amber-400 hover:text-amber-600"><Volume2 size={20}/></button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-6 mt-6 items-center shrink-0 pb-4">
        <button 
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} 
          disabled={currentIndex === 0}
          className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-400 hover:text-sky-500 disabled:opacity-30 transition-all hover:-translate-x-1"
        >
          <ChevronLeft size={32} strokeWidth={3} />
        </button>
        <div className="bg-white px-6 py-2 rounded-2xl shadow-lg border-4 border-sky-100 font-black text-xl text-slate-600">
          {currentIndex + 1} <span className="text-slate-300 mx-2">/</span> {localData.length}
        </div>
        <button 
          onClick={() => setCurrentIndex(Math.min(localData.length - 1, currentIndex + 1))} 
          disabled={currentIndex === localData.length - 1}
          className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-yellow-400 shadow-xl flex items-center justify-center text-white hover:bg-yellow-500 disabled:opacity-30 transition-all hover:translate-x-1 border-4 border-white"
        >
          <ChevronRight size={32} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

const VideoModule = ({ url, isAdmin, onUpdate }) => {
  const [inputUrl, setInputUrl] = useState(url || "");

  return (
    <div className="w-full h-full flex flex-col items-center p-8">
      {isAdmin && (
        <div className="w-full max-w-2xl mb-8 bg-white p-4 rounded-3xl shadow-lg border-2 border-sky-100 flex gap-4">
          <input 
            className="flex-1 bg-slate-50 border-none outline-none px-4 rounded-xl font-bold text-slate-600"
            value={inputUrl}
            onChange={e => setInputUrl(e.target.value)}
            placeholder="Dán link YouTube tại đây..."
          />
          <button onClick={() => onUpdate(inputUrl)} className="px-6 py-3 bg-sky-500 text-white font-black rounded-xl hover:bg-sky-600 transition">LƯU VIDEO</button>
        </div>
      )}
      <div className="w-full max-w-5xl aspect-video bg-slate-900 rounded-[40px] overflow-hidden shadow-2xl border-8 border-white relative">
        {url ? (
          <iframe width="100%" height="100%" src={url} title="Video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
            <Video size={100} />
            <p className="text-2xl font-black mt-4">Chưa có video bài giảng</p>
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryModule = ({ lecture, onClose }) => {
  const vocabNode = lecture.nodes.find(n => n.type === 'vocab');
  const vocabList = vocabNode ? vocabNode.content : [];

  return (
    <div className="flex flex-col items-center w-full h-full bg-sky-50 p-10 overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center mb-12"
      >
        <div className="w-32 h-32 bg-yellow-400 rounded-[40px] mx-auto mb-6 flex items-center justify-center text-white shadow-2xl border-8 border-white animate-bounce">
          <Trophy size={60} />
        </div>
        <h2 className="text-6xl font-black text-sky-600 mb-2 tracking-tight">TUYỆT VỜI!</h2>
        <p className="text-2xl font-bold text-slate-500">Bạn đã hoàn thành bài học: <span className="text-sky-500">{lecture.title}</span></p>
      </motion.div>

      <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {vocabList.map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white p-6 rounded-3xl shadow-lg border-4 border-white text-center hover:scale-105 transition-transform"
          >
            <div className="text-4xl mb-2">{item.image && item.image.length < 5 ? item.image : '⭐'}</div>
            <div className="font-black text-slate-800 text-xl">{item.word}</div>
            <div className="text-slate-400 font-bold text-sm">{item.meaning}</div>
          </motion.div>
        ))}
      </div>

      <button 
        onClick={onClose}
        className="px-12 py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[30px] font-black text-2xl shadow-xl hover:shadow-emerald-200 transition-all transform hover:scale-105 flex items-center gap-4 border-b-8 border-emerald-700 active:border-b-0 active:translate-y-2"
      >
        <Check size={32} strokeWidth={4} /> HOÀN THÀNH
      </button>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [user, setUser] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [activeLectureId, setActiveLectureId] = useState(null);
  const [activeNode, setActiveNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminMode, setAdminMode] = useState('view');
  const [editingNode, setEditingNode] = useState(null);

  useEffect(() => {
    // Mock data for initial preview if Firebase is not connected
    setLectures(INITIAL_LECTURES_SEED);
    setLoading(false);

    // Real Firebase listener would go here
    if (db && firebaseConfig.apiKey !== "placeholder") {
      const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'lectures'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (data.length > 0) setLectures(data);
      });
      return () => unsubscribe();
    }
  }, []);

  const activeLecture = lectures.find(l => l.id === activeLectureId);

  if (!user) return <AuthScreen onLogin={(role) => setUser({ role })} isConnecting={loading} />;

  return (
    <div className="h-screen bg-sky-50 flex flex-col font-sans overflow-hidden">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md p-3 px-8 flex justify-between items-center z-50 border-b-4 border-sky-100 shrink-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveLectureId(null); setActiveNode(null); }}>
          <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg">E</div>
          <span className="font-black text-2xl text-slate-800 tracking-tight hidden sm:block">English Adventure</span>
        </div>
        
        <div className="flex items-center gap-4">
          {user.role === 'admin' && (
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button onClick={() => setAdminMode('view')} className={`px-4 py-2 rounded-xl text-sm font-black transition ${adminMode === 'view' ? 'bg-white text-sky-500 shadow-sm' : 'text-slate-400'}`}>HỌC</button>
              <button onClick={() => setAdminMode('structure')} className={`px-4 py-2 rounded-xl text-sm font-black transition ${adminMode === 'structure' ? 'bg-white text-purple-500 shadow-sm' : 'text-slate-400'}`}>SỬA</button>
            </div>
          )}
          <button onClick={() => setUser(null)} className="p-2 text-slate-400 hover:text-red-500 transition"><X size={24}/></button>
        </div>
      </nav>

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {!activeLectureId ? (
            <motion.div 
              key="library"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full overflow-y-auto pr-2"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-4xl font-black text-slate-800 tracking-tight">Thư Viện Bài Học</h2>
                {user.role === 'admin' && (
                  <button onClick={() => {
                    const newL = { ...INITIAL_LECTURES_SEED[0], id: `l_${Date.now()}`, createdAt: Date.now() };
                    setLectures([newL, ...lectures]);
                  }} className="bg-sky-500 text-white px-8 py-4 rounded-3xl font-black shadow-xl hover:bg-sky-600 transition flex items-center gap-2">
                    <Plus size={24} strokeWidth={3} /> TẠO BÀI MỚI
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                {lectures.map(lecture => (
                  <motion.div 
                    key={lecture.id} 
                    whileHover={{ y: -10 }}
                    onClick={() => setActiveLectureId(lecture.id)}
                    className={`h-64 rounded-[40px] cursor-pointer p-8 flex flex-col justify-between shadow-xl border-8 border-white group relative overflow-hidden ${lecture.bgColor}`}
                  >
                    <div className="relative z-10">
                      <h3 className="text-3xl font-black text-slate-800 mb-2 leading-tight">{lecture.title}</h3>
                      <p className="text-slate-500 font-bold text-lg">{lecture.subTitle}</p>
                    </div>
                    
                    <div className="flex justify-between items-end relative z-10">
                      <div className="bg-white/50 px-4 py-2 rounded-2xl font-black text-slate-600 text-sm">
                        {lecture.nodes?.length || 0} TRẠM
                      </div>
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-sky-500 shadow-lg group-hover:scale-110 transition">
                        <Play size={32} fill="currentColor" />
                      </div>
                    </div>
                    
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/20 rounded-full blur-3xl"></div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="map"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="h-full flex flex-col gap-4"
            >
              <div className="flex justify-between items-center shrink-0">
                <button onClick={() => setActiveLectureId(null)} className="flex items-center gap-2 px-6 py-2 bg-white rounded-2xl font-black text-slate-500 shadow-md hover:bg-slate-50 transition">
                  <ChevronLeft size={24} strokeWidth={3} /> QUAY LẠI
                </button>
                
                {user.role === 'admin' && adminMode === 'structure' && (
                  <div className="flex gap-2">
                    <button onClick={() => {
                      const newNode = { id: `n${Date.now()}`, type: 'vocab', label: 'Trạm Mới', icon: 'book', top: 50, left: 50, content: [] };
                      const updated = lectures.map(l => l.id === activeLectureId ? { ...l, nodes: [...l.nodes, newNode] } : l);
                      setLectures(updated);
                    }} className="bg-purple-500 text-white px-6 py-2 rounded-2xl font-black shadow-lg flex items-center gap-2"><Plus size={20}/> THÊM TRẠM</button>
                  </div>
                )}
              </div>

              <div className="flex-1 relative rounded-[40px] shadow-2xl overflow-hidden bg-white border-8 border-white">
                <GameMap 
                  lecture={activeLecture}
                  isAdmin={user.role === 'admin'}
                  isStructureMode={adminMode === 'structure'}
                  onNodeClick={(n) => setActiveNode(n)}
                  onUpdateLecture={(f, v) => {
                    const updated = lectures.map(l => l.id === activeLectureId ? { ...l, [f]: v } : l);
                    setLectures(updated);
                  }}
                  onNodeDragEnd={(id, pos) => {
                    const updatedNodes = activeLecture.nodes.map(n => n.id === id ? { ...n, ...pos } : n);
                    const updated = lectures.map(l => l.id === activeLectureId ? { ...l, nodes: updatedNodes } : l);
                    setLectures(updated);
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Module Overlay */}
      <AnimatePresence>
        {activeNode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-sky-900/40 backdrop-blur-md"
          >
            <motion.div 
              initial={{ y: 100, scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 100, scale: 0.9 }}
              className="bg-white rounded-[40px] md:rounded-[60px] w-full max-w-7xl h-[95vh] flex flex-col shadow-3xl overflow-hidden border-4 md:border-8 border-white"
            >
              <div className="p-4 md:p-6 px-6 md:px-10 flex justify-between items-center bg-slate-800 text-white shrink-0">
                <div className="flex items-center gap-4">
                  <div className="p-2 md:p-3 bg-white/10 rounded-2xl">
                    {AVAILABLE_ICONS.find(i => i.id === activeNode.icon)?.icon}
                  </div>
                  <h2 className="text-xl md:text-3xl font-black tracking-tight uppercase">{activeNode.label}</h2>
                </div>
                <button onClick={() => setActiveNode(null)} className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition">
                  <X size={24} md:size={32} strokeWidth={3} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {activeNode.type === 'vocab' && (
                  <VocabModule 
                    data={activeNode.content} 
                    isAdmin={user.role === 'admin'} 
                    onUpdate={(newContent) => {
                      const updatedNodes = activeLecture.nodes.map(n => n.id === activeNode.id ? { ...n, content: newContent } : n);
                      const updated = lectures.map(l => l.id === activeLectureId ? { ...l, nodes: updatedNodes } : l);
                      setLectures(updated);
                    }}
                  />
                )}
                {activeNode.type === 'video' && (
                  <VideoModule 
                    url={activeNode.videoUrl} 
                    isAdmin={user.role === 'admin'} 
                    onUpdate={(newUrl) => {
                      const updatedNodes = activeLecture.nodes.map(n => n.id === activeNode.id ? { ...n, videoUrl: newUrl } : n);
                      const updated = lectures.map(l => l.id === activeLectureId ? { ...l, nodes: updatedNodes } : l);
                      setLectures(updated);
                    }}
                  />
                )}
                {activeNode.type === 'summary' && (
                  <SummaryModule lecture={activeLecture} onClose={() => setActiveNode(null)} />
                )}
                {['game', 'dice', 'game1'].includes(activeNode.type) && (
                  <div className="h-full flex flex-col items-center justify-center p-10 text-center">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-purple-500 rounded-[30px] md:rounded-[40px] flex items-center justify-center text-white mb-6 md:mb-8 shadow-2xl animate-bounce">
                      <Gamepad2 size={40} md:size={60} />
                    </div>
                    <h3 className="text-3xl md:text-5xl font-black text-slate-800 mb-4">SẴN SÀNG CHƯA?</h3>
                    <p className="text-lg md:text-xl font-bold text-slate-500 mb-8 md:mb-10">Trò chơi ôn tập từ vựng đang chờ bạn!</p>
                    <button className="px-10 py-4 md:px-12 md:py-5 bg-purple-500 text-white rounded-[25px] md:rounded-[30px] font-black text-xl md:text-2xl shadow-xl hover:bg-purple-600 transition-all transform hover:scale-105 border-b-8 border-purple-800">
                      BẮT ĐẦU CHƠI
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
