"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconChevronsDown } from "@tabler/icons-react";
import SystemFrame from "@/components/SystemFrame";
import { getSystemState, setSystemState } from "@/lib/systemState";
import { nextScreen } from "@/lib/flowMap";
import styles from "./ExamDeadline.module.css";

const LABEL = "[URGENCY CALIBRATION]";
const TYPE_START_DELAY = 600;
const TYPE_SPEED = 40;

// ── Date helpers ──────────────────────────────────────────────────────────────

function getValidationError(dd, mm, yyyy) {
  if (!dd.trim() || !mm.trim() || !yyyy.trim()) return null; // incomplete — no error yet

  const d = Number(dd);
  const m = Number(mm);
  const y = Number(yyyy);

  if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y)) {
    return "Enter a valid future date.";
  }
  if (yyyy.length < 4) return "Enter a valid future date.";

  const currentYear = new Date().getFullYear();
  if (d < 1 || d > 31) return "Enter a valid future date.";
  if (m < 1 || m > 12) return "Enter a valid future date.";
  if (y < currentYear || y > currentYear + 2) return "Enter a valid future date.";

  // Catch impossible dates (Feb 30, Apr 31, etc.)
  const date = new Date(y, m - 1, d);
  if (date.getDate() !== d || date.getMonth() !== m - 1 || date.getFullYear() !== y) {
    return "Enter a valid future date.";
  }

  // Must be tomorrow or later
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date < tomorrow) return "Deadline must be in the future.";

  return ""; // valid
}

function calcDaysRemaining(dd, mm, yyyy) {
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((date - today) / (1000 * 60 * 60 * 24));
}

/**
 * SCREEN 07A — EXAM DEADLINE (Academics / Both path)
 * Centered panel. Three-field DD/MM/YYYY date entry with auto-tab.
 */
