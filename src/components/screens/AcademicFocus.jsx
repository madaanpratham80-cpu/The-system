"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconBook,
  IconChevronsDown,
  IconSchool,
  IconBuilding,
  IconTrophy,
  IconPencil,
} from "@tabler/icons-react";
import SystemFrame from "@/components/SystemFrame";
import { getSystemState, setSystemState } from "@/lib/systemState";
import { nextScreen } from "@/lib/flowMap";
import styles from "./AcademicFocus.module.css";

const LABEL = "[ACADEMIC PROFILE ANALYSIS]";
const TYPE_START_DELAY = 600;
const TYPE_SPEED = 40;

const CARDS = [
  {
    id: "board-exams",
    Icon: IconBook,
    title: "BOARD EXAMS",
    sub: "High school / National board exams",
  },
  {
    id: "college-entrance",
    Icon: IconSchool,
    title: "COLLEGE ENTRANCE",
    sub: "SAT, ACT, JEE, NEET, entrance tests",
  },
  {
    id: "university",
    Icon: IconBuilding,
    title: "UNIVERSITY",
    sub: "Degree coursework and exams",
  },
  {
    id: "competitive-exam",
    Icon: IconTrophy,
    title: "COMPETITIVE EXAM",
    sub: "Civil service, law, other competitive tests",
  },
  {
    id: "custom",
    Icon: IconPencil,
    title: "CUSTOM / OTHER",
    sub: "Self-directed learning",
  },
];

/**
 * SCREEN 05A — ACADEMIC FOCUS (Academics path)
 * The system asks what the user is preparing for.
 * One card selectable (radio); auto-advances on scroll after confirmation.
 */
export default function AcademicFocus() {
  const router = useRouter();
  const timers = useRef([]);
  const advanced = useRef(false);

  const [name, setName] = useState("");
  const [typed, setTyped] = useState("");
  const [typingDone, setTypingDone] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showCards, setShowCards] = useState(false);

  const [selected, setSelected] = useState(null);
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

  // Staggered reveal: question -> cards
  useEffect(() => {
    if (!typingDone) return;
    const t = [
      setTimeout(() => setShowQuestion(true), 400),
      setTimeout(() => setShowCards(true), 700),
    ];
    return () => t.forEach(clearTimeout);
  }, [typingDone]);

  // Cleanup timers on unmount
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const proceed = useCallback(() => {
    if (advanced.current) return;
    advanced.current = true;
    setLeaving(true);
    const path = getSystemState().path || "academics";
    setTimeout(() => router.push(nextScreen(path, "/screen-05a")), 600);
  }, [router]);

  // After sys2 shows, scroll / arrow / key advances to the next screen
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
  }, [showSys2, proceed]);

  const handleSelect = (id) => {
    if (selected) return; // radio: lock after first choice
    setSelected(id);
    setSystemState({ academic_focus: id });
    timers.current.push(setTimeout(() => setShowSys1(true), 500));
    timers.current.push(setTimeout(() => setShowSys2(true), 1100));
  };

  return (
    <SystemFrame status="[CALIBRATING...]">
      <div className={styles.stage} style={{ opacity: leaving ? 0 : 1 }}>
        <div className={styles.panel}>
          <div className={styles.progress}>STEP 2 OF 5</div>

          {/* Element 1 — system label (typewriter) */}
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
            What are you preparing for, {name || "operator"}?
          </div>

          {/* Element 3 — radio cards */}
          <div
            className={styles.cards}
            style={{ pointerEvents: selected ? "none" : "auto" }}
          >
            {CARDS.map(({ id, Icon, title, sub }, i) => (
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
                className={`${styles.card} ${
                  selected === id ? styles.cardSelected : ""
                }`}
                style={{
                  opacity: showCards ? 1 : 0,
                  transform: showCards ? "translateY(0)" : "translateY(16px)",
                  transition: "opacity 0.4s ease, transform 0.4s ease",
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

          {/* System responses */}
          {showSys1 && (
            <div
              className={styles.sysLine1}
              style={{ marginTop: 28, animation: "system-fade 0.5s ease" }}
            >
              Academic path recorded. Adjusting difficulty parameters.
            </div>
          )}
        </div>
      </div>

      {/* Fixed scroll indicator — matches Boot's pattern, appears after selection */}
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
