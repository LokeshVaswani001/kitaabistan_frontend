"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

function useParallax(strength = 26) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 60, damping: 18 });
  const sy = useSpring(y, { stiffness: 60, damping: 18 });

  useEffect(() => {
    const onMove = (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      x.set(nx * strength * 2);
      y.set(ny * strength);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [x, y, strength]);

  const x05 = useTransform(sx, (v) => v * 0.5);
  const y05 = useTransform(sy, (v) => v * 0.5);
  const x1 = useTransform(sx, (v) => v);
  const y1 = useTransform(sy, (v) => v);
  const x17 = useTransform(sx, (v) => v * 1.7);
  const y17 = useTransform(sy, (v) => v * 1.7);

  return {
    far: { x: x05, y: y05 },
    mid: { x: x1, y: y1 },
    near: { x: x17, y: y17 },
  };
}

function Camera({ children, scale = 1.05, duration = 26 }) {
  return (
    <motion.div
      className="absolute inset-0"
      animate={{ scale: [1, scale, 1] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

function Particle({ style, className, animation, transition }) {
  return (
    <motion.span
      className={`absolute pointer-events-none ${className || ""}`}
      style={style}
      animate={animation}
      transition={transition}
    />
  );
}

function Cloud({ className, duration = 16, delay = 0, opacity = 0.9 }) {
  return (
    <motion.div
      className={`absolute ${className}`}
      style={{
        opacity,
        filter: "blur(0.4px)",
        background: "radial-gradient(circle at 30% 40%, #ffffff, #f3f9ff 70%, #e6f1fb)",
        borderRadius: "999px",
        boxShadow: "0 10px 30px rgba(120,160,200,0.25)",
      }}
      animate={{ x: ["-6vw", "106vw"] }}
      transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
    />
  );
}

function Bird({ top, delay, size = 16 }) {
  return (
    <motion.svg
      className="absolute"
      style={{ top, width: size, height: size }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      animate={{ x: ["-8vw", "110vw"], y: [0, -18, 6, -12, 0] }}
      transition={{ duration: 11, delay, repeat: Infinity, ease: "linear" }}
    >
      <motion.path
        d="M2 12 Q7 6 12 12 Q17 6 22 12"
        animate={{ d: ["M2 12 Q7 6 12 12 Q17 6 22 12", "M2 12 Q7 12 12 12 Q17 12 22 12"] }}
        transition={{ duration: 0.45, repeat: Infinity, repeatType: "reverse" }}
      />
    </motion.svg>
  );
}

function Butterfly({ delay = 0, left = "20%", top = "55%", size = "text-xl" }) {
  return (
    <motion.div
      className={`absolute ${size}`}
      style={{ left, top }}
      animate={{
        x: [0, 70, -50, 40, 0],
        y: [0, -46, 24, -70, 0],
        rotate: [0, 18, -14, 10, 0],
      }}
      transition={{ duration: 13, repeat: Infinity, delay, ease: "easeInOut" }}
    >
      <motion.span
        className="inline-block"
        animate={{ scaleX: [1, 0.7, 1, 1.25, 1] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        🦋
      </motion.span>
    </motion.div>
  );
}

function Fireflies({ count = 14 }) {
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${(i * 7.3 + 5) % 96}%`,
        top: `${(i * 13.1 + 18) % 82}%`,
        delay: (i % 8) * 0.55,
        duration: 5 + (i % 5),
      })),
    [count]
  );
  return (
    <>
      {seeds.map((s, i) => (
        <motion.span
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            left: s.left,
            top: s.top,
            background: "#ffe9a0",
            boxShadow: "0 0 12px 4px rgba(255,225,140,0.7)",
          }}
          animate={{
            x: [0, 26, -18, 30, 0],
            y: [0, -22, 14, -30, 0],
            opacity: [0, 1, 0.35, 1, 0],
          }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </>
  );
}

function ShootingStar({ delay = 2 }) {
  return (
    <motion.span
      className="absolute top-[14%] left-[-10%] w-28 h-[2px] rounded-full"
      style={{
        background: "linear-gradient(90deg, transparent, #fff)",
        boxShadow: "0 0 14px rgba(255,255,255,0.9)",
      }}
      initial={{ x: 0, opacity: 0 }}
      animate={{ x: ["0vw", "115vw"], opacity: [0, 1, 0] }}
      transition={{ duration: 1.6, delay, repeat: Infinity, repeatDelay: 7, ease: "easeIn" }}
    />
  );
}

function Pollen({ count = 18 }) {
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${(i * 5.7 + 3) % 98}%`,
        size: 3 + (i % 4),
        delay: (i % 9) * 0.7,
        duration: 9 + (i % 6) * 2,
      })),
    [count]
  );
  return (
    <>
      {seeds.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: s.left,
            bottom: "-4%",
            width: s.size,
            height: s.size,
            background: "radial-gradient(circle, #fff8dc, #f6d98a)",
          }}
          animate={{ y: ["0vh", "-70vh"], x: [0, 40, -30, 20], opacity: [0, 1, 0] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </>
  );
}

function Flower({ left, delay }) {
  return (
    <motion.div
      className="absolute bottom-[10%] origin-bottom"
      style={{ left }}
      animate={{ rotate: [-7, 7, -7] }}
      transition={{ duration: 3.4, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="w-[3px] h-12 mx-auto" style={{ background: "linear-gradient(#5aa469, #3f8f5b)" }} />
      <div className="-mt-3 text-3xl">🌼</div>
    </motion.div>
  );
}

function Meadow() {
  const { far, mid, near } = useParallax(24);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "linear-gradient(180deg,#aee0ff,#dff3ff 55%,#fdf4e0)" }}>
      <Camera duration={30}>
        <motion.div className="absolute right-[7%] top-[8%] w-28 h-28 rounded-full" style={{ ...far, background: "radial-gradient(circle at 35% 35%, #fff4c2, var(--accent))", boxShadow: "0 0 90px rgba(255,210,120,0.85)" }} animate={{ scale: [1, 1.07, 1] }} transition={{ duration: 5, repeat: Infinity }}>
          {[...Array(12)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute left-1/2 top-1/2 w-1.5 h-8 rounded-full origin-top"
              style={{ background: "linear-gradient(#ffe9a8, transparent)", transform: `rotate(${i * 30}deg) translateY(-72px)` }}
              animate={{ opacity: [0.25, 0.85, 0.25] }}
              transition={{ duration: 3, delay: i * 0.15, repeat: Infinity }}
            />
          ))}
        </motion.div>

        <motion.div style={far}>
          <Cloud className="top-[12%] h-14 w-44" duration={34} opacity={0.95} />
          <Cloud className="top-[24%] h-10 w-32" duration={44} delay={8} opacity={0.8} />
          <Bird top="18%" delay={0} />
          <Bird top="26%" delay={3.5} size={13} />
        </motion.div>

        <motion.svg viewBox="0 0 400 160" preserveAspectRatio="none" className="absolute bottom-0 w-full h-[42%]" style={mid}>
          <path d="M0,160 Q120,70 260,120 T400,90 L400,160 Z" fill="#a7dba7" />
          <path d="M0,160 Q140,110 300,140 T400,130 L400,160 Z" fill="#79c487" />
        </motion.svg>

        <motion.div className="absolute inset-x-0 bottom-0 h-[34%]" style={{ ...near, background: "linear-gradient(180deg,#9ed39a,#5fb274)" }} />

        <motion.div style={near}>
          {["6%", "17%", "28%", "39%", "50%", "61%", "72%", "83%", "92%"].map((left, i) => (
            <Flower key={left} left={left} delay={i * 0.25} />
          ))}
          <Butterfly />
          <Butterfly delay={4.5} left="72%" top="38%" size="text-lg" />
          <Pollen />
        </motion.div>
      </Camera>
    </div>
  );
}

function Night() {
  const { far, near } = useParallax(20);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "linear-gradient(180deg,#071233,#14265c 55%,#2b3f7d)" }}>
      <Camera scale={1.07} duration={34}>
        <motion.div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 75% 20%, rgba(90,140,255,0.35), transparent 55%)" }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 9, repeat: Infinity }}
        />

        <motion.div className="absolute right-[10%] top-[10%] w-24 h-24 rounded-full" style={{ ...far, background: "radial-gradient(circle at 30% 30%, #fffdf3, #f4e8bc)", boxShadow: "0 0 70px rgba(255,244,200,0.6)" }} animate={{ y: [0, -12, 0], boxShadow: ["0 0 50px rgba(255,244,200,0.45)", "0 0 95px rgba(255,244,200,0.75)", "0 0 50px rgba(255,244,200,0.45)"] }} transition={{ duration: 7, repeat: Infinity }} />

        {[...Array(56)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-white"
            style={{ left: `${(i * 4.3 + 1) % 100}%`, top: `${(i * 7.7) % 72}%`, width: i % 7 === 0 ? 3 : 1.6, height: i % 7 === 0 ? 3 : 1.6 }}
            animate={{ opacity: [0.1, 1, 0.1], scale: [0.7, 1.35, 0.7] }}
            transition={{ duration: 1.4 + (i % 5) * 0.5, delay: (i % 11) * 0.17, repeat: Infinity }}
          />
        ))}

        <ShootingStar delay={2.5} />
        <ShootingStar delay={9} />

        <svg viewBox="0 0 400 140" preserveAspectRatio="none" className="absolute bottom-0 w-full h-[36%]" style={far}>
          <path d="M0,140 L0,80 L40,96 L70,60 L110,92 L150,52 L200,88 L240,64 L280,96 L320,58 L360,90 L400,70 L400,140 Z" fill="#050b22" />
        </svg>
        <motion.div className="absolute inset-x-0 bottom-0 h-[22%]" style={{ ...near, background: "linear-gradient(180deg, transparent, rgba(5,11,34,0.9))" }} />
        <div style={near}>
          <Fireflies />
        </div>
        <motion.div
          className="absolute left-1/2 bottom-14 -translate-x-1/2 text-4xl"
          animate={{ y: [0, -10, 0], rotate: [0, 8, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          🌙
        </motion.div>
      </Camera>
    </div>
  );
}

function Mountain() {
  const { far, mid, near } = useParallax(22);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "linear-gradient(180deg,#9fd8ff,#e7f6ff 55%,#f8f0dd)" }}>
      <Camera duration={28}>
        <motion.div className="absolute left-[8%] top-[12%] w-24 h-24 rounded-full" style={{ ...far, background: "radial-gradient(circle at 35% 35%, #fff3bf, var(--accent))", boxShadow: "0 0 80px rgba(255,214,130,0.8)" }} animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 6, repeat: Infinity }} />
        <motion.div style={far}>
          <Cloud className="top-[16%] h-12 w-40" duration={38} />
          <Cloud className="top-[30%] h-9 w-28" duration={48} delay={10} opacity={0.75} />
          <Bird top="22%" delay={1} />
          <Bird top="30%" delay={5} size={12} />
        </motion.div>

        <svg viewBox="0 0 400 180" preserveAspectRatio="none" className="absolute bottom-0 w-full h-[58%]" style={far}>
          <motion.path d="M0,180 L80,50 L170,180 Z" fill="#8fb9d6" animate={{ opacity: [0.85, 1, 0.85] }} transition={{ duration: 8, repeat: Infinity }} />
          <path d="M60,74 L80,50 L100,74 L90,70 L80,76 L70,70 Z" fill="#ffffff" />
        </svg>

        <svg viewBox="0 0 400 180" preserveAspectRatio="none" className="absolute bottom-0 w-full h-[46%]" style={mid}>
          <path d="M60,180 L220,30 L360,180 Z" fill="#4f9b7f" />
          <path d="M190,66 L220,30 L252,70 L236,64 L220,72 L204,64 Z" fill="#ffffff" />
          <path d="M0,180 L100,110 L200,180 Z" fill="#3d866c" />
        </svg>

        <motion.div className="absolute inset-x-0 bottom-0 h-[26%]" style={{ ...near, background: "linear-gradient(180deg, #63b98a, #2f7a5f)" }} />
        <motion.div
          className="absolute bottom-[24%] left-0 right-0 h-16"
          style={{ ...far, background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.65))" }}
          animate={{ opacity: [0.35, 0.8, 0.35] }}
          transition={{ duration: 7, repeat: Infinity }}
        />
        <div style={near}>
          <Butterfly delay={2} left="30%" top="52%" />
          <Pollen count={10} />
        </div>
      </Camera>
    </div>
  );
}

