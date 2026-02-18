import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- DATASET: 5 ICONIC INDIAN REGRETS (static images) ---
const REGRET_DATA = [
  {
    id: 'rel_blr_01',
    title: "Bellandur Plot",
    subtitle: "Too Far From The City",
    category: "Real Estate",
    wheelColor: '#8B6914',
    wheelIcon: '🏗',
    texts: [
      "It looked like nothing.\nJust dusty land and a couple of half-built roads.\nYou said, \"Bro this is too far. Who will even come here?\"\nMosquitoes were the only residents.",
      "Tech parks bloom around your plot.\nGlass buildings rise like ambition itself.\nCompanies call. You don't chase.\nYou negotiate calmly, like someone who owns the ground beneath opportunity.\nYour weekday mornings are slower.\nTraffic is now something you observe, not survive.",
      "You sit in that same traffic.\nRent auto-debits quietly every month.\nFrom your office window, you see towers built on land you once dismissed.\nYou adjust your backpack and say, \"Hindsight is crazy.\"",
    ],
    images: [
      "/images/bellandur-opportunity.png",
      "/images/bellandur-dream.png",
      "/images/bellandur-reality.png",
    ],
  },
  {
    id: 'cry_btc_01',
    title: "Bitcoin",
    subtitle: "It's Probably A Scam",
    category: "Crypto",
    wheelColor: '#92400e',
    wheelIcon: '₿',
    texts: [
      "It sounded fake.\nInternet money? No RBI? No office?\nYou trusted something you could hold — not something stored in a password.\nYou said, \"This will crash. I'm not stupid.\"",
      "Your tiny experiment becomes legendary.\nFamily members now ask for \"crypto guidance.\"\nYou talk about volatility like it's weather.\nYou don't refresh your salary credit message anymore.\nYou refresh markets for entertainment.",
      "You forward crash news in the family group chat.\n\"See? I was right.\"\nThen you open an exchange app you installed once.\nBalance: ₹0.\nYou close it like it never existed.",
    ],
    images: [
      "/images/bitcoin-opportunity.png",
      "/images/bitcoin-dream.png",
      "/images/bitcoin-reality.png",
    ],
  },
  {
    id: 'rel_vrk_01',
    title: "Varkala Beach Property",
    subtitle: "Too Quiet",
    category: "Real Estate",
    wheelColor: '#059669',
    wheelIcon: '🏖',
    texts: [
      "It felt remote.\nNo hype. No crowd. Just waves and silence.\nYou said, \"Nice place for vacation. Not investment.\"",
      "Your beach house becomes fully booked every season.\nForeign tourists leave glowing reviews.\nWork-from-home becomes work-from-ocean.\nYour mornings start with sunlight, not Slack notifications.\nPeople call your lifestyle \"intentional.\"",
      "You watch Varkala reels at midnight.\nYou say, \"Bro we should go here sometime.\"\nYou check flight prices.\nClose the tab.\nOpen laptop.",
    ],
    images: [
      "/images/varkala-opportunity.png",
      "/images/varkala-dream.png",
      "/images/varkala-reality.png",
    ],
  },
  {
    id: 'stk_mrf_01',
    title: "MRF Stock",
    subtitle: "It's Just A Tyre Company",
    category: "Stocks",
    wheelColor: '#14532d',
    wheelIcon: '📈',
    texts: [
      "It wasn't glamorous.\nNo flashy product launches.\nNo trending hashtags.\nJust tyres.\nYou wanted excitement, not stability.",
      "Silent compounding does its quiet magic.\nNo drama. No noise. Just growth.\nYou become the calm investor in every friend group.\nThe one who says \"long term\" and actually means it.\nMoney grows while you sleep.",
      "You chase \"next multibagger\" thumbnails on YouTube.\nScreenshot profits at +14%.\nPanic at -9%.\nStill don't own tyres.\nJust buy them.",
    ],
    images: [
      "/images/mrf-opportunity.png",
      "/images/mrf-dream.png",
      "/images/mrf-reality.png",
    ],
  },
  {
    id: 'stk_flp_01',
    title: "The Startup You Didn't Join",
    subtitle: "Too Risky",
    category: "Startups",
    wheelColor: '#be185d',
    wheelIcon: '🏢',
    texts: [
      "The salary was lower.\nThe office was smaller.\nParents said, \"Stable job is better.\"\nYou chose certainty over curiosity.",
      "IPO day feels unreal.\nYour ESOPs unlock.\nLinkedIn says \"Grateful for the journey.\"\nYou buy your parents a house.\nYou casually invest in other founders.\nPeople call you brave.",
      "You scroll past their acquisition news.\nPause for two seconds.\nThink, \"I almost applied there.\"\nThen refresh your payslip.\nIt still feels important.",
    ],
    images: [
      "/images/startup-opportunity.png",
      "/images/startup-dream.png",
      "/images/startup-reality.png",
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
    label: 'WHAT YOU MISSED',
    sublabel: 'Because you thought you knew better',
    accent: '#c5a059',
    accentBg: 'rgba(197, 160, 89, 0.08)',
    number: 'I',
  },
  {
    label: 'THE LIFE YOU NEVER LIVED',
    sublabel: 'If only you had taken the chance',
    accent: '#22c55e',
    accentBg: 'rgba(34, 197, 94, 0.08)',
    number: 'II',
  },
  {
    label: 'YOUR REALITY',
    sublabel: 'Monday through Friday, forever',
    accent: '#ef4444',
    accentBg: 'rgba(239, 68, 68, 0.08)',
    number: 'III',
  },
];

// Stagger animation for text lines
const lineVariants = {
  hidden: { opacity: 0, x: -10, filter: 'blur(4px)' },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { delay: 0.5 + i * 0.18, duration: 0.6, ease: [0.25, 1, 0.5, 1] },
  }),
};

