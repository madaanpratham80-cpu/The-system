"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SystemFrame from "@/components/SystemFrame";
import { getSystemState, setSystemState } from "@/lib/systemState";
import { nextScreen } from "@/lib/flowMap";
import styles from "./AgeAcademics.module.css";

const LABEL = "[AGE CALIBRATION REQUIRED]";
const TYPE_START_DELAY = 600;
const TYPE_SPEED = 40;
const MIN_AGE = 13;
const MAX_AGE = 80;

function validateAge(raw) {
  if (raw.trim() === "")
    return "Age required. Enter a number between 13 and 80.";
  const n = Number(raw);
  if (!Number.isFinite(n))
    return "Age required. Enter a number between 13 and 80.";
  if (n < MIN_AGE) return "Must be at least 13.";
  if (n > MAX_AGE) return "Must be 80 or under.";
  return "";
}

/**
 * SCREEN 04A — AGE INPUT (Academics path)
 * First calibration question. Asks the user's age for "learning curve
 * optimization", then invites them to scroll to the next screen.
 */
export default function AgeAcademics() {
  const router = useRouter();
  const inputRef = useRef(null);
  const timers = useRef([]);
  const advanced = useRef(false);

  const [name, setName] = useState("");
  const [typed, setTyped] = useState("");
  const [typingDone, setTypingDone] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const [age, setAge] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSys1, setShowSys1] = useState(false);
  const [showSys2, setShowSys2] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    setName(getSystemState().name || "");
  }, []);

  // Typewriter for the system label
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

  // Staggered reveal: question -> input -> button
  useEffect(() => {
    if (!typingDone) return;
    const t = [
      setTimeout(() => setShowQuestion(true), 400),
      setTimeout(() => setShowInput(true), 600),
      setTimeout(() => setShowButton(true), 700),
      setTimeout(() => inputRef.current?.focus(), 900),
    ];
    return () => t.forEach(clearTimeout);
  }, [typingDone]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const proceed = () => {
    if (advanced.current) return;
    advanced.current = true;
    setLeaving(true);
    const path = getSystemState().path || "academics";
    setTimeout(() => router.push(nextScreen(path, "/screen-04a")), 600);
  };

  // After submission, scroll / arrow / click advances to the next screen
  useEffect(() => {
    if (!showSys2) return;
    const onWheel = (e) => {
      if (e.deltaY > 0) proceed();
    };
    const onKey = (e) => {
      if (["ArrowDown", "PageDown", "Enter", " "].includes(e.key)) proceed();
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSys2]);

  const handleChange = (e) => {
    setAge(e.target.value);
    if (error) setError("");
  };

  const handleSubmit = () => {
    if (isSubmitted) return;
    const err = validateAge(age);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setIsSubmitted(true);
    setSystemState({ age: Number(age) });
    timers.current.push(setTimeout(() => setShowSys1(true), 500));
    timers.current.push(setTimeout(() => setShowSys2(true), 1100));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isValid = validateAge(age) === "";

  return (
    <SystemFrame status="[CALIBRATING...]">
      <div className={styles.stage} style={{ opacity: leaving ? 0 : 1 }}>
        <div className={styles.panel}>
          <div className={styles.progress}>STEP 1 OF 5</div>

          {/* Element 1 — system label */}
          <div className={styles.label}>
            {typed}
            {!typingDone && (
              <span className="cursor-blink" aria-hidden>
                |
              </span>
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
            State your age, {name || "operator"}. For learning curve
            optimization.
          </div>

          {/* Element 3 — number input */}
          <div
            style={{
              marginTop: 32,
              opacity: showInput ? 1 : 0,
              transition: "opacity 0.4s ease",
            }}
          >
            <input
              ref={inputRef}
              type="number"
              inputMode="numeric"
              min={MIN_AGE}
              max={MAX_AGE}
              className={`${styles.numInput} ${
                isSubmitted ? styles.numInputSubmitted : ""
              }`}
              placeholder="—"
              value={age}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              readOnly={isSubmitted}
            />
          </div>

          {/* Validation error */}
          {error && (
            <div
              className={styles.error}
              style={{ marginTop: 16, animation: "system-fade 0.2s ease" }}
            >
              {error}
            </div>
          )}

          {/* Element 4 — confirm button */}
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
                disabled={!isValid}
              >
                CONFIRM
              </button>
            </div>
          )}

          {/* System responses */}
          {showSys1 && (
            <div
              className={styles.sysLine1}
              style={{ marginTop: 28, animation: "system-fade 0.5s ease" }}
            >
              Age recorded. Learning parameters initialized.
            </div>
          )}
          {showSys2 && (
            <div
              className={styles.sysLine2}
              style={{ marginTop: 14, animation: "system-fade 0.4s ease" }}
            >
              SCROLL TO CONTINUE.
            </div>
          )}
        </div>
      </div>
    </SystemFrame>
  );
}
