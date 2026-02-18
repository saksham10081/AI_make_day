import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

// --- DATASET: ICONIC INDIAN REGRETS (with storyboard narratives + video prompts) ---
const REGRET_DATA = [
  {
    id: 'rel_blr_01',
    title: "Bellandur Swamp",
    year: "2004",
    category: "Real Estate",
    wheelColor: '#8B6914',
    opportunity:
      "A marshy 2400 sq.ft plot in East Bangalore was going for ₹4 Lakhs. Everyone laughed — called it a swamp. Your cousin begged you to split the cost. You said no. Bought a Pulsar 180 instead.",
    dreamLife:
      "You own a ₹15 Crore property on the Outer Ring Road tech corridor. You retired at 40. Filter coffee on a penthouse balcony every morning, watching the sunrise over the city you helped build. You angel-invest for fun. Money isn't a thought anymore — it's just there.",
    reality:
      "You wake at 6:30 AM to beat Bellandur traffic. 2 hours later, you reach a corporate park — built on the land you could've owned. You badge in, open Jira, join a standup. Your landlord just texted: rent up 15%. Again. You open Swiggy, check budget, close it. Dal chawal it is.",
    videoPrompt:
      "Cinematic slow pan across a luxury penthouse balcony in Bangalore at golden hour, overlooking a vast glass-and-steel tech corridor, filter coffee steaming on the railing, warm golden light, 4K cinematic quality, no text",
  },
  {
    id: 'cry_btc_01',
    title: "Bitcoin Wallet",
    year: "2011",
    category: "Crypto",
    wheelColor: '#92400e',
    opportunity:
      "You mined 500 BTC on your hostel laptop in 2011. A fun weekend project. But the laptop was slow and GTA IV wasn't going to install itself. You formatted the drive. The wallet keys vanished forever.",
    dreamLife:
      "Those 500 BTC are worth ₹3,500 Crores today. You live between Goa and Dubai. You funded three startups before breakfast. Your Twitter bio just says 'Early.' People write case studies about your vision. You haven't opened a salary slip in 14 years.",
    reality:
      "You're in a 9-to-6 that's actually a 9-to-10. Sprint planning at 10, stakeholder sync at 3, 'quick call' at 5:47 PM. You just spent 20 minutes deciding if 'Extra Cheese' fits your Domino's budget. A college junior who kept his BTC just bought a second island. You see it on LinkedIn. Close the app. Open it again.",
    videoPrompt:
      "Dramatic slow-motion aerial shot of a luxury yacht cruising along Dubai marina at night, neon city lights reflecting on dark water, wealthy lifestyle, cinematic dark tones, 4K, no text",
  },
  {
    id: 'stk_mrf_01',
    title: "MRF Shares",
    year: "1990",
    category: "Stocks",
    wheelColor: '#14532d',
    opportunity:
      "Your father's friend tipped him off about MRF. 'Put the boy's first bonus in this,' he said. ₹10,000 in MRF. But a second-hand Maruti 800 was calling your name. You chose the car.",
    dreamLife:
      "Those ₹10,000 in MRF would be worth ₹42 Lakhs today — the most expensive stock in Indian history. The yearly dividends alone cover your home loan. House fully paid. You travel twice a year, spoil the grandkids, and sleep without an alarm.",
    reality:
      "The Maruti 800 rusted into scrap fifteen years ago. You're still paying EMIs on a 2BHK. Every morning you drive past an MRF billboard on your way to the office — open-plan seating, fluorescent lights, a manager who says 'let's take this offline.' Your father never brings it up. He doesn't have to.",
    videoPrompt:
      "Cinematic shot of a massive stock market ticker showing green surges, then slowly pulling back to reveal a luxury retirement home with beautiful garden and mountains, warm nostalgic tones, golden hour, 4K, no text",
  },
  {
    id: 'rel_ggn_01',
    title: "Gurgaon Phase 5",
    year: "2006",
    category: "Real Estate",
    wheelColor: '#7f1d1d',
    opportunity:
      "A plot in Gurgaon Sector 54 was selling for ₹8 Lakhs in 2006. A literal sand track. 'Who would live this far from Delhi?' you said. Your colleague bought two plots. You bought a plasma TV.",
    dreamLife:
      "That sand track is now Billionaire's Row. Your colleague retired at 38 and runs a boutique hotel in Jaipur 'for fun.' The parking spot alone costs more than your current flat. You could've owned the building. The block. The zip code.",
    reality:
      "You commute from Noida to Gurgaon. Three hours a day, five days a week. The plasma TV stopped working in 2012. You're still renting, still in cubicle B-14, still wondering why Amit from accounts looks so relaxed. Your colleague just posted drone footage of his Jaipur property on Instagram. You double-tap, hate yourself, and keep scrolling.",
    videoPrompt:
      "Ascending drone shot from a dusty sand track that transforms into a stunning luxury skyline of high-rise towers at night, billions of city lights stretching to the horizon, dramatic transformation, cinematic, 4K, no text",
  },
];

