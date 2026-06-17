"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconPlayerPlay, IconClock } from "@tabler/icons-react";
import SystemFrame from "@/components/SystemFrame";
import { getSystemState, setSystemState } from "@/lib/systemState";
import styles from "./SideQuestInit.module.css";

const LABEL = "[CALIBRATION COMPLETE]";
const TYPE_START_DELAY = 600;
const TYPE_SPEED = 40;

/**
 * SCREEN 06D — SIDE QUEST INITIALIZATION
 * Final screen for the Side Quest path. Confirmation + two CTA buttons.
 * Primary triggers the full response sequence then auto-navigates to dashboard.
 * Secondary redirects immediately with deferred setup flag.
 */
export default function SideQuestInit() {
  const router   = useRouter();
  const timers   = useRef([]);
  const advanced = useRef(false);

  const [name,          setName]          = useState("");
  const [typed,         setTyped]         = useState("");
  const [typingDone,    setTypingDone]    = useState(false);
  const [showStatement, setShowStatement] = useState(false);
  const [showExplain,   setShowExplain]   = useState(false);
  const [showButtons,   setShowButtons]   = useState(false);

  const [clicked,       setClicked]       = useState(false);
  const [showSys1,      setShowSys1]      = useState(false);
  const [showSys2,      setShowSys2]      = useState(false);
  const [leaving,       setLeaving]       = useState(false);

  useEffect(() => {
    setName(getSystemState().name || "");
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

  // Staggered reveal: statement → explanation → buttons
  useEffect(() => {
    if (!typingDone) return;
    const t = [
      setTimeout(() => setShowStatement(true), 400),
      setTimeout(() => setShowExplain(true),   600),
      setTimeout(() => setShowButtons(true),   800),
    ];
    return () => t.forEach(clearTimeout);
  }, [typingDone]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const navigate = useCallback(() => {
    if (advanced.current) return;
    advanced.current = true;
    setLeaving(true);
    setTimeout(() => router.push("/dashboard"), 1000);
  }, [router]);

  const handlePrimary = () => {
    if (clicked) return;
    setClicked(true);
    setSystemState({ onboarding_complete: true, setup_mode: "active" });
    timers.current.push(setTimeout(() => setShowSys1(true), 500));
    timers.current.push(setTimeout(() => setShowSys2(true), 1500));
    timers.current.push(setTimeout(() => navigate(),        3500));
  };

  const handleSecondary = () => {
    if (clicked) return;
    setClicked(true);
    setSystemState({ onboarding_complete: true, setup_mode: "deferred" });
    setLeaving(true);
    setTimeout(() => router.push("/dashboard"), 1000);
  };

  return (
    <SystemFrame status="[SYSTEM READY]">
      <div className={styles.stage} style={{ opacity: leaving ? 0 : 1 }}>
        <div className={styles.panel}>
          <div className={styles.progress}>STEP 3 OF 3</div>

          {/* Element 1 — system label (typewriter) */}
          <div className={styles.label}>
            {typed}
            {!typingDone && <span className="cursor-blink" aria-hidden>|</span>}
          </div>

          {/* Element 2 — statement */}
          <div
            className={styles.statement}
            style={{ opacity: showStatement ? 1 : 0, transition: "opacity 0.4s ease-out" }}
          >
            Side Quest mode initialized, {name || "operator"}.
          </div>

          {/* Element 3 — explanation */}
          <div
            className={styles.explanation}
            style={{ opacity: showExplain ? 1 : 0, transition: "opacity 0.4s ease-out" }}
          >
            Simple tracking. No complexity. Just consistency.
          </div>

          {/* Element 4 — action buttons */}
          {!clicked && (
            <div
              className={styles.buttons}
              style={{ opacity: showButtons ? 1 : 0, transition: "opacity 0.4s ease-out" }}
            >
              <button type="button" className={styles.primaryBtn} onClick={handlePrimary}>
                <IconPlayerPlay size={16} stroke={1.75} />
                START TRACKING
              </button>

              <button type="button" className={styles.secondaryBtn} onClick={handleSecondary}>
                <IconClock size={16} stroke={1.75} />
                SET UP LATER
              </button>
            </div>
          )}

          {/* System response 1 */}
          {showSys1 && (
            <div
              className={styles.sysLine1}
              style={{ marginTop: 32, animation: "system-fade 0.5s ease" }}
            >
              Side Quest activated. Simple discipline begins.
            </div>
          )}

          {/* System response 2 — breathing pulse */}
          {showSys2 && (
            <div className={styles.sysLine2}>
              ENTERING THE SYSTEM...
            </div>
          )}
        </div>
      </div>
    </SystemFrame>
  );
}