// ============================================================
// COMPONENTS
// ============================================================

const GearSVG = ({ size = 60, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <g fill="none" stroke="url(#gear-grad)" strokeWidth="2.5">
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const x1 = 50 + 38 * Math.cos(angle);
        const y1 = 50 + 38 * Math.sin(angle);
        const x2 = 50 + 46 * Math.cos(angle);
        const y2 = 50 + 46 * Math.sin(angle);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="6" strokeLinecap="round" />;
      })}
      <circle cx="50" cy="50" r="38" />
      <circle cx="50" cy="50" r="28" />
      <circle cx="50" cy="50" r="12" fill="url(#gear-grad)" />
    </g>
    <defs>
      <linearGradient id="gear-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c5a059" />
        <stop offset="100%" stopColor="#8B6914" />
      </linearGradient>
    </defs>
  </svg>
);

const LandingStage = ({ onSpin }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.5 }}
    className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden"
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

    {/* Ornate wheel */}
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
      {/* Outer decorative ring with studs */}
      <div className="absolute -inset-5 rounded-full border-[3px] border-[#c5a059]/20" />
      <div className="absolute -inset-3 rounded-full border-[1px] border-[#c5a059]/10" />

      {/* Decorative corner gears */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
        className="absolute -top-8 -left-8 opacity-30"
      >
        <GearSVG size={50} />
      </motion.div>
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
        className="absolute -top-6 -right-6 opacity-20"
      >
        <GearSVG size={40} />
      </motion.div>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
        className="absolute -bottom-6 -left-6 opacity-20"
      >
        <GearSVG size={40} />
      </motion.div>
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 22, ease: 'linear' }}
        className="absolute -bottom-8 -right-8 opacity-30"
      >
        <GearSVG size={50} />
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-72 h-72 md:w-[340px] md:h-[340px] rounded-full relative flex items-center justify-center overflow-hidden"
        style={{
          border: '14px solid transparent',
          backgroundClip: 'padding-box',
          boxShadow: '0 0 80px rgba(197,160,89,0.15), inset 0 0 40px rgba(0,0,0,0.8), 0 0 0 14px #1a1408, 0 0 0 17px #c5a059, 0 0 0 20px #1a1408',
        }}
      >
        {/* Metallic ring texture */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(197,160,89,0.1) 0%, transparent 50%)',
          }}
        />

        {/* Slow spinning decorative ring */}
        <div className="w-full h-full absolute animate-[spin_60s_linear_infinite]">
          {[...Array(24)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 left-1/2 w-[1px] h-1/2 origin-bottom -translate-x-1/2"
              style={{
                transform: `rotate(${(i * 360) / 24}deg)`,
                background: i % 2 === 0
                  ? 'linear-gradient(to top, transparent 40%, rgba(197,160,89,0.3) 100%)'
                  : 'linear-gradient(to top, transparent 50%, rgba(197,160,89,0.1) 100%)',
              }}
            />
          ))}
        </div>

        {/* Inner colored segments ring */}
        <div
          className="absolute rounded-full"
          style={{
            inset: '20px',
            background: wheelGradient,
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.6)',
          }}
        >
          {WHEEL_ITEMS.map((_, i) => (
            <div
              key={i}
              className="absolute top-0 left-1/2 w-[1px] h-1/2 origin-bottom bg-black/40"
              style={{
                transform: `translateX(-50%) rotate(${i * SEGMENT_ANGLE}deg)`,
              }}
            />
          ))}
        </div>

        {/* Inner decorative ring */}
        <div
          className="absolute rounded-full border-[2px] border-[#c5a059]/40"
          style={{ inset: '18px' }}
        />
        <div
          className="absolute rounded-full border-[1px] border-[#c5a059]/20"
          style={{ inset: '50px' }}
        />

        {/* Center hub with layered metallic look */}
        <div className="z-10 w-28 h-28 md:w-32 md:h-32 rounded-full relative flex flex-col items-center justify-center"
          style={{
            background: 'radial-gradient(circle at 35% 35%, #3a3a3a, #0a0a0a)',
            boxShadow: '0 0 30px rgba(197,160,89,0.4), 0 0 0 4px #c5a059, 0 0 0 6px #1a1408, 0 0 0 8px rgba(197,160,89,0.3)',
          }}
        >
          {/* Inner gear decoration */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
            className="absolute inset-2 opacity-20"
          >
            <GearSVG size={100} className="w-full h-full" />
          </motion.div>

          {/* Pointer notch at top */}
          <div
            className="absolute -top-7 left-1/2 -translate-x-1/2 w-3 h-6 rounded-b-full z-20"
            style={{
              background: 'linear-gradient(to bottom, #c5a059, #8B6914)',
              boxShadow: '0 4px 12px rgba(197,160,89,0.5)',
            }}
          />

          <span className="text-[#c5a059] font-black italic text-2xl tracking-tighter z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            SPIN
          </span>
          <span className="text-[#c5a059]/40 text-[8px] uppercase tracking-[0.3em] font-bold mt-1 z-10">
            Your Fate
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
      className="flex-1 flex flex-col items-center justify-center bg-black relative overflow-hidden"
    >
      {/* Background ambient glow */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(circle at 50% 40%, rgba(197,160,89,0.3) 0%, transparent 60%)',
        }}
      />

      <div className="relative" style={{ width: 340, height: 340 }}>
        {/* Ornate pointer at top */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
          <div
            className="w-0 h-0"
            style={{
              borderLeft: '16px solid transparent',
              borderRight: '16px solid transparent',
              borderTop: '32px solid #c5a059',
              filter: 'drop-shadow(0 4px 12px rgba(197,160,89,0.6))',
            }}
          />
          <div className="w-1 h-2 bg-[#c5a059] rounded-b-sm" />
        </div>

        {/* Outer decorative ring */}
        <div
          className="absolute -inset-4 rounded-full"
          style={{
            border: '3px solid transparent',
            boxShadow: '0 0 0 3px #1a1408, 0 0 0 5px #c5a059, 0 0 0 8px #1a1408, 0 0 60px rgba(197,160,89,0.15)',
          }}
        />

        {/* Spinning wheel */}
        <motion.div
          className="w-full h-full rounded-full overflow-hidden relative"
          style={{
            background: wheelGradient,
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.7), 0 0 0 10px #1a1408, 0 0 0 13px #c5a059',
          }}
          animate={{ rotate: targetRotation }}
          transition={{ duration: 4.5, ease: [0.12, 0.82, 0.18, 1] }}
        >
          {/* Segment dividers */}
          {WHEEL_ITEMS.map((_, i) => (
            <div
              key={i}
              className="absolute top-0 left-1/2 w-[1px] h-1/2 origin-bottom bg-black/50"
              style={{
                transform: `translateX(-50%) rotate(${i * SEGMENT_ANGLE}deg)`,
              }}
            />
          ))}

          {/* Inner decorative ring */}
          <div
            className="absolute rounded-full border-[2px] border-black/30"
            style={{ inset: '25%' }}
          />

          {/* Icons on segments */}
          {WHEEL_ITEMS.map((item, i) => {
            const midAngle = ((i + 0.5) * SEGMENT_ANGLE - 90) * (Math.PI / 180);
            const radius = 120;
            const x = 170 + radius * Math.cos(midAngle);
            const y = 170 + radius * Math.sin(midAngle);
            return (
              <span
                key={`icon-${i}`}
                className="absolute text-sm drop-shadow-lg"
                style={{
                  left: x,
                  top: y,
                  transform: 'translate(-50%, -50%)',
                  fontSize: '14px',
                }}
              >
                {item.wheelIcon}
              </span>
            );
          })}
        </motion.div>

        {/* Center hub */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle at 35% 35%, #2a2a2a, #050505)',
            boxShadow: '0 0 30px rgba(197,160,89,0.4), 0 0 0 4px #c5a059, 0 0 0 6px #1a1408, 0 0 0 8px rgba(197,160,89,0.3)',
          }}
        >
          <span className="text-[#c5a059] font-black italic text-3xl">₹</span>
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="mt-16 font-mono text-[#c5a059]/50 uppercase tracking-[0.5em] text-[11px] font-bold"
      >
        Fate is deciding...
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
              animate={{ opacity: 0.9 }}
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
              <h2 className="text-5xl md:text-[100px] font-black italic uppercase tracking-tighter leading-[0.85]">
                {item.title}
              </h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-neutral-500 text-xl md:text-2xl font-black italic mt-4"
              >
                &ldquo;{item.subtitle}&rdquo;
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