function Mosque() {
  const { far, near } = useParallax(22);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "linear-gradient(180deg,#0f3b57,#1d7a76 52%,#f6c76c)" }}>
      <Camera duration={32}>
        <motion.div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 95%, rgba(255,214,130,0.5), transparent 60%)" }} animate={{ opacity: [0.55, 1, 0.55] }} transition={{ duration: 6, repeat: Infinity }} />

        <motion.div className="absolute right-[14%] top-[12%] w-16 h-16" style={far} animate={{ rotate: [0, 12, 0] }} transition={{ duration: 6, repeat: Infinity }}>
          <div className="w-full h-full rounded-full" style={{ background: "radial-gradient(circle at 32% 32%, #fffdf3, #ffe6a8)", boxShadow: "0 0 50px rgba(255,236,180,0.75)" }} />
          <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle at 68% 60%, rgba(15,59,87,0.95) 34%, transparent 36%)" }} />
        </motion.div>

        {[...Array(34)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-white"
            style={{ left: `${(i * 6.1 + 2) % 96}%`, top: `${(i * 5.3) % 58}%`, width: 1.7, height: 1.7 }}
            animate={{ opacity: [0.15, 1, 0.15] }}
            transition={{ duration: 1.8 + (i % 4) * 0.4, delay: (i % 9) * 0.2, repeat: Infinity }}
          />
        ))}

        <svg viewBox="0 0 400 200" preserveAspectRatio="none" className="absolute bottom-0 w-full h-[58%]" style={far}>
          <rect x="40" y="96" width="320" height="104" fill="#0c3440" />
          <path d="M158,96 Q200,26 242,96 Z" fill="#0c3440" />
          <rect x="92" y="36" width="15" height="164" fill="#0c3440" />
          <rect x="293" y="36" width="15" height="164" fill="#0c3440" />
          <path d="M92,36 Q99.5,12 107,36 Z" fill="#0c3440" />
          <path d="M293,36 Q300.5,12 308,36 Z" fill="#0c3440" />
          <motion.path
            d="M184,168 a16,16 0 0 1 32,0 v32 h-32 Z"
            fill="#ffd77d"
            animate={{ opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </svg>

        <div className="absolute bottom-[18%] left-0 right-0 flex justify-around" style={near}>
          {["12%", "30%", "70%", "88%"].map((_, i) => (
            <motion.div
              key={i}
              className="origin-top"
              animate={{ rotate: [-9, 9, -9] }}
              transition={{ duration: 4 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
            >
              <div className="w-px h-10 mx-auto" style={{ background: "rgba(255,236,180,0.6)" }} />
              <div className="text-3xl drop-shadow">🪔</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="absolute left-1/2 bottom-6 -translate-x-1/2 text-4xl"
          style={near}
          animate={{ y: [0, -9, 0], scale: [1, 1.07, 1] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          🤲
        </motion.div>
      </Camera>
    </div>
  );
}

function Forest() {
  const { far, mid, near } = useParallax(22);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "linear-gradient(180deg,#dff6e8,#9fd8b0 45%,#4f9b6f)" }}>
      <Camera duration={34}>
        <motion.div className="absolute left-[12%] top-[8%] w-24 h-24 rounded-full" style={{ ...far, background: "radial-gradient(circle at 35% 35%, #fffbe0, #ffe9a3)", boxShadow: "0 0 70px rgba(255,236,170,0.85)" }} animate={{ opacity: [0.8, 1, 0.8] }} transition={{ duration: 6, repeat: Infinity }} />

        <motion.div style={far}>
          <Cloud className="top-[13%] h-10 w-36" duration={42} opacity={0.6} />
          <Bird top="22%" delay={1.5} size={14} />
        </motion.div>

        <svg viewBox="0 0 400 180" preserveAspectRatio="none" className="absolute bottom-0 w-full h-[72%]" style={far}>
          {[0, 45, 90, 135, 180, 225, 270, 315, 360].map((x) => (
            <path key={x} d={`M${x},180 L${x + 22},74 L${x + 44},180 Z`} fill="#2f7d5b" />
          ))}
        </svg>

        <svg viewBox="0 0 400 180" preserveAspectRatio="none" className="absolute bottom-0 w-full h-[58%]" style={mid}>
          {[10, 70, 130, 190, 250, 310, 370].map((x) => (
            <g key={x}>
              <rect x={x + 18} y={92} width={8} height={88} fill="#5b3a24" />
              <circle cx={x + 22} cy={80} r={34} fill="#3f9e6d" />
              <circle cx={x + 4} cy={98} r={22} fill="#49ab78" />
            </g>
          ))}
        </svg>

        <motion.div className="absolute inset-x-0 bottom-0 h-[24%]" style={{ ...near, background: "linear-gradient(180deg,#63b98a,#2f7a5f)" }} />

        <div style={near}>
          {["8%", "24%", "58%", "76%", "90%"].map((left, i) => (
            <motion.div
              key={left}
              className="absolute text-2xl"
              style={{ left, bottom: "7%" }}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3.2, delay: i * 0.4, repeat: Infinity, ease: "easeInOut" }}
            >
              🍄
            </motion.div>
          ))}
          <Butterfly delay={1} left="34%" top="46%" />
          <Pollen count={12} />
        </div>
      </Camera>
    </div>
  );
}

function River() {
  const { far, near } = useParallax(20);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "linear-gradient(180deg,#aee0ff,#dff3ff 52%,#e9f7e6)" }}>
      <Camera duration={30}>
        <motion.div className="absolute right-[10%] top-[9%] w-24 h-24 rounded-full" style={{ ...far, background: "radial-gradient(circle at 35% 35%, #fff6c8, var(--accent))", boxShadow: "0 0 80px rgba(255,214,130,0.8)" }} animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 6, repeat: Infinity }} />

        <motion.div style={far}>
          <Cloud className="top-[12%] h-12 w-40" duration={36} />
          <Cloud className="top-[26%] h-9 w-28" duration={48} delay={9} opacity={0.75} />
          <Bird top="18%" delay={0.5} />
        </motion.div>

        <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="absolute bottom-[34%] w-full h-[26%]" style={far}>
          <path d="M0,120 Q100,40 220,90 T400,60 L400,120 Z" fill="#a7dba7" />
          <path d="M0,120 Q140,80 300,110 T400,100 L400,120 Z" fill="#79c487" />
        </svg>

        <div className="absolute inset-x-0 bottom-0 h-[36%]" style={{ background: "linear-gradient(180deg,#8fd3f4,#4db6e8 55%,#2f9ad0)" }} />

        <motion.svg viewBox="0 0 800 80" preserveAspectRatio="none" className="absolute bottom-[30%] w-full h-16" style={near}>
          <motion.path
            d="M0,40 Q50,10 100,40 T200,40 T300,40 T400,40 T500,40 T600,40 T700,40 T800,40 L800,80 L0,80 Z"
            fill="#bfe8fa"
            fillOpacity="0.8"
            animate={{ x: [0, -400] }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
          />
        </motion.svg>

        <motion.svg viewBox="0 0 800 60" preserveAspectRatio="none" className="absolute bottom-[16%] w-full h-12" style={near}>
          <motion.path
            d="M0,30 Q50,6 100,30 T200,30 T300,30 T400,30 T500,30 T600,30 T700,30 T800,30 L800,60 L0,60 Z"
            fill="#6ec3ec"
            animate={{ x: [-400, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
          />
        </motion.svg>

        <motion.div className="absolute inset-x-0 bottom-[36%] h-10" style={{ ...far, background: "linear-gradient(180deg, rgba(255,255,255,0.55), transparent)" }} animate={{ opacity: [0.4, 0.85, 0.4] }} transition={{ duration: 6, repeat: Infinity }} />

        <motion.span
          className="absolute text-2xl"
          style={{ left: "26%", bottom: "30%" }}
          animate={{ y: [0, -74, 0], x: [0, 44, 88], rotate: [0, -42, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 5, ease: "easeOut" }}
        >
          🐟
        </motion.span>

        <motion.div
          className="absolute text-3xl"
          style={{ left: "4%", bottom: "33%" }}
          animate={{ x: ["-4vw", "62vw"], y: [0, 5, 0, 4, 0], rotate: [0, 5, -4, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          🦆
        </motion.div>

        <div style={near}>
          {["10%", "40%", "70%", "88%"].map((left) => (
            <div key={left} className="absolute text-xl" style={{ left, bottom: "3%", opacity: 0.9 }}>
              🪨
            </div>
          ))}
        </div>
      </Camera>
    </div>
  );
}

const SCENES = { meadow: Meadow, night: Night, mountain: Mountain, mosque: Mosque, forest: Forest, river: River };

export default function PoemScene({ scene }) {
  const Scene = SCENES[scene] || Meadow;
  const ref = useRef(null);

  return (
    <motion.div
      key={scene}
      ref={ref}
      className="absolute inset-0"
      initial={{ opacity: 0, scale: 1.06 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <Scene />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.14), transparent)" }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40" style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.22), transparent)" }} />
    </motion.div>
  );
}
