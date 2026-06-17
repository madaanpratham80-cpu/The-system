"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconFlame, IconTarget, IconInfinity } from "@tabler/icons-react";
import SystemFrame from "@/components/SystemFrame";
import { getSystemState, setSystemState } from "@/lib/systemState";
import styles from "./ChallengeSelect.module.css";

const LABEL = "[COMMITMENT LEVEL SELECTION]";
const TYPE_START_DELAY = 600;
const TYPE_SPEED = 40;

const CHALLENGES = [
  {
    id:          "50-days",
    Icon:        IconFlame,
    title:       "50 DAYS",
    sub:         "Shorter commitment",
    recommended: false,
  },
  {
    id:          "100-days",
    Icon:        IconTarget,
    title:       "100 DAYS",
    sub:         "Proven transformation window",
    recommended: true,
  },
  {
    id:          "open-ended",
    Icon:        IconInfinity,
    title:       "OPEN-ENDED",
    sub:         "No fixed deadline",
    recommended: false,
  },
];

/**
 * SCREEN 08A — CHALLENGE SELECTION (Academics / Both path)
 * Final calibration screen. Horizontal radio cards, no submit button.
 * Selection triggers a timed cascade of system messages then auto-navigates.
 */
export default function ChallengeSelect() {
  const router   = useRouter();
  const timers   = useRef([]);
  const advanced = useRef(false);

  const [name,         setName]         = useState("");
  const [typed,        setTyped]        = useState("");
  const [typingDone,   setTypingDone]   = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showExplain,  setShowExplain]  = useState(false);
  const [showCards,    setShowCards]    = useState(false);

  const [selected,  setSelected]  = useState(null);
  const [showSys1,  setShowSys1]  = useState(false);
  const [showSys2,  setShowSys2]  = useState(false);
  const [showSys3,  setShowSys3]  = useState(false);
  const [leaving,   setLeaving]   = useState(false);

  useEffect(() => { setName(getSystemState().name || ""); }, []);

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

  const handleSelect = (id) => {
    if (selected || advanced.current) return;
    setSelected(id);
    setSystemState({ challenge_type: id, onboarding_complete: true });

    // Cascade: sys1 → sys2 → sys3 → fade → navigate
    timers.current.push(setTimeout(() => setShowSys1(true),              500));
    timers.current.push(setTimeout(() => setShowSys2(true),             1300));
    timers.current.push(setTimeout(() => setShowSys3(true),             2500));
    timers.current.push(setTimeout(() => {
      advanced.current = true;
      setLeaving(true);
    }, 4500));
    timers.current.push(setTimeout(() => router.push("/dashboard"),      5800));
  };

  return (
    <SystemFrame status="[FINAL CALIBRATION]">
      {/* Full-screen flash overlay — fades in behind the leaving stage */}
      <div
        className={styles.flashOverlay}
        style={{ opacity: leaving ? 1 : 0 }}
      />

      <div className={styles.stage} style={{ opacity: leaving ? 0 : 1 }}>
        <div className={styles.panel}>
          <div className={styles.progress}>STEP 5 OF 5</div>

          {/* Label */}
          <div className={styles.label}>
            {typed}
            {!typingDone && <span className="cursor-blink" aria-hidden>|</span>}
          </div>

          {/* Question */}
          <div
            className={styles.question}
            style={{ opacity: showQuestion ? 1 : 0, transition: "opacity 0.4s ease-out" }}
          >
            Set a challenge to track your commitment, {name || "operator"}.
          </div>

          {/* Explanation */}
          <div
            className={styles.explanation}
            style={{ opacity: showExplain ? 1 : 0, transition: "opacity 0.5s ease-out" }}
          >
            Optional. But those who set a target are 3x more likely to stay consistent.
          </div>

          {/* Challenge cards */}
          <div
            className={styles.cards}
            style={{ pointerEvents: selected ? "none" : "auto" }}
          >
            {CHALLENGES.map(({ id, Icon, title, sub, recommended }, i) => (
              <div key={id} className={styles.cardWrap}>
                {/* Recommended pill */}
                <div
                  className={styles.pill}
                  style={{
                    opacity:    recommended && showCards ? 1 : 0,
                    transition: "opacity 0.4s ease",
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
                  <Icon className={styles.icon} size={22} stroke={1.75} />
                  <div className={styles.cardTitle}>{title}</div>
                  <div className={styles.cardSub}>{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* System responses */}
          {showSys1 && (
            <div
              className={styles.sysLine1}
              style={{ marginTop: 32, animation: "system-fade 0.5s ease" }}
            >
              Challenge set. System fully initialized.
            </div>
          )}
          {showSys2 && (
            <div
              className={styles.sysLine2}
              style={{ animation: "system-fade 0.5s ease" }}
            >
              {name || "Operator"}, your academic journey begins now.
            </div>
          )}
          {showSys3 && (
            <div className={styles.sysLine3}>
              ENTERING THE SYSTEM...
            </div>
          )}
        </div>
      </div>
    </SystemFrame>
  );
}
