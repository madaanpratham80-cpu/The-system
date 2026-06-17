"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconSofa, IconWalk, IconBarbell, IconChevronsDown } from "@tabler/icons-react";
import SystemFrame from "@/components/SystemFrame";
import CalibratedHologram from "@/components/CalibratedHologram";
import { getSystemState, setSystemState } from "@/lib/systemState";
import { nextScreen } from "@/lib/flowMap";
import styles from "./FitnessLevel.module.css";

const LABEL = "[FITNESS BASELINE ASSESSMENT]";
const TYPE_START_DELAY = 600;
const TYPE_SPEED = 40;

const LEVELS = [
  {
    id:    "sedentary",
    Icon:  IconSofa,
    title: "I NEVER WORK OUT",
    sub:   "Sedentary lifestyle. Starting fresh.",
  },
  {
    id:    "occasional",
    Icon:  IconWalk,
    title: "I WORK OUT OCCASIONALLY",
    sub:   "2-3 times per month. Inconsistent.",
  },
  {
    id:    "regular",
    Icon:  IconBarbell,
    title: "I WORK OUT REGULARLY",
    sub:   "3+ times per week. Established routine.",
  },
];

/**
 * SCREEN 07B — FITNESS LEVEL (Fitness / Both path)
 * Split layout. Radio cards — no submit button, selection IS confirmation.
 * Hologram persists from 06B with calibrated body type + proportions.
 */
