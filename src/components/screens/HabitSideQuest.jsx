"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconBook2,
  IconLeaf,
  IconMoonStars,
  IconNotebook,
  IconDroplet,
  IconRun,
  IconStar,
  IconCheck,
  IconChevronsDown,
} from "@tabler/icons-react";
import SystemFrame from "@/components/SystemFrame";
import { getSystemState, setSystemState } from "@/lib/systemState";
import { nextScreen } from "@/lib/flowMap";
import styles from "./HabitSideQuest.module.css";

const LABEL = "[HABIT SELECTION]";
const TYPE_START_DELAY = 600;
const TYPE_SPEED = 40;
const MAX_TOTAL = 6;
const MAX_CUSTOM = 3;

const HABITS = [
  { id: "reading",    Icon: IconBook2,     title: "READING" },
  { id: "meditation", Icon: IconLeaf,       title: "MEDITATION" },
  { id: "sleep",      Icon: IconMoonStars,  title: "SLEEP" },
  { id: "journaling", Icon: IconNotebook,   title: "JOURNALING" },
  { id: "water",      Icon: IconDroplet,    title: "WATER INTAKE" },
  { id: "exercise",   Icon: IconRun,        title: "EXERCISE" },
];

/**
 * SCREEN 05D — HABIT SELECTION (Side Quest path)
 * Multi-select card grid. Up to 6 habits total (predefined + custom).
 * Up to 3 custom habits. No hologram.
 */
