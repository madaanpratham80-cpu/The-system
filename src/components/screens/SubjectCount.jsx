"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconMinus, IconPlus, IconChevronsDown } from "@tabler/icons-react";
import SystemFrame from "@/components/SystemFrame";
import { getSystemState, setSystemState } from "@/lib/systemState";
import { nextScreen } from "@/lib/flowMap";
import styles from "./SubjectCount.module.css";

const LABEL = "[SUBJECT COUNT INQUIRY]";
const TYPE_START_DELAY = 600;
const TYPE_SPEED = 40;
const MIN = 1;
const MAX = 15;
const DEFAULT = 3;

export default function SubjectCount() {
  const router = useRouter();
  const timers = useRef([]);
  const advanced = useRef(false);

  const [name, setName] = useState("");
  const [typed, setTyped] = useState("");
  const [typingDone, setTypingDone] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showCounter, setShowCounter] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const [count, setCount] = useState(DEFAULT);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSys1, setShowSys1] = useState(false);
  const [showSys2, setShowSys2] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    setName(getSystemState().name || "");
  }, []);

  // Typewriter for system label
  useEffect(() => {
    let i = 0;
    let typer;
    const start = setTimeout(() => {
      typer = setInterval(() => {
        i += 1;
        setTyped(LABEL.slice(0, i));
        if (i >= LABEL.length) {
          clearInterval(typer);
          setTypingDone(true);
        }
      }, TYPE_SPEED);
    }, TYPE_START_DELAY);
    return () => {
      clearTimeout(start);
      clearInterval(typer);
    };
  }, []);

  // Staggered reveal: question -> counter -> button
  useEffect(() => {
    if (!typingDone) return;
    const t = [
      setTimeout(() => setShowQuestion(true), 400),
      setTimeout(() => setShowCounter(true), 600),
      setTimeout(() => setShowButton(true), 700),
    ];
    return () => t.forEach(clearTimeout);
  }, [typingDone]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const proceed = useCallback(() => {
    if (advanced.current) return;
    advanced.current = true;
    setLeaving(true);
    const path = getSystemState().path || "academics";
    setTimeout(() => router.push(nextScreen(path, "/screen-06a")), 600);
  }, [router]);

  useEffect(() => {
    if (!showSys2) return;
    const onWheel = (e) => { if (e.deltaY > 0) proceed(); };
    const onKey = (e) => {
      if (["ArrowDown", "PageDown", "Enter", " "].includes(e.key)) proceed();
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [showSys2, proceed]);

  const decrement = () => {
    if (isSubmitted) return;
    setCount((c) => Math.max(MIN, c - 1));
  };

  const increment = () => {
    if (isSubmitted) return;
    setCount((c) => Math.min(MAX, c + 1));
  };

  const handleSubmit = () => {
    if (isSubmitted) return;
    setIsSubmitted(true);
    setSystemState({ num_subjects: count });
    timers.current.push(setTimeout(() => setShowSys1(true), 500));
    timers.current.push(setTimeout(() => setShowSys2(true), 1100));
  };

  const handleKeyDown = (e) => {
    if (isSubmitted) return;
    if (e.key === "Enter") { e.preventDefault(); handleSubmit(); }
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") decrement();
    if (e.key === "ArrowRight" || e.key === "ArrowUp") increment();
  };

  return (
    <SystemFrame status="[CALIBRATING...]">
      <div
        className={styles.stage}
        style={{ opacity: leaving ? 0 : 1 }}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <div className={styles.panel}>
          <div className={styles.progress}>STEP 3 OF 5</div>

          {/* Element 1 — system label (typewriter) */}
          <div className={styles.label}>
            {typed}
            {!typingDone && (
              <span className="cursor-blink" aria-hidden>|</span>
            )}
          </div>

          {/* Element 2 — question */}
          <div
            className={styles.question}
            style={{
              opacity: showQuestion ? 1 : 0,
              transition: "opacity 0.4s ease-out",
            }}
          >
            How many subjects are you studying, {name || "operator"}?
          </div>

          {/* Element 3 — counter */}
          <div
            style={{
              marginTop: 32,
              opacity: showCounter ? 1 : 0,
              transition: "opacity 0.4s ease",
            }}
          >
            <div className={styles.counter}>
              <button
                type="button"
                className={styles.counterBtn}
                onClick={decrement}
                disabled={isSubmitted || count <= MIN}
                aria-label="Decrease subject count"
              >
                <IconMinus size={18} stroke={1.75} />
              </button>

              <div className={styles.countDisplay}>{count}</div>

              <button
                type="button"
                className={styles.counterBtn}
                onClick={increment}
                disabled={isSubmitted || count >= MAX}
                aria-label="Increase subject count"
              >
                <IconPlus size={18} stroke={1.75} />
              </button>
            </div>

            {/* Element 4 — helper text */}
            <div className={styles.helper}>
              The system will generate 1 quest per subject daily.
            </div>
          </div>

          {/* Element 5 — submit button */}
          {!isSubmitted && (
            <div
              style={{
                marginTop: 28,
                opacity: showButton ? 1 : 0,
                transition: "opacity 0.4s ease",
              }}
            >
              <button
                type="button"
                className={styles.confirmBtn}
                onClick={handleSubmit}
              >
                CONFIRM SUBJECTS
              </button>
            </div>
          )}

          {/* System response */}
          {showSys1 && (
            <div
              className={styles.sysLine1}
              style={{ marginTop: 28, animation: "system-fade 0.5s ease" }}
            >
              {count} subjects recorded. Quest generator activated.
            </div>
          )}
        </div>
      </div>

      {/* Fixed scroll indicator */}
      <div
        style={{
          position: "fixed",
          bottom: 60,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          opacity: leaving ? 0 : showSys2 ? 1 : 0,
          transition: "opacity 0.4s ease",
          pointerEvents: showSys2 && !leaving ? "auto" : "none",
        }}
      >
        <div
          className="anim-scroll-pulse"
          onClick={proceed}
          role="button"
          tabIndex={showSys2 && !leaving ? 0 : -1}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
          }}
        >
          <IconChevronsDown size={16} stroke={1.5} color="rgba(255, 255, 255, 0.25)" />
          <span style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255, 255, 255, 0.18)" }}>
            SCROLL TO CONTINUE
          </span>
        </div>
      </div>
    </SystemFrame>
  );
}