// --- WHEEL CONFIGURATION ---
const WHEEL_ITEMS = [...REGRET_DATA, ...REGRET_DATA, ...REGRET_DATA];
const NUM_SEGMENTS = WHEEL_ITEMS.length;
const SEGMENT_ANGLE = 360 / NUM_SEGMENTS;

const wheelGradient = (() => {
  const stops = WHEEL_ITEMS.map((item, i) => {
    const start = i * SEGMENT_ANGLE;
    const end = (i + 1) * SEGMENT_ANGLE;
    return `${item.wheelColor} ${start}deg ${end}deg`;
  }).join(', ');
  return `conic-gradient(from -${SEGMENT_ANGLE / 2}deg, ${stops})`;
})();

// --- STORYBOARD SCENE CONFIG ---
const SCENE_CONFIG = [
  {
    key: 'opportunity',
    label: 'THE OPPORTUNITY',
    sublabel: 'What was right in front of you',
    gradient: 'from-[#1a1500] via-[#0a0a0a] to-[#0a0a0a]',
    accent: '#c5a059',
  },
  {
    key: 'dreamLife',
    label: 'THE LIFE YOU NEVER LIVED',
    sublabel: 'If you had taken the chance',
    gradient: 'from-[#001a05] via-[#0a0a0a] to-[#0a0a0a]',
    accent: '#22c55e',
  },
  {
    key: 'reality',
    label: 'YOUR REALITY',
    sublabel: 'Monday through Friday, 9 to whenever they let you leave',
    gradient: 'from-[#1a0505] via-[#0a0a0a] to-[#0a0a0a]',
    accent: '#ef4444',
  },
];

// ============================================================
// VIDEO GENERATION (Google Veo via Gemini API)
// ============================================================

const POLL_INTERVAL_MS = 10_000;

