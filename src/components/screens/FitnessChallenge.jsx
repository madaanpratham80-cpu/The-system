"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconFlame, IconTarget, IconInfinity } from "@tabler/icons-react";
import SystemFrame from "@/components/SystemFrame";
import CalibratedHologram from "@/components/CalibratedHologram";
import { getSystemState, setSystemState } from "@/lib/systemState";
import styles from "./FitnessChallenge.module.css";

const LABEL = "[COMMITMENT LEVEL SELECTION]";
const TYPE_START_DELAY = 600;
const TYPE_SPEED = 40;

const CHALLENGES = [
  { id: "50-days",    Icon: IconFlame,    title: "50 DAYS",     sub: "Shorter commitment",          recommended: false },
  { id: "100-days",   Icon: IconTarget,   title: "100 DAYS",    sub: "Proven transformation window", recommended: true  },
  { id: "open-ended", Icon: IconInfinity, title: "OPEN-ENDED",  sub: "No fixed deadline",            recommended: false },
];

/**
 * SCREEN 08B — CHALLENGE SELECTION (Fitness / Both path)
 * Final calibration screen. Split layout. Radio cards trigger a hologram
 * initialization sequence before the dashboard transition.
 */
export default function FitnessChallenge() {
  const router   = useRouter();
  const timers   = useRef([]);
  const advanced = useRef(false);

  const [name,     setName]     = useState("");
  const [gender,   setGender]   = useState(null);
  const [bodyType, setBodyType] = useState(null);
  const [heightCm, setHeightCm] = useState(null);
  const [weightKg, setWeightKg] = useState(null);

  const [typed,        setTyped]        = useState("");
  const [typingDone,   setTypingDone]   = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showExplain,  setShowExplain]  = useState(false);
  const [showCards,    setShowCards]    = useState(false);

  const [selected,    setSelected]    = useState(null);
  const [showSys1,    setShowSys1]    = useState(false);
  const [showSys2,    setShowSys2]    = useState(false);
  const [showSys3,    setShowSys3]    = useState(false);
  const [panelFade,   setPanelFade]   = useState(false); // left side fades first
  const [leaving,     setLeaving]     = useState(false); // right side + full fade

  // Hologram initialization phases
  const [holoOpacity, setHoloOpacity] = useState(0.75);
  const [holoGlow,    setHoloGlow]    = useState(false);

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

  const pulse = (on) => {
    setHoloGlow(on);
    timers.current.push(setTimeout(() => setHoloGlow(false), 820));
  };

  const handleSelect = (id) => {
    if (selected || advanced.current) return;
    setSelected(id);
    setSystemState({ challenge_type: id, onboarding_complete: true });

    // ── Hologram initialization sequence ────────────────────────────────
    // Phase 1 (0ms): opacity → 90%
    setHoloOpacity(0.90);
    pulse(true);

    // Phase 3 (1.5s): second glow burst
    timers.current.push(setTimeout(() => pulse(true), 1500));

    // Phase 4 (2.5s): settle at 80%
    timers.current.push(setTimeout(() => setHoloOpacity(0.80), 2500));

    // ── System message cascade ───────────────────────────────────────────
    timers.current.push(setTimeout(() => setShowSys1(true),  500));
    timers.current.push(setTimeout(() => setShowSys2(true), 1300));
    timers.current.push(setTimeout(() => setShowSys3(true), 2500));

    // ── Dashboard transition ─────────────────────────────────────────────
    timers.current.push(setTimeout(() => {
      advanced.current = true;
      setPanelFade(true);          // left panel fades out first (0.8s)
    }, 5500));
    timers.current.push(setTimeout(() => setLeaving(true), 5900)); // then right
    timers.current.push(setTimeout(() => router.push("/dashboard"), 7200));
  };

  return (
    <SystemFrame status="[FINAL CALIBRATION]">
      {/* Black flash overlay — fires as panel fades */}
      <div
        className={styles.flashOverlay}
        style={{ opacity: leaving ? 1 : 0 }}
      />

      <div className={styles.screen}>

        {/* ── LEFT: question panel ── */}
        <div
          className={styles.leftSide}
          style={{ opacity: panelFade ? 0 : 1, transition: "opacity 0.8s ease" }}
        >
          <div className={styles.panel}>
            <div className={styles.progress}>STEP 5 OF 5</div>

            <div className={styles.label}>
              {typed}
              {!typingDone && <span className="cursor-blink" aria-hidden>|</span>}
            </div>

            <div
              className={styles.question}
              style={{ opacity: showQuestion ? 1 : 0, transition: "opacity 0.4s ease-out" }}
            >
              Set a challenge to track your commitment, {name || "operator"}.
            </div>

            <div
              className={styles.explanation}
              style={{ opacity: showExplain ? 1 : 0, transition: "opacity 0.5s ease-out" }}
            >
              Optional. But those who set a target stay 3x more consistent.
            </div>

            {/* Challenge cards */}
            <div
              className={styles.cards}
              style={{ pointerEvents: selected ? "none" : "auto" }}
            >
              {CHALLENGES.map(({ id, Icon, title, sub, recommended }, i) => (
                <div key={id} className={styles.cardWrap}>
                  <div
                    className={styles.pill}
                    style={{
                      opacity:         recommended && showCards ? 1 : 0,
                      transition:      "opacity 0.4s ease",
                      transitionDelay: showCards ? `${i * 0.1 + 0.15}s` : "0s",
                    }}
                  >
                    RECOMMENDED
                  </div>

                  <div
                    role="button"
                    tabIndex={showCards ? 0 : -1}
                    onClick={() => handleSelect(id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSelect(id); }
                    }}
                    className={`${styles.card} ${selected === id ? styles.cardSelected : ""} ${recommended ? styles.cardRecommended : ""}`}
                    style={{
                      opacity:         showCards ? 1 : 0,
                      transform:       showCards ? "translateY(0)" : "translateY(16px)",
                      transition:      "opacity 0.4s ease, transform 0.4s ease, border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease",
                      transitionDelay: showCards ? `${i * 0.1}s` : "0s",
                    }}
                  >
                    <Icon className={styles.icon} size={20} stroke={1.75} />
                    <div className={styles.cardTitle}>{title}</div>
                    <div className={styles.cardSub}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* System responses */}
            {showSys1 && (
              <div className={styles.sysLine1} style={{ marginTop: 28, animation: "system-fade 0.5s ease" }}>
                Challenge set. Fitness system fully initialized.
              </div>
            )}
            {showSys2 && (
              <div className={styles.sysLine2} style={{ animation: "system-fade 0.5s ease" }}>
                {name || "Operator"}, your transformation begins now.
              </div>
            )}
            {showSys3 && (
              <div className={styles.sysLine3}>
                ENTERING THE SYSTEM...
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: hologram — stays visible during panel fade ── */}
        <div
          className={styles.rightSide}
          style={{ opacity: leaving ? 0 : 1, transition: "opacity 1.2s ease 0.3s" }}
        >
          <CalibratedHologram
            gender={gender}
            bodyType={bodyType}
            heightCm={heightCm}
            weightKg={weightKg}
            opacity={holoOpacity}
            glow={holoGlow}
          />
        </div>
      </div>
    </SystemFrame>
  );
}