const StoryboardStage = ({ item, sceneIndex, onNext, onReset }) => {
  const scene = SCENE_CONFIG[sceneIndex];
  const currentImage = item.images[sceneIndex];
  const currentText = item.texts?.[sceneIndex] || '';
  const lines = currentText.split('\n');
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
          {/* Full-screen image as background */}
          <div className="absolute inset-0 z-0">
            <motion.img
              key={`bg-${sceneIndex}`}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 0.45, scale: 1 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              src={currentImage}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/85 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/60" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex-1 flex flex-col px-8 py-8 md:px-20 md:py-12 max-w-3xl">
            {/* Progress indicator */}
            <div className="flex items-center gap-4 mb-10">
              {SCENE_CONFIG.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all duration-700"
                    style={{
                      borderColor: i <= sceneIndex ? scene.accent : 'rgba(255,255,255,0.1)',
                      backgroundColor: i <= sceneIndex ? scene.accentBg : 'transparent',
                      color: i <= sceneIndex ? scene.accent : 'rgba(255,255,255,0.2)',
                    }}
                  >
                    {s.number}
                  </div>
                  {i < 2 && (
                    <div
                      className="w-12 md:w-20 h-[2px] rounded-full transition-all duration-700"
                      style={{
                        backgroundColor: i < sceneIndex ? scene.accent : 'rgba(255,255,255,0.08)',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Scene label with accent bar */}
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="flex items-center gap-4 mb-8"
            >
              <div
                className="w-1 h-10 rounded-full"
                style={{ backgroundColor: scene.accent }}
              />
              <div>
                <span
                  className="text-sm md:text-base font-black uppercase tracking-[0.3em] block"
                  style={{ color: scene.accent }}
                >
                  {scene.label}
                </span>
                <span className="text-white/25 text-[10px] md:text-xs uppercase tracking-widest font-bold">
                  {scene.sublabel}
                </span>
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="mb-8"
            >
              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tight leading-[0.9]">
                {item.title}
              </h2>
              <p className="text-white/20 text-base md:text-lg italic font-bold mt-2">
                &ldquo;{item.subtitle}&rdquo;
              </p>
            </motion.div>

            {/* Narrative text — cinematic reveal */}
            <div className="flex-1 flex flex-col justify-center mb-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="relative max-w-xl rounded-lg overflow-hidden"
              >
                {/* Glass card background */}
                <div
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, ${scene.accent}08, rgba(255,255,255,0.02), ${scene.accent}05)`,
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: `1px solid ${scene.accent}15`,
                  }}
                />

                <div className="relative p-6 md:p-8">
                  {/* Accent glow dot */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="w-2 h-2 rounded-full mb-5"
                    style={{
                      backgroundColor: scene.accent,
                      boxShadow: `0 0 12px ${scene.accent}80, 0 0 30px ${scene.accent}40`,
                    }}
                  />

                  {lines.map((line, i) => {
                    const isFirstLine = i === 0;
                    const isQuote = line.startsWith('"') || line.startsWith('\u201C');

                    return (
                      <motion.p
                        key={i}
                        custom={i}
                        initial="hidden"
                        animate="visible"
                        variants={lineVariants}
                        className={`mb-2 ${
                          isFirstLine
                            ? 'text-xl md:text-2xl font-bold text-white/95 leading-snug'
                            : isQuote
                              ? 'text-base md:text-lg italic font-semibold leading-relaxed pl-4'
                              : 'text-base md:text-lg font-medium text-white/65 leading-relaxed'
                        }`}
                        style={{
                          textShadow: '0 2px 12px rgba(0,0,0,0.6)',
                          ...(isQuote ? { color: scene.accent, borderLeft: `2px solid ${scene.accent}50`, } : {}),
                        }}
                      >
                        {line}
                      </motion.p>
                    );
                  })}

                  {/* Bottom accent line */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5 + lines.length * 0.18, duration: 0.8 }}
                    className="h-[1px] mt-4 origin-left"
                    style={{
                      background: `linear-gradient(to right, ${scene.accent}60, transparent)`,
                    }}
                  />
                </div>
              </motion.div>
            </div>

            {/* Bottom actions */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: scene.accent }}
                />
                <span className="text-white/20 text-xs uppercase tracking-widest font-bold">
                  {item.category}
                </span>
              </div>

              {isLastScene ? (
                <button
                  onClick={onReset}
                  className="px-10 py-4 text-black font-black uppercase italic tracking-widest transition-all cursor-pointer text-sm rounded-sm"
                  style={{
                    background: 'linear-gradient(135deg, #c5a059, #e8c878)',
                    boxShadow: '0 4px 20px rgba(197,160,89,0.3)',
                  }}
                  aria-label="Spin again"
                >
                  Spin Again
                </button>
              ) : (
                <button
                  onClick={onNext}
                  className="px-8 py-4 border text-white font-black uppercase italic tracking-widest hover:bg-white/5 transition-all cursor-pointer group text-sm backdrop-blur-md rounded-sm"
                  style={{ borderColor: `${scene.accent}40` }}
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

          {/* Right-side image peek (desktop only) */}
          <div className="hidden md:block absolute right-0 top-0 bottom-0 w-[45%] z-5 pointer-events-none">
            <motion.img
              key={`peek-${sceneIndex}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 0.7, x: 0 }}
              transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
              src={currentImage}
              alt=""
              className="w-full h-full object-cover"
              style={{
                maskImage: 'linear-gradient(to right, transparent 0%, black 30%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 30%)',
              }}
            />
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
  const seenIdsRef = useRef(new Set());

  const handleSpin = () => {
    let available = REGRET_DATA.filter((r) => !seenIdsRef.current.has(r.id));
    if (available.length === 0) {
      seenIdsRef.current.clear();
      available = REGRET_DATA;
    }
    const item = available[Math.floor(Math.random() * available.length)];
    seenIdsRef.current.add(item.id);

    const matchingIndices = WHEEL_ITEMS
      .map((w, idx) => (w.id === item.id ? idx : -1))
      .filter((idx) => idx !== -1);
    const segmentIndex =
      matchingIndices[Math.floor(Math.random() * matchingIndices.length)];

    const offset = (360 - segmentIndex * SEGMENT_ANGLE) % 360;
    const fullSpins = (5 + Math.floor(Math.random() * 3)) * 360;

    setSelectedItem(item);
    setWheelRotation(fullSpins + offset);
    setSpinKey((prev) => prev + 1);
    setSceneIndex(0);
    setStage('spinning');
  };

  const handleSpinComplete = () => setStage('storyboard');

  const handleNextScene = () => {
    if (sceneIndex < 2) setSceneIndex((prev) => prev + 1);
  };

  const handleReset = () => {
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
          />
        )}
      </AnimatePresence>

      <div className="fixed top-0 left-0 w-full h-1 z-50 bg-gradient-to-r from-transparent via-[#c5a059]/40 to-transparent" />
    </div>
  );
};

export default App;