const generateVideo = async (prompt, onReady, abortSignal) => {
  if (!apiKey) return;

  try {
    const startRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/veo-2.0-generate-001:generateVideos?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: `Luxury, hyper-realistic, dark cinematic style: ${prompt}` }],
          parameters: { aspectRatio: '16:9' },
        }),
        signal: abortSignal,
      }
    );

    const operation = await startRes.json();
    if (!operation.name) return;

    let result = operation;
    while (!result.done) {
      if (abortSignal?.aborted) return;
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

      const pollRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${result.name}?key=${apiKey}`,
        { signal: abortSignal }
      );
      result = await pollRes.json();
    }

    const videoFile = result.response?.generatedVideos?.[0]?.video;
    if (!videoFile?.uri) return;

    const downloadUrl = `${videoFile.uri}?key=${apiKey}`;
    const fileRes = await fetch(downloadUrl, { signal: abortSignal });
    const blob = await fileRes.blob();
    const blobUrl = URL.createObjectURL(blob);

    onReady(blobUrl);
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.warn('Video generation failed:', err.message);
    }
  }
};

// ============================================================
// COMPONENTS
// ============================================================

const LandingStage = ({ onSpin }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.5 }}
    className="flex-1 flex flex-col items-center justify-center p-6 text-center"
  >
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="mb-4 px-4 py-1 rounded-full border border-yellow-600/30 bg-yellow-900/10 text-yellow-500 text-[10px] tracking-[0.4em] uppercase font-bold"
    >
      The Indian What-If Engine
    </motion.div>

    <h1 className="text-7xl md:text-[140px] font-black mb-12 tracking-tighter uppercase italic leading-[0.8] drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
      REGRET <br /> ROULETTE
    </h1>

    <div
      className="relative group cursor-pointer"
      onClick={onSpin}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSpin();
      }}
      tabIndex={0}
      role="button"
      aria-label="Spin the roulette wheel"
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-64 h-64 md:w-80 md:h-80 rounded-full border-[12px] border-[#1a1a1a] shadow-[0_0_80px_rgba(0,0,0,1)] relative flex items-center justify-center bg-[#050505] overflow-hidden"
      >
        <div className="absolute inset-0 border border-yellow-600/10 rounded-full" />
        <div className="w-full h-full absolute animate-[spin_60s_linear_infinite]">
          {[...Array(37)].map((_, i) => (
            <div
              key={i}
              className={`absolute top-0 left-1/2 w-4 h-1/2 origin-bottom -translate-x-1/2 ${i % 2 === 0 ? 'bg-red-900' : 'bg-neutral-900'} border-x border-black/30`}
              style={{ transform: `rotate(${(i * 360) / 37}deg)` }}
            >
              <span className="text-[7px] font-bold mt-1 block text-center text-white/20">
                {i}
              </span>
            </div>
          ))}
        </div>
        <div className="z-10 w-28 h-28 rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#000] border-4 border-[#c5a059] shadow-[0_0_30px_rgba(197,160,89,0.3)] flex flex-col items-center justify-center">
          <div className="w-2 h-14 bg-[#c5a059] rounded-full absolute -top-4 shadow-xl" />
          <span className="text-yellow-500 font-black italic text-xl tracking-tighter">
            SPIN
          </span>
        </div>
      </motion.div>
    </div>

    <p className="mt-12 text-neutral-600 tracking-[0.4em] uppercase text-[10px] font-black animate-pulse">
      Place your bet on a better life
    </p>
  </motion.div>
);

const SpinningStage = ({ targetRotation, item, onComplete }) => {
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const revealTimer = setTimeout(() => setShowResult(true), 4800);
    const completeTimer = setTimeout(onComplete, 7500);
    return () => {
      clearTimeout(revealTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center bg-black relative"
    >
      <div className="relative" style={{ width: 320, height: 320 }}>
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
          <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[28px] border-l-transparent border-r-transparent border-t-[#c5a059] drop-shadow-[0_4px_16px_rgba(197,160,89,0.6)]" />
        </div>

        <motion.div
          className="w-full h-full rounded-full overflow-hidden border-[10px] border-[#1a1a1a] shadow-[0_0_120px_rgba(197,160,89,0.1)]"
          style={{ background: wheelGradient }}
          animate={{ rotate: targetRotation }}
          transition={{ duration: 4.5, ease: [0.12, 0.82, 0.18, 1] }}
        >
          {WHEEL_ITEMS.map((_, i) => (
            <div
              key={i}
              className="absolute top-0 left-1/2 w-[2px] h-1/2 origin-bottom bg-black/50"
              style={{
                transform: `translateX(-50%) rotate(${i * SEGMENT_ANGLE}deg)`,
              }}
            />
          ))}
        </motion.div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-20 h-20 rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#050505] border-4 border-[#c5a059] shadow-[0_0_30px_rgba(197,160,89,0.3)] flex items-center justify-center">
          <span className="text-[#c5a059] font-black italic text-2xl">₹</span>
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="mt-16 font-mono text-yellow-500/40 uppercase tracking-[0.6em] text-[11px] font-bold"
      >
        Recalculating Net Worth...
      </motion.p>

      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              className="absolute inset-0 bg-black"
            />
            <motion.div
              initial={{ scale: 2.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="z-10 text-center px-8"
            >
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-[#c5a059] text-xs font-bold uppercase tracking-[0.5em] mb-6"
              >
                The wheel has spoken
              </motion.p>
              <h2 className="text-6xl md:text-[110px] font-black italic uppercase tracking-tighter leading-[0.85]">
                {item.title}
              </h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-neutral-500 text-2xl font-black italic mt-4"
              >
                {item.year}
              </motion.p>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 1.2 }}
                className="h-[1px] w-48 bg-[#c5a059]/30 mx-auto mt-10"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const StoryboardStage = ({ item, sceneIndex, onNext, onReset, videoUrl, isVideoLoading }) => {
  const scene = SCENE_CONFIG[sceneIndex];
  const videoRef = useRef(null);
  const content =
    sceneIndex === 0
      ? item.opportunity
      : sceneIndex === 1
        ? item.dreamLife
        : item.reality;
  const isLastScene = sceneIndex === 2;

  useEffect(() => {
    if (videoRef.current && videoUrl) {
      videoRef.current.play().catch(() => {});
    }
  }, [videoUrl, sceneIndex]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col relative"
    >
      {/* Video / gradient background layer */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence>
          {videoUrl && (
            <motion.video
              key="bg-video"
              ref={videoRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: 'grayscale(60%) brightness(0.3)' }}
              src={videoUrl}
              autoPlay
              loop
              muted
              playsInline
            />
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-[#0a0a0a]" />
      </div>

      {/* Video loading indicator */}
      {isVideoLoading && !videoUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute top-6 right-6 z-20 flex items-center gap-2"
        >
          <div className="w-2 h-2 rounded-full bg-[#c5a059] animate-pulse" />
          <span className="font-mono text-[9px] text-[#c5a059]/60 uppercase tracking-[0.3em] font-bold">
            Generating video
          </span>
        </motion.div>
      )}

      {/* Storyboard content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={sceneIndex}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 flex flex-col justify-between p-8 md:p-16 relative z-10"
        >
          <div>
            <div className="flex items-center gap-3 mb-10">
              {SCENE_CONFIG.map((_, i) => (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full transition-all duration-700"
                  style={{
                    backgroundColor:
                      i <= sceneIndex
                        ? scene.accent
                        : 'rgba(255,255,255,0.06)',
                  }}
                />
              ))}
            </div>

            <motion.span
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm font-black uppercase tracking-[0.4em] mb-2 block"
              style={{ color: scene.accent }}
            >
              {scene.label}
            </motion.span>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-neutral-600 text-xs uppercase tracking-widest font-bold"
            >
              {scene.sublabel}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="max-w-4xl my-auto py-8"
          >
            <p className="text-2xl md:text-[38px] font-black leading-[1.2] italic text-neutral-100 tracking-tight">
              &ldquo;{content}&rdquo;
            </p>
          </motion.div>

          <div className="flex justify-between items-center">
            <p className="text-neutral-700 text-xs uppercase tracking-widest font-bold">
              {item.title} &middot; {item.year} &middot; {item.category}
            </p>

            {isLastScene ? (
              <button
                onClick={onReset}
                className="px-10 py-4 bg-white text-black font-black uppercase italic tracking-widest hover:bg-[#c5a059] transition-all cursor-pointer text-sm"
                aria-label="Spin again"
              >
                Spin Again
              </button>
            ) : (
              <button
                onClick={onNext}
                className="px-8 py-4 border border-white/20 text-white font-black uppercase italic tracking-widest hover:bg-white/5 transition-colors cursor-pointer group text-sm"
                aria-label="Continue to next scene"
              >
                Continue
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

// ============================================================
// APP
// ============================================================

const App = () => {
  const [stage, setStage] = useState('landing');
  const [selectedItem, setSelectedItem] = useState(null);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [spinKey, setSpinKey] = useState(0);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  const handleSpin = () => {
    const item =
      REGRET_DATA[Math.floor(Math.random() * REGRET_DATA.length)];

    const matchingIndices = WHEEL_ITEMS
      .map((w, idx) => (w.id === item.id ? idx : -1))
      .filter((idx) => idx !== -1);
    const segmentIndex =
      matchingIndices[Math.floor(Math.random() * matchingIndices.length)];

    const offset = (360 - segmentIndex * SEGMENT_ANGLE) % 360;
    const fullSpins = (5 + Math.floor(Math.random() * 3)) * 360;

    if (abortRef.current) abortRef.current.abort();
    if (videoUrl) URL.revokeObjectURL(videoUrl);

    setSelectedItem(item);
    setWheelRotation(fullSpins + offset);
    setSpinKey((prev) => prev + 1);
    setSceneIndex(0);
    setVideoUrl(null);
    setStage('spinning');

    if (apiKey) {
      setIsVideoLoading(true);
      const controller = new AbortController();
      abortRef.current = controller;

      generateVideo(
        item.videoPrompt,
        (url) => {
          setVideoUrl(url);
          setIsVideoLoading(false);
        },
        controller.signal
      ).catch(() => setIsVideoLoading(false));
    }
  };

  const handleSpinComplete = () => setStage('storyboard');

  const handleNextScene = () => {
    if (sceneIndex < 2) setSceneIndex((prev) => prev + 1);
  };

  const handleReset = () => {
    if (abortRef.current) abortRef.current.abort();
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setIsVideoLoading(false);
    setStage('landing');
  };

  return (
    <div
      className="h-screen w-screen bg-[#0a0a0a] text-white font-sans overflow-hidden select-none flex flex-col"
      style={{ height: '100vh', width: '100vw', backgroundColor: '#0a0a0a', color: '#fff', display: 'flex', flexDirection: 'column' }}
    >
      <AnimatePresence mode="wait">
        {stage === 'landing' && (
          <LandingStage key="landing" onSpin={handleSpin} />
        )}

        {stage === 'spinning' && selectedItem && (
          <SpinningStage
            key={`spinning-${spinKey}`}
            targetRotation={wheelRotation}
            item={selectedItem}
            onComplete={handleSpinComplete}
          />
        )}

        {stage === 'storyboard' && selectedItem && (
          <StoryboardStage
            key="storyboard"
            item={selectedItem}
            sceneIndex={sceneIndex}
            onNext={handleNextScene}
            onReset={handleReset}
            videoUrl={videoUrl}
            isVideoLoading={isVideoLoading}
          />
        )}
      </AnimatePresence>

      <div className="fixed top-0 left-0 w-full h-1 z-50 bg-gradient-to-r from-transparent via-[#c5a059]/40 to-transparent" />
    </div>
  );
};

export default App;
