import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

// --- DATASET: ICONIC INDIAN REGRETS (with per-scene image prompts) ---
const REGRET_DATA = [
  {
    id: 'rel_blr_01',
    title: "Bellandur Swamp",
    year: "2004",
    category: "Real Estate",
    wheelColor: '#8B6914',
    imagePrompts: [
      "Marshy swampland in rural Bangalore 2004, red soil, Bajaj Pulsar motorcycle on dusty road, warm afternoon light, cinematic",
      "Luxury penthouse balcony in Bangalore overlooking glass skyscrapers at golden hour, filter coffee, wealthy lifestyle, cinematic",
      "Indian office worker stuck in heavy Bangalore traffic at dawn, auto-rickshaws, corporate park in distance, grey tones, cinematic",
    ],
  },
  {
    id: 'cry_btc_01',
    title: "Bitcoin Wallet",
    year: "2011",
    category: "Crypto",
    wheelColor: '#92400e',
    imagePrompts: [
      "Indian college hostel room 2011, old laptop on messy desk, posters on wall, warm tungsten light, moody nostalgic, cinematic",
      "Luxury infinity pool villa overlooking ocean in Goa at sunset, champagne, modern architecture, golden light, cinematic",
      "Indian office worker at cluttered desk late at night, fluorescent lights, empty coffee cups, overworked, cold blue tones, cinematic",
    ],
  },
  {
    id: 'stk_mrf_01',
    title: "MRF Shares",
    year: "1990",
    category: "Stocks",
    wheelColor: '#14532d',
    imagePrompts: [
      "Vintage 1990 Indian street, white Maruti 800 parked outside share broker office, retro signage, warm nostalgic film grain, cinematic",
      "Luxury Indian home with lush garden, retired couple having tea on veranda, peaceful wealthy retirement, golden warm tones, cinematic",
      "Indian man driving past giant MRF billboard in morning traffic, cramped car, melancholy, grey tones, cinematic",
    ],
  },
  {
    id: 'rel_ggn_01',
    title: "Gurgaon Phase 5",
    year: "2006",
    category: "Real Estate",
    wheelColor: '#7f1d1d',
    imagePrompts: [
      "Barren sandy plot on Gurgaon outskirts 2006, plots-for-sale signboard, dusty road, empty horizon, harsh afternoon sun, cinematic",
      "Luxury high-rise penthouse in Gurgaon at night, floor-to-ceiling windows, bright city lights and skyscrapers, opulent interior, cinematic",
      "Crowded Delhi Metro morning rush hour, tired office workers, phone showing Instagram property post, cold fluorescent tones, cinematic",
    ],
  },
  {
    id: 'cry_btc_02',
    title: "Bitcoin in 2013",
    year: "2013",
    category: "Crypto",
    wheelColor: '#7c3aed',
    imagePrompts: [
      "Indian man staring at laptop showing Bitcoin price chart in 2013, small apartment, skeptical expression, warm indoor lighting, cinematic",
      "Wealthy Indian man explaining blockchain at a lavish family wedding, sea-facing apartment visible through window, confident and relaxed, cinematic",
      "Indian man forwarding WhatsApp messages on phone, salary credit notification on screen, modest apartment, evening light, melancholy, cinematic",
    ],
  },
  {
    id: 'rel_blr_02',
    title: "Bellandur Before IT",
    year: "2002",
    category: "Real Estate",
    wheelColor: '#b45309',
    imagePrompts: [
      "Empty green land with mosquitoes near a lake in Bangalore 2002, a faded for-sale board, overgrown grass, hazy afternoon, cinematic",
      "Massive IT tech park rising around a premium property, investor signing papers in a glass cabin, city skyline behind, golden hour, cinematic",
      "Indian man stuck in Bellandur traffic jam looking out car window at the land he once laughed at, frustration, grey overcast, cinematic",
    ],
  },
  {
    id: 'stk_apl_01',
    title: "Apple Stock vs iPhone",
    year: "2008",
    category: "Stocks",
    wheelColor: '#0f766e',
    imagePrompts: [
      "Excited Indian youth unboxing a new iPhone in 2008, electronics store, bright lights, consumerist joy, cinematic",
      "Stock portfolio screen showing massive Apple gains, person relaxing on couch with feet up, sleek modern home, warm satisfied tones, cinematic",
      "Indian person paying iPhone EMI on phone banking app, cracked older iPhone in hand, coffee shop, muted tones, cinematic",
    ],
  },
  {
    id: 'stk_sip_01',
    title: "SIP Since First Job",
    year: "2012",
    category: "Stocks",
    wheelColor: '#1d4ed8',
    imagePrompts: [
      "Young Indian professional receiving first salary, modest office, excited but unsure, 2012 era phone and clothes, warm indoor light, cinematic",
      "Calm Indian professional checking a large investment portfolio on tablet, peaceful morning, balcony with garden view, financial freedom aura, cinematic",
      "30-year-old Indian opening a SIP calculator on laptop, worried expression, small apartment, realizing 8 lost years of compounding, cold blue light, cinematic",
    ],
  },
  {
    id: 'stk_flp_01',
    title: "Early Flipkart Employee",
    year: "2009",
    category: "Stocks",
    wheelColor: '#be185d',
    imagePrompts: [
      "Tiny Indian startup office in 2009, two desks, a banner saying Flipkart, messy but energetic, warm tungsten light, cinematic",
      "Confident Indian professional with LinkedIn bio showing Ex-Flipkart, mentoring young founders in a co-working space, city skyline, golden hour, cinematic",
      "Indian office worker scrolling through Flipkart acquisition news on phone during lunch break, corporate cafeteria, wistful expression, cinematic",
    ],
  },
  {
    id: 'com_gld_01',
    title: "Gold in 2001",
    year: "2001",
    category: "Commodities",
    wheelColor: '#a16207',
    imagePrompts: [
      "Indian bank interior in 2001, customer choosing between gold and fixed deposit, old-style counter, warm retro tones, cinematic",
      "Grand Indian wedding fully funded by gold investments, lavish decorations, happy family, gold jewelry shimmering, rich warm tones, cinematic",
      "Indian man checking savings account with low interest on phone, inflation news on TV in background, modest living room, muted tones, cinematic",
    ],
  },
  {
    id: 'stk_tsl_01',
    title: "Tesla in 2010",
    year: "2010",
    category: "Stocks",
    wheelColor: '#dc2626',
    imagePrompts: [
      "Early Tesla Roadster on display at a 2010 auto show, skeptical onlookers, futuristic but uncertain vibes, cool blue lighting, cinematic",
      "Wealthy person watching Elon Musk tweet on phone, portfolio showing massive green gains, luxury modern apartment, triumphant, cinematic",
      "Indian man refueling petrol hatchback at crowded Indian petrol pump, fuel price board showing high rates, frustration, harsh daylight, cinematic",
    ],
  },
  {
    id: 'rel_vrk_01',
    title: "Varkala Beach Property",
    year: "2010",
    category: "Real Estate",
    wheelColor: '#059669',
    imagePrompts: [
      "Remote quiet beach cliff in Varkala Kerala 2010, no tourists, a small for-sale sign, crashing waves, untouched paradise, golden hour, cinematic",
      "Beautiful beachside homestay in Varkala fully booked, fairy lights, happy guests on terrace, ocean view, work-from-anywhere lifestyle, cinematic",
      "Indian person scrolling Varkala travel reels on Instagram at office desk, checking flight prices they won't book, longing, cold office light, cinematic",
    ],
  },
  {
    id: 'cry_wed_01',
    title: "Bitcoin vs Big Wedding",
    year: "2017",
    category: "Crypto",
    wheelColor: '#7c2d12',
    imagePrompts: [
      "Grand Indian wedding venue being decorated in 2017, massive flower arrangements, expensive lighting, lavish but excessive, warm festive light, cinematic",
      "Intimate small ceremony in a garden, couple smiling, phone showing huge crypto portfolio gains, simple but rich, golden warm light, cinematic",
      "Beautiful wedding album on a shelf next to a credit card EMI statement, bittersweet, soft warm living room light, cinematic",
    ],
  },
  {
    id: 'stk_cvd_01',
    title: "COVID Crash Buy",
    year: "2020",
    category: "Stocks",
    wheelColor: '#4338ca',
    imagePrompts: [
      "Indian person watching stock market crash on laptop in March 2020, red charts everywhere, news showing pandemic, fear and anxiety, dark room, cinematic",
      "Confident investor checking portfolio showing massive post-COVID recovery gains, calm home office, green charts, morning coffee, warm light, cinematic",
      "Indian person watching stock market rally from sidelines in late 2020, phone showing gains they missed, regret, muted evening tones, cinematic",
    ],
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
    label: 'THE OPPORTUNITY',
    sublabel: 'What was right in front of you',
    accent: '#c5a059',
  },
  {
    label: 'THE LIFE YOU NEVER LIVED',
    sublabel: 'If you had taken the chance',
    accent: '#22c55e',
  },
  {
    label: 'YOUR REALITY',
    sublabel: 'Monday through Friday',
    accent: '#ef4444',
  },
];