export default function FitnessLevel() {
  const router   = useRouter();
  const timers   = useRef([]);
  const advanced = useRef(false);

  const [name,         setName]         = useState("");
  const [gender,       setGender]       = useState(null);
  const [bodyType,     setBodyType]     = useState(null);
  const [heightCm,     setHeightCm]     = useState(null);
  const [weightKg,     setWeightKg]     = useState(null);

  const [typed,        setTyped]        = useState("");
  const [typingDone,   setTypingDone]   = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showExplain,  setShowExplain]  = useState(false);
  const [showCards,    setShowCards]    = useState(false);

  const [selected, setSelected] = useState(null);
  const [holoGlow, setHoloGlow] = useState(false);
  const [showSys1, setShowSys1] = useState(false);
  const [showSys2, setShowSys2] = useState(false);
  const [leaving,  setLeaving]  = useState(false);

  useEffect(() => {
    const s = getSystemState();
    setName(s.name || "");
    setGender(s.gender || null);
    setBodyType(s.body_type || null);
    setHeightCm(s.height_cm || null);
    setWeightKg(s.weight_kg || null);
  }, []);

  // Typewriter
  useEffect(() => {
    let i = 0;
    let typer;
    const start = setTimeout(() => {
      typer = setInterval(() => {
        i++;
        setTyped(LABEL.slice(0, i));
        if (i >= LABEL.length) { clearInterval(typer); setTypingDone(true); }
      }, TYPE_SPEED);
    }, TYPE_START_DELAY);
    return () => { clearTimeout(start); clearInterval(typer); };
  }, []);

  // Staggered reveal
  useEffect(() => {
    if (!typingDone) return;
    const t = [
      setTimeout(() => setShowQuestion(true), 400),
      setTimeout(() => setShowExplain(true),  500),
      setTimeout(() => setShowCards(true),    650),
    ];
    return () => t.forEach(clearTimeout);
  }, [typingDone]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const proceed = useCallback(() => {
    if (advanced.current) return;
    advanced.current = true;
    setLeaving(true);
    const path = getSystemState().path || "fitness";
    setTimeout(() => router.push(nextScreen(path, "/screen-07b")), 600);
  }, [router]);

  useEffect(() => {
    if (!showSys2) return;
    const onWheel = (e) => { if (e.deltaY > 0) proceed(); };
    const onKey   = (e) => {
      if (["ArrowDown", "PageDown", "Enter", " "].includes(e.key)) proceed();
    };
    window.addEventListener("wheel",   onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel",   onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [showSys2, proceed]);

  const handleSelect = (id) => {
    if (selected) return; // radio lock
    setSelected(id);
    setSystemState({ fitness_level: id });

    // Hologram glow pulse
    setHoloGlow(true);
    timers.current.push(setTimeout(() => setHoloGlow(false), 820));

    timers.current.push(setTimeout(() => setShowSys1(true), 500));
    timers.current.push(setTimeout(() => setShowSys2(true), 1100));
  };

  return (
    <SystemFrame status="[PHYSICAL CALIBRATION]">
      <div className={styles.screen} style={{ opacity: leaving ? 0 : 1 }}>

        {/* ── LEFT: question panel ── */}
        <div className={styles.leftSide}>
          <div className={styles.panel}>
            <div className={styles.progress}>STEP 4 OF 5</div>

            <div className={styles.label}>
              {typed}
              {!typingDone && <span className="cursor-blink" aria-hidden>|</span>}
            </div>

            <div
              className={styles.question}
              style={{ opacity: showQuestion ? 1 : 0, transition: "opacity 0.4s ease-out" }}
            >
              Describe your current fitness level, {name || "operator"}.
            </div>

            <div
              className={styles.explanation}
              style={{ opacity: showExplain ? 1 : 0, transition: "opacity 0.5s ease-out" }}
            >
              No judgment. Be honest. The system calibrates accordingly.
            </div>

            {/* Radio cards */}
            <div
              className={styles.cards}
              style={{ pointerEvents: selected ? "none" : "auto" }}
            >
              {LEVELS.map(({ id, Icon, title, sub }, i) => (
                <div
                  key={id}
                  role="button"
                  tabIndex={showCards ? 0 : -1}
                  onClick={() => handleSelect(id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSelect(id); }
                  }}
                  className={`${styles.card} ${selected === id ? styles.cardSelected : ""}`}
                  style={{
                    opacity:         showCards ? 1 : 0,
                    transform:       showCards ? "translateY(0)" : "translateY(16px)",
                    transition:      "opacity 0.4s ease, transform 0.4s ease",
                    transitionDelay: showCards ? `${i * 0.1}s` : "0s",
                  }}
                >
                  <Icon className={styles.icon} size={22} stroke={1.75} />
                  <div>
                    <div className={styles.cardTitle}>{title}</div>
                    <div className={styles.cardSub}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Principle note — always visible once cards are shown */}
            <div
              className={styles.principleNote}
              style={{
                opacity:    showCards ? 1 : 0,
                transition: "opacity 0.4s ease 0.4s",
              }}
            >
              All users begin at Day 1. No shortcuts. No ego. Just consistency.
            </div>

            {/* System responses */}
            {showSys1 && (
              <div
                className={styles.sysLine1}
                style={{ marginTop: 24, animation: "system-fade 0.5s ease" }}
              >
                Baseline established. Starting protocol: 10 reps daily.
              </div>
            )}
            {showSys2 && (
              <div
                className={styles.sysLine2}
                style={{ animation: "system-fade 0.5s ease" }}
              >
                The system will progress you. Trust the process.
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: calibrated hologram ── */}
        <div className={styles.rightSide}>
          <CalibratedHologram
            gender={gender}
            bodyType={bodyType}
            heightCm={heightCm}
            weightKg={weightKg}
            opacity={0.70}
            glow={holoGlow}
          />
        </div>
      </div>

      {/* Fixed scroll indicator */}
      <div
        style={{
          position:      "fixed",
          bottom:        60,
          left:          "50%",
          transform:     "translateX(-50%)",
          zIndex:        20,
          opacity:       leaving ? 0 : showSys2 ? 1 : 0,
          transition:    "opacity 0.4s ease",
          pointerEvents: showSys2 && !leaving ? "auto" : "none",
        }}
      >
        <div
          className="anim-scroll-pulse"
          onClick={proceed}
          role="button"
          tabIndex={showSys2 && !leaving ? 0 : -1}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}
        >
          <IconChevronsDown size={16} stroke={1.5} color="rgba(255,255,255,0.25)" />
          <span style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.18)" }}>
            SCROLL TO CONTINUE
          </span>
        </div>
      </div>
    </SystemFrame>
  );
}
