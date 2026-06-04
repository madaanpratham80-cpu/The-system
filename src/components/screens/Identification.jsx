"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconBrandGoogle } from "@tabler/icons-react";
import SystemFrame from "@/components/SystemFrame";
import { setSystemState } from "@/lib/systemState";
import styles from "./Identification.module.css";

const LABEL = "[PLAYER IDENTIFICATION REQUIRED]";
const TYPE_START_DELAY = 700; // after the panel has faded in
const TYPE_SPEED = 40; // ms per character
const NAME_REGEX = /^[a-zA-Z0-9\s'\-.]{2,50}$/;

function validateName(raw) {
  const name = raw.trim();
  if (name.length === 0)
    return "Designation required. The system needs to identify you.";
  if (name.length < 2) return "Designation too short. Minimum 2 characters.";
  if (!NAME_REGEX.test(name))
    return "Invalid characters detected. Letters and numbers only.";
  return "";
}

/**
 * SCREEN 02 — IDENTIFICATION / LOGIN
 * A dialogue, not a form. The system identifies the user via name entry
 * (fully working) or Google sign-in (UI stub — pending Supabase/OAuth wiring).
 */
export default function Identification() {
  const router = useRouter();
  const inputRef = useRef(null);
  const timers = useRef([]);

  const [typed, setTyped] = useState("");
  const [typingDone, setTypingDone] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showFields, setShowFields] = useState(false);

  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSys1, setShowSys1] = useState(false);
  const [showSys2, setShowSys2] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [googleNote, setGoogleNote] = useState("");

  const trackTimer = useCallback((id) => {
    timers.current.push(id);
    return id;
  }, []);

  // Element 1 — typewriter for the system label
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

  // Element 2/3 — reveal question, then fields
  useEffect(() => {
    if (!typingDone) return;
    setShowQuestion(true);
    const t1 = setTimeout(() => setShowFields(true), 300);
    const t2 = setTimeout(() => inputRef.current?.focus(), 650);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [typingDone]);

  // Clean up any pending post-submit timers on unmount
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const handleChange = (e) => {
    setUserName(e.target.value);
    if (error) setError("");
    if (googleNote) setGoogleNote("");
  };

  const handleSubmit = () => {
    if (isSubmitted) return;
    const err = validateName(userName);
    if (err) {
      setError(err);
      return;
    }

    const name = userName.trim();
    setError("");
    setIsSubmitted(true);
    setSystemState({ name, authMethod: "name", userId: null });

    trackTimer(setTimeout(() => setShowSys1(true), 300));
    trackTimer(setTimeout(() => setShowSys2(true), 1300));
    trackTimer(setTimeout(() => setLeaving(true), 3300));
    trackTimer(setTimeout(() => router.push("/path-selection"), 4100));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Google sign-in — UI stub until Supabase + OAuth credentials are wired.
  const handleGoogleSignIn = () => {
    if (isSubmitted) return;
    setGoogleNote("[ AUTH PROVIDER NOT YET LINKED — USE NAME ENTRY ]");
  };

  const name = userName.trim();
  const showConfirm = userName.length > 0 && !isSubmitted;
  const confirmDisabled = name.length < 2;

  return (
    <SystemFrame status="[IDENTIFICATION REQUIRED]">
      <div className={styles.scanline} />

      <div className={styles.stage} style={{ opacity: leaving ? 0 : 1 }}>
        <div className={styles.panel}>
          {/* Element 1 — system label (typewriter) */}
          <div className={styles.label}>
            {typed}
            {!typingDone && (
              <span className="cursor-blink" aria-hidden>
                |
              </span>
            )}
          </div>

          {/* Element 2 — system question */}
          <div
            className={styles.question}
            style={{
              opacity: showQuestion ? 1 : 0,
              transform: showQuestion ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
            }}
          >
            What should the system call you?
          </div>

          {/* Element 3 — name input */}
          <div
            style={{
              opacity: showFields ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              className={`${styles.input} ${
                isSubmitted ? styles.inputSubmitted : ""
              }`}
              placeholder="ENTER DESIGNATION..."
              maxLength={50}
              value={userName}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              readOnly={isSubmitted}
              spellCheck={false}
              autoComplete="off"
            />

            {/* Inline validation error */}
            {error && (
              <div
                className={styles.error}
                style={{
                  marginTop: 12,
                  animation: "system-fade 0.2s ease",
                }}
              >
                {error}
              </div>
            )}

            {/* Element 6 — CONFIRM (appears as the user types) */}
            <div
              className={styles.confirmWrap}
              style={{
                maxHeight: showConfirm ? 80 : 0,
                opacity: showConfirm ? 1 : 0,
                marginTop: showConfirm ? 16 : 0,
              }}
            >
              <button
                type="button"
                className={styles.confirmBtn}
                onClick={handleSubmit}
                disabled={confirmDisabled}
              >
                CONFIRM
              </button>
            </div>
          </div>

          {/* Alternate auth (hidden once identity is confirmed) */}
          <div
            style={{
              marginTop: 28,
              opacity: showFields && !isSubmitted ? 1 : 0,
              maxHeight: isSubmitted ? 0 : 240,
              overflow: "hidden",
              pointerEvents: isSubmitted ? "none" : "auto",
              transition:
                "opacity 0.3s ease, max-height 0.4s ease",
            }}
          >
            {/* Element 4 — OR divider */}
            <div className={styles.divider} style={{ marginBottom: 20 }}>
              <span className={styles.dividerText}>OR</span>
            </div>

            {/* Element 5 — Google sign-in (ghost button) */}
            <button
              type="button"
              className={styles.ghostBtn}
              onClick={handleGoogleSignIn}
            >
              <IconBrandGoogle size={16} stroke={1.75} />
              CONTINUE WITH GOOGLE
            </button>

            {googleNote && (
              <div className={styles.note} style={{ marginTop: 14 }}>
                {googleNote}
              </div>
            )}
          </div>

          {/* Post-submission system responses */}
          {showSys1 && (
            <div
              className={styles.sysLine1}
              style={{ marginTop: 24, animation: "system-fade 0.5s ease" }}
            >
              IDENTITY CONFIRMED. WELCOME, {name.toUpperCase()}.
            </div>
          )}
          {showSys2 && (
            <div
              className={styles.sysLine2}
              style={{ marginTop: 12, animation: "system-fade 0.4s ease" }}
            >
              Standby for path assignment, {name}.
            </div>
          )}
        </div>
      </div>
    </SystemFrame>
  );
}