export default function HabitSideQuest() {
  const router          = useRouter();
  const timers          = useRef([]);
  const advanced        = useRef(false);
  const customInputRef  = useRef(null);

  const [name,          setName]          = useState("");
  const [typed,         setTyped]         = useState("");
  const [typingDone,    setTypingDone]    = useState(false);
  const [showQuestion,  setShowQuestion]  = useState(false);
  const [showExplain,   setShowExplain]   = useState(false);
  const [showCards,     setShowCards]     = useState(false);

  // Multi-select state
  const [selectedIds,     setSelectedIds]     = useState(new Set());
  const [customHabits,    setCustomHabits]    = useState([]);   // { id, title }
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customText,      setCustomText]      = useState("");

  const [error,       setError]       = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [habitCount,  setHabitCount]  = useState(0);
  const [showSys1,    setShowSys1]    = useState(false);
  const [showSys2,    setShowSys2]    = useState(false);
  const [leaving,     setLeaving]     = useState(false);

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
      setTimeout(() => setShowCards(true),    650),
    ];
    return () => t.forEach(clearTimeout);
  }, [typingDone]);

  // Focus custom input when it opens
  useEffect(() => {
    if (showCustomInput) {
      const id = setTimeout(() => customInputRef.current?.focus(), 80);
      return () => clearTimeout(id);
    }
  }, [showCustomInput]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const proceed = useCallback(() => {
    if (advanced.current) return;
    advanced.current = true;
    setLeaving(true);
    const path = getSystemState().path || "side-quest";
    setTimeout(() => router.push(nextScreen(path, "/screen-05d")), 600);
  }, [router]);

  useEffect(() => {
    if (!showSys2) return;
    const onWheel = (e) => { if (e.deltaY > 0) proceed(); };
    const onKey   = (e) => {
      if (["ArrowDown", "PageDown"].includes(e.key)) proceed();
    };
    window.addEventListener("wheel",   onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel",   onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [showSys2, proceed]);

  // ── Habit toggle ──────────────────────────────────────────────────────────

  const handleToggle = (id) => {
    if (isSubmitted) return;
    setError("");
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= MAX_TOTAL) {
          setError("Maximum 6 habits. Deselect one to add another.");
          return prev;
        }
        next.add(id);
      }
      return next;
    });
  };

  // ── Custom habit ──────────────────────────────────────────────────────────

  const handleAddCustom = () => {
    const text = customText.trim();
    if (!text) { setShowCustomInput(false); return; }
    if (selectedIds.size >= MAX_TOTAL) {
      setError("Maximum 6 habits. Deselect one to add another.");
      return;
    }
    const id = `custom-${Date.now()}`;
    setCustomHabits((prev) => [...prev, { id, title: text.toUpperCase() }]);
    setSelectedIds((prev) => new Set([...prev, id]));
    setCustomText("");
    setShowCustomInput(false);
    setError("");
  };

  const handleCustomKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleAddCustom(); }
    if (e.key === "Escape") { setShowCustomInput(false); setCustomText(""); }
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    if (isSubmitted) return;
    if (selectedIds.size === 0) {
      setError("Select at least one habit.");
      return;
    }
    setError("");
    const count = selectedIds.size;
    setHabitCount(count);
    setIsSubmitted(true);
    setSystemState({ habits: [...selectedIds] });
    timers.current.push(setTimeout(() => setShowSys1(true), 500));
    timers.current.push(setTimeout(() => setShowSys2(true), 1100));
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const totalSelected  = selectedIds.size;
  const canAddCustom   = !isSubmitted && customHabits.length < MAX_CUSTOM && totalSelected < MAX_TOTAL;
  const allHabits      = [
    ...HABITS,
    ...customHabits.map((h) => ({ ...h, Icon: IconStar })),
  ];

  return (
    <SystemFrame status="[CALIBRATING...]">
      <div className={styles.stage} style={{ opacity: leaving ? 0 : 1 }}>
        <div className={styles.panel}>
          <div className={styles.progress}>STEP 2 OF 3</div>

          {/* Element 1 — system label (typewriter) */}
          <div className={styles.label}>
            {typed}
            {!typingDone && <span className="cursor-blink" aria-hidden>|</span>}
          </div>

          {/* Element 2 — question */}
          <div
            className={styles.question}
            style={{ opacity: showQuestion ? 1 : 0, transition: "opacity 0.4s ease-out" }}
          >
            Which habits do you want to track, {name || "operator"}?
          </div>

          {/* Element 3 — explanation */}
          <div
            className={styles.explanation}
            style={{ opacity: showExplain ? 1 : 0, transition: "opacity 0.5s ease-out" }}
          >
            Select 1–6 habits. You can add custom ones too.
          </div>

          {/* Element 4 — habit cards grid */}
          <div
            className={styles.grid}
            style={{ pointerEvents: isSubmitted ? "none" : "auto" }}
          >
            {allHabits.map(({ id, Icon, title }, i) => {
              const selected = selectedIds.has(id);
              return (
                <div
                  key={id}
                  role="checkbox"
                  aria-checked={selected}
                  tabIndex={showCards ? 0 : -1}
                  onClick={() => handleToggle(id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleToggle(id);
                    }
                  }}
                  className={`${styles.card} ${selected ? styles.cardSelected : ""}`}
                  style={{
                    opacity:         showCards ? 1 : 0,
                    transform:       showCards ? "translateY(0)" : "translateY(16px)",
                    transition:      "opacity 0.4s ease, transform 0.4s ease",
                    transitionDelay: showCards ? `${i * 0.06}s` : "0s",
                  }}
                >
                  {selected && (
                    <IconCheck
                      size={10}
                      stroke={2}
                      className={styles.checkmark}
                    />
                  )}
                  <Icon
                    size={20}
                    stroke={1.5}
                    className={selected ? styles.iconSelected : styles.icon}
                  />
                  <div className={styles.cardTitle}>{title}</div>
                </div>
              );
            })}
          </div>

          {/* Element 5 — custom habit */}
          {canAddCustom && !showCustomInput && (
            <button
              type="button"
              className={styles.addCustomBtn}
              onClick={() => setShowCustomInput(true)}
              style={{ animation: "system-fade 0.3s ease" }}
            >
              + ADD CUSTOM HABIT
            </button>
          )}

          {showCustomInput && (
            <div className={styles.customInputWrap} style={{ animation: "system-fade 0.25s ease" }}>
              <input
                ref={customInputRef}
                type="text"
                className={styles.customInput}
                placeholder="e.g. Cold shower"
                maxLength={30}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                onKeyDown={handleCustomKeyDown}
                onBlur={handleAddCustom}
              />
            </div>
          )}

          {/* Validation error */}
          {error && (
            <div className={styles.error} style={{ animation: "system-fade 0.2s ease" }}>
              {error}
            </div>
          )}

          {/* Element 6 — submit button */}
          {!isSubmitted && (
            <div
              className={styles.btnWrap}
              style={{
                opacity:    showCards ? 1 : 0,
                transition: "opacity 0.4s ease",
                transitionDelay: showCards ? "0.6s" : "0s",
              }}
            >
              <button
                type="button"
                className={styles.confirmBtn}
                onClick={handleSubmit}
                disabled={totalSelected === 0}
              >
                CONFIRM HABITS
              </button>
            </div>
          )}

          {/* System response */}
          {showSys1 && (
            <div
              className={styles.sysLine1}
              style={{ marginTop: 28, animation: "system-fade 0.5s ease" }}
            >
              {habitCount} habit{habitCount !== 1 ? "s" : ""} recorded. Dashboard configured.
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
