"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconBook,
  IconBarbell,
  IconTarget,
  IconListCheck,
} from "@tabler/icons-react";
import SystemFrame from "@/components/SystemFrame";
import { setSystemState } from "@/lib/systemState";
import { firstScreen } from "@/lib/flowMap";
import styles from "./PathSelection.module.css";

const LABEL = "[SCANNING GOALS... COMPLETE]";
const TYPE_START_DELAY = 400;
const TYPE_SPEED = 40;

const PATHS = [
  {
    id: "academics",
    Icon: IconBook,
    title: "ACADEMICS",
    subtitle: "Track subjects. Build study discipline.",
  },
  {
    id: "fitness",
    Icon: IconBarbell,
    title: "FITNESS",
    subtitle: "Transform your body. Build strength.",
  },
  {
    id: "both",
    Icon: IconTarget,
    title: "BOTH",
    subtitle: "The complete system.",
    recommended: true,
  },
  {
    id: "side-quest",
    Icon: IconListCheck,
    title: "SIDE QUEST",
    subtitle: "Simple habit tracking. No complexity.",
  },
];

/**
 * SCREEN 03 — PATH SELECTION
 * The System reveals its purpose, then the user commits to a direction.
 * Radio behavior: one card selectable; selection drives the flowMap branch.
 */
export default function PathSelection() {
  const router = useRouter();
  const timers = useRef([]);

  const [typed, setTyped] = useState("");
  const [typingDone, setTypingDone] = useState(false);
  const [showLine1, setShowLine1] = useState(false);
  const [showLine2, setShowLine2] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [showCards, setShowCards] = useState(false);

  const [selected, setSelected] = useState(null);
  const [showResponse, setShowResponse] = useState(false);
  const [leaving, setLeaving] = useState(false);

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

  // Staggered reveal: line1 -> line2 -> sub -> cards
  useEffect(() => {
    if (!typingDone) return;
    const t = [
      setTimeout(() => setShowLine1(true), 400),
      setTimeout(() => setShowLine2(true), 700),
      setTimeout(() => setShowSub(true), 1200),
      setTimeout(() => setShowCards(true), 1500),
    ];
    return () => t.forEach(clearTimeout);
  }, [typingDone]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const handleSelect = (path) => {
    if (selected) return; // radio: lock after first choice
    setSelected(path);
    setSystemState({ path });
    timers.current.push(setTimeout(() => setShowResponse(true), 300));
    timers.current.push(setTimeout(() => setLeaving(true), 1800));
    timers.current.push(
      setTimeout(() => router.push(firstScreen(path)), 2400),
    );
  };

  return (
    <SystemFrame status="[SELECT DESIGNATION PATH]">
      <div className={styles.stage} style={{ opacity: leaving ? 0 : 1 }}>
        {/* PART A — statement */}
        <div className={styles.label}>
          {typed}
          {!typingDone && (
            <span className="cursor-blink" aria-hidden>
              |
            </span>
          )}
        </div>

        <div className="font-display">
          <div
            className={styles.statement}
            style={{
              color: "rgba(255, 255, 255, 0.90)",
              opacity: showLine1 ? 1 : 0,
              transition: "opacity 0.4s ease-out",
            }}
          >
            The System gives life
          </div>
          <div
            className={styles.statement}
            style={{
              color: "rgba(0, 212, 255, 0.90)",
              opacity: showLine2 ? 1 : 0,
              transition: "opacity 0.4s ease-out",
            }}
          >
            to your goals.
          </div>
        </div>

        <div
          className={styles.sub}
          style={{
            opacity: showSub ? 1 : 0,
            transition: "opacity 0.5s ease-out",
          }}
        >
          Choose your path. The system will do the rest.
        </div>

        {/* PART B — path cards */}
        <div
          className={styles.grid}
          style={{ pointerEvents: selected ? "none" : "auto" }}
        >
          {PATHS.map(({ id, Icon, title, subtitle, recommended }, i) => (
            <div
              key={id}
              role="button"
              tabIndex={0}
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
              {recommended && <span className={styles.pill}>RECOMMENDED</span>}
              <Icon className={styles.icon} size={22} stroke={1.75} />
              <div>
                <div className={styles.title}>{title}</div>
                <div className={styles.subtitle}>{subtitle}</div>
              </div>
            </div>
          ))}
        </div>

        {/* System response after selection */}
        {showResponse && (
          <div
            className={styles.response}
            style={{ animation: "system-fade 0.5s ease" }}
          >
            PATH CONFIRMED. INITIALIZING CALIBRATION...
          </div>
        )}
      </div>
    </SystemFrame>
  );
}
