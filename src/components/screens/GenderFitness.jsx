"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconMars, IconVenus, IconChevronsDown } from "@tabler/icons-react";
import SystemFrame from "@/components/SystemFrame";
import HologramFigure from "@/components/HologramFigure";
import { getSystemState, setSystemState } from "@/lib/systemState";
import { nextScreen } from "@/lib/flowMap";
import styles from "./GenderFitness.module.css";

const LABEL = "[PHYSICAL PROFILE INITIALIZATION]";
const TYPE_START_DELAY = 600;
const TYPE_SPEED = 40;

const GENDERS = [
  { id: "male",   Icon: IconMars,  title: "MALE",   sub: "Male physiology" },
  { id: "female", Icon: IconVenus, title: "FEMALE", sub: "Female physiology" },
];

/**
 * SCREEN 04B — GENDER SELECTION (Fitness / Both path)
 * Split layout: question panel left, holographic wireframe body right.
 * Selecting a gender morphs the hologram and triggers the scroll indicator.
 */
export default function GenderFitness() {
  const router   = useRouter();
  const timers   = useRef([]);
  const advanced = useRef(false);

  const [name,         setName]         = useState("");
  const [typed,        setTyped]        = useState("");
  const [typingDone,   setTypingDone]   = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showExplain,  setShowExplain]  = useState(false);
  const [showCards,    setShowCards]    = useState(false);

  const [gender,   setGender]   = useState(null);
  const [glow,     setGlow]     = useState(false);
  const [showSys1, setShowSys1] = useState(false);
  const [showSys2, setShowSys2] = useState(false);
  const [leaving,  setLeaving]  = useState(false);

  useEffect(() => { setName(getSystemState().name || ""); }, []);

  // Typewriter
  useEffect(() => {
    let i = 0;
    let typer;
    const start = setTimeout(() => {
      typer = setInterval(() => {
        i += 1;
        setTyped(LABEL.slice(0, i));
        if (i >= LABEL.length) { clearInterval(typer); setTypingDone(true); }
      }, TYPE_SPEED);
    }, TYPE_START_DELAY);
    return () => { clearTimeout(start); clearInterval(typer); };
  }, []);

  // Staggered reveal: question → explanation → cards
  useEffect(() => {
    if (!typingDone) return;
    const t = [
      setTimeout(() => setShowQuestion(true), 400),
      setTimeout(() => setShowExplain(true),  500),
      setTimeout(() => setShowCards(true),    600),
    ];
    return () => t.forEach(clearTimeout);
  }, [typingDone]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const proceed = useCallback(() => {
    if (advanced.current) return;
    advanced.current = true;
    setLeaving(true);
    const path = getSystemState().path || "fitness";
    setTimeout(() => router.push(nextScreen(path, "/screen-04b")), 600);
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
    if (gender) return;
    setGender(id);
    setGlow(true);
    setSystemState({ gender: id });
    setTimeout(() => setGlow(false), 820);
    timers.current.push(setTimeout(() => setShowSys1(true), 500));
    timers.current.push(setTimeout(() => setShowSys2(true), 1100));
  };

  return (
    <SystemFrame status="[PHYSICAL CALIBRATION]">
      <div className={styles.screen} style={{ opacity: leaving ? 0 : 1 }}>

        {/* ── LEFT: question panel ── */}
        <div className={styles.leftSide}>
          <div className={styles.panel}>
            <div className={styles.progress}>STEP 1 OF 5</div>

            <div className={styles.label}>
              {typed}
              {!typingDone && <span className="cursor-blink" aria-hidden>|</span>}
            </div>

            <div
              className={styles.question}
              style={{ opacity: showQuestion ? 1 : 0, transition: "opacity 0.4s ease-out" }}
            >
              Specify your biological classification, {name || "operator"}.
            </div>

            <div
              className={styles.explanation}
              style={{ opacity: showExplain ? 1 : 0, transition: "opacity 0.5s ease-out" }}
            >
              This calibrates your hologram and starting fitness targets.
            </div>

            <div
              className={styles.cards}
              style={{ pointerEvents: gender ? "none" : "auto" }}
            >
              {GENDERS.map(({ id, Icon, title, sub }, i) => (
                <div
                  key={id}
                  role="button"
                  tabIndex={showCards ? 0 : -1}
                  onClick={() => handleSelect(id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelect(id);
                    }
                  }}
                  className={`${styles.card} ${gender === id ? styles.cardSelected : ""}`}
                  style={{
                    opacity:         showCards ? 1 : 0,
                    transform:       showCards ? "translateY(0)" : "translateY(16px)",
                    transition:      "opacity 0.4s ease, transform 0.4s ease",
                    transitionDelay: showCards ? `${i * 0.1}s` : "0s",
                  }}
                >
                  <Icon className={styles.icon} size={24} stroke={1.75} />
                  <div>
                    <div className={styles.cardTitle}>{title}</div>
                    <div className={styles.cardSub}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {showSys1 && (
              <div
                className={styles.sysLine1}
                style={{ marginTop: 28, animation: "system-fade 0.5s ease" }}
              >
                Gender profile loaded. Hologram initialized.
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: hologram ── */}
        <div className={styles.rightSide}>
          <HologramFigure gender={gender} glow={glow} />
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