export default function ExamDeadline() {
  const router   = useRouter();
  const timers   = useRef([]);
  const advanced = useRef(false);
  const dayRef   = useRef(null);
  const monthRef = useRef(null);
  const yearRef  = useRef(null);

  const [name,         setName]         = useState("");
  const [typed,        setTyped]        = useState("");
  const [typingDone,   setTypingDone]   = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showExplain,  setShowExplain]  = useState(false);
  const [showDate,     setShowDate]     = useState(false);
  const [showButton,   setShowButton]   = useState(false);

  const [dd, setDd] = useState("");
  const [mm, setMm] = useState("");
  const [yy, setYy] = useState("");

  const [isSubmitted,   setIsSubmitted]   = useState(false);
  const [showError,     setShowError]     = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [showSys1,      setShowSys1]      = useState(false);
  const [showSys2,      setShowSys2]      = useState(false);
  const [leaving,       setLeaving]       = useState(false);

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
      setTimeout(() => setShowExplain(true),  600),
      setTimeout(() => setShowDate(true),     700),
      setTimeout(() => setShowButton(true),   800),
      setTimeout(() => dayRef.current?.focus(), 950),
    ];
    return () => t.forEach(clearTimeout);
  }, [typingDone]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const proceed = useCallback(() => {
    if (advanced.current) return;
    advanced.current = true;
    setLeaving(true);
    const path = getSystemState().path || "academics";
    setTimeout(() => router.push(nextScreen(path, "/screen-07a")), 600);
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

  // ── Field handlers ────────────────────────────────────────────────────────

  const handleDd = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 2);
    setDd(v);
    setShowError(false);
    if (v.length === 2) monthRef.current?.focus();
  };

  const handleMm = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 2);
    setMm(v);
    setShowError(false);
    if (v.length === 2) yearRef.current?.focus();
  };

  const handleYy = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 4);
    setYy(v);
    setShowError(false);
  };

  // ── Keyboard: Enter submits; Backspace in empty field steps back ──────────

  const handleDdKey = (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleSubmit(); }
  };

  const handleMmKey = (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleSubmit(); }
    if (e.key === "Backspace" && mm === "") dayRef.current?.focus();
  };

  const handleYyKey = (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleSubmit(); }
    if (e.key === "Backspace" && yy === "") monthRef.current?.focus();
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const validationError = getValidationError(dd, mm, yy);
  const isFormValid = validationError === "";

  const handleSubmit = () => {
    if (isSubmitted) return;
    if (!isFormValid) { setShowError(true); return; }

    setIsSubmitted(true);
    const days = calcDaysRemaining(dd, mm, yy);
    setDaysRemaining(days);

    const isoDate = `${yy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    setSystemState({ exam_deadline: isoDate, days_remaining: days });

    timers.current.push(setTimeout(() => setShowSys1(true), 500));
    timers.current.push(setTimeout(() => setShowSys2(true), 1100));
  };

  const displayError = showError && validationError ? validationError : "";

  return (
    <SystemFrame status="[CALIBRATING...]">
      <div className={styles.stage} style={{ opacity: leaving ? 0 : 1 }}>
        <div className={styles.panel}>
          <div className={styles.progress}>STEP 4 OF 5</div>

          {/* Element 1 — label */}
          <div className={styles.label}>
            {typed}
            {!typingDone && <span className="cursor-blink" aria-hidden>|</span>}
          </div>

          {/* Element 2 — question */}
          <div
            className={styles.question}
            style={{ opacity: showQuestion ? 1 : 0, transition: "opacity 0.4s ease-out" }}
          >
            When is your exam or deadline, {name || "operator"}?
          </div>

          {/* Element 3 — explanation */}
          <div
            className={styles.explanation}
            style={{ opacity: showExplain ? 1 : 0, transition: "opacity 0.4s ease-out" }}
          >
            The system will increase quest intensity as your deadline approaches.
          </div>

          {/* Element 4 — date input */}
          <div
            style={{ opacity: showDate ? 1 : 0, transition: "opacity 0.4s ease", marginTop: 32 }}
          >
            <div className={styles.dateRow}>
              <input
                ref={dayRef}
                type="text"
                inputMode="numeric"
                maxLength={2}
                placeholder="DD"
                className={`${styles.dateInput} ${styles.dateInputNarrow} ${isSubmitted ? styles.dateInputDone : ""}`}
                value={dd}
                onChange={handleDd}
                onKeyDown={handleDdKey}
                readOnly={isSubmitted}
                aria-label="Day"
              />
              <span className={styles.dateSep}>/</span>
              <input
                ref={monthRef}
                type="text"
                inputMode="numeric"
                maxLength={2}
                placeholder="MM"
                className={`${styles.dateInput} ${styles.dateInputNarrow} ${isSubmitted ? styles.dateInputDone : ""}`}
                value={mm}
                onChange={handleMm}
                onKeyDown={handleMmKey}
                readOnly={isSubmitted}
                aria-label="Month"
              />
              <span className={styles.dateSep}>/</span>
              <input
                ref={yearRef}
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder="YYYY"
                className={`${styles.dateInput} ${styles.dateInputWide} ${isSubmitted ? styles.dateInputDone : ""}`}
                value={yy}
                onChange={handleYy}
                onKeyDown={handleYyKey}
                readOnly={isSubmitted}
                aria-label="Year"
              />
            </div>

            {displayError && (
              <div
                className={styles.error}
                style={{ animation: "system-fade 0.2s ease" }}
              >
                {displayError}
              </div>
            )}
          </div>

          {/* Element 5 — submit */}
          {!isSubmitted && (
            <div
              className={styles.btnWrap}
              style={{ opacity: showButton ? 1 : 0, transition: "opacity 0.4s ease" }}
            >
              <button
                type="button"
                className={styles.confirmBtn}
                onClick={handleSubmit}
                disabled={!isFormValid}
              >
                SET DEADLINE
              </button>
            </div>
          )}

          {/* System response */}
          {showSys1 && (
            <div
              className={styles.sysLine1}
              style={{ marginTop: 28, animation: "system-fade 0.5s ease" }}
            >
              Deadline recorded. Urgency engine engaged. {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} until exam.
            </div>
          )}
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