// ============================================================
// IMAGE GENERATION (Gemini 3 Pro Image via Gemini API)
// ============================================================

const generateImage = async (prompt, signal) => {
  if (signal?.aborted) return null;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Generate an image: ${prompt}` }] }],
          generationConfig: { responseModalities: ['IMAGE'] },
        }),
        signal,
      }
    );

    const result = await response.json();
    const parts = result.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p) => p.inlineData);

    if (imagePart) {
      return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    }
    return null;
  } catch (err) {
    if (err.name === 'AbortError') return null;
    console.warn('Image generation failed:', err.message);
    return null;
  }
};

const generateAllSceneImages = async (prompts, onImageReady, signal) => {
  const promises = prompts.map(async (prompt, index) => {
    const url = await generateImage(prompt, signal);
    if (url) onImageReady(index, url);
  });
  await Promise.allSettled(promises);
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

const StoryboardStage = ({ item, sceneIndex, onNext, onReset, sceneImages }) => {
  const scene = SCENE_CONFIG[sceneIndex];
  const currentImage = sceneImages[sceneIndex];
  const isLastScene = sceneIndex === 2;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col relative"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={sceneIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 flex flex-col relative"
        >
          {/* Full-screen image background */}
          <div className="absolute inset-0 z-0 bg-black">
            <AnimatePresence mode="wait">
              {currentImage ? (
                <motion.img
                  key={`img-${sceneIndex}`}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  src={currentImage}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <motion.div
                  key={`loader-${sceneIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <div className="flex flex-col items-center gap-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                      className="w-10 h-10 border-2 border-transparent rounded-full"
                      style={{ borderTopColor: scene.accent }}
                    />
                    <span className="font-mono text-[10px] uppercase tracking-[0.4em] font-bold" style={{ color: scene.accent }}>
                      Generating scene
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Gradient overlays for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60" />
          </div>

          {/* Content overlay */}
          <div className="relative z-10 flex-1 flex flex-col justify-between p-8 md:p-16">
            {/* Progress bar + scene header */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                {SCENE_CONFIG.map((_, i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full transition-all duration-700"
                    style={{
                      backgroundColor:
                        i <= sceneIndex ? scene.accent : 'rgba(255,255,255,0.1)',
                    }}
                  />
                ))}
              </div>

              <motion.span
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm font-black uppercase tracking-[0.4em] block"
                style={{ color: scene.accent }}
              >
                {scene.label}
              </motion.span>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-white/40 text-xs uppercase tracking-widest font-bold mt-1"
              >
                {scene.sublabel}
              </motion.p>
            </div>

            {/* Spacer */}
            <div />

            {/* Footer */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex justify-between items-center"
            >
              <p className="text-white/30 text-xs uppercase tracking-widest font-bold">
                {item.title} &middot; {item.year}
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
                  className="px-8 py-4 border border-white/20 text-white font-black uppercase italic tracking-widest hover:bg-white/10 transition-colors cursor-pointer group text-sm backdrop-blur-sm"
                  aria-label="Continue to next scene"
                >
                  Continue
                  <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </button>
              )}
            </motion.div>
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
  const [sceneImages, setSceneImages] = useState([null, null, null]);
  const abortRef = useRef(null);

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

    setSelectedItem(item);
    setWheelRotation(fullSpins + offset);
    setSpinKey((prev) => prev + 1);
    setSceneIndex(0);
    setSceneImages([null, null, null]);
    setStage('spinning');

    if (apiKey) {
      const controller = new AbortController();
      abortRef.current = controller;

      generateAllSceneImages(
        item.imagePrompts,
        (index, url) => {
          setSceneImages((prev) => {
            const next = [...prev];
            next[index] = url;
            return next;
          });
        },
        controller.signal
      );
    }
  };

  const handleSpinComplete = () => setStage('storyboard');

  const handleNextScene = () => {
    if (sceneIndex < 2) setSceneIndex((prev) => prev + 1);
  };

  const handleReset = () => {
    if (abortRef.current) abortRef.current.abort();
    setSceneImages([null, null, null]);
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
            sceneImages={sceneImages}
          />
        )}
      </AnimatePresence>

      <div className="fixed top-0 left-0 w-full h-1 z-50 bg-gradient-to-r from-transparent via-[#c5a059]/40 to-transparent" />
    </div>
  );
};

export default App;
