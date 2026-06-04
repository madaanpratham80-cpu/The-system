"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconChevronsDown } from "@tabler/icons-react";
import SystemFrame from "@/components/SystemFrame";

const INIT_LABEL = "[SYSTEM INITIALIZING...]";
const TYPE_START_DELAY = 1500; // wait before the system "wakes"
const TYPE_SPEED = 50; // ms per character

/**
 * SCREEN 1 — THE BOOT
 * The system powers on: decorative label types out, then the headline,
 * sub-headline and body fade in one after another.
 */
export default function Boot() {
  const router = useRouter();
  const advanced = useRef(false);
  const [typed, setTyped] = useState("");
  const [typingDone, setTypingDone] = useState(false);
  const [showHeadline, setShowHeadline] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [showBody, setShowBody] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const proceed = useCallback(() => {
    if (advanced.current) return;
    advanced.current = true;
    setLeaving(true);
    setTimeout(() => router.push("/identify"), 600);
  }, [router]);

  // Typewriter for the decorative label
  useEffect(() => {
    let i = 0;
    let typer;
    const start = setTimeout(() => {
      typer = setInterval(() => {
        i += 1;
        setTyped(INIT_LABEL.slice(0, i));
        if (i >= INIT_LABEL.length) {
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

  // Staggered reveal once the label finishes typing
  useEffect(() => {
    if (!typingDone) return;
    const t1 = setTimeout(() => setShowHeadline(true), 0);
    const t2 = setTimeout(() => setShowSub(true), 400); // 0.4s after headline
    const t3 = setTimeout(() => setShowBody(true), 1000); // 0.6s after sub
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [typingDone]);

  // Once the intro has played, scroll / arrow keys / click advance to identify
  useEffect(() => {
    if (!showBody) return;
    const onWheel = (e) => {
      if (e.deltaY > 0) proceed();
    };
    const onKey = (e) => {
      if (["ArrowDown", "PageDown", "Enter", " ", "Spacebar"].includes(e.key)) {
        proceed();
      }
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [showBody, proceed]);

  return (
    <SystemFrame>
      <main
        className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center"
        style={{ opacity: leaving ? 0 : 1, transition: "opacity 0.6s ease" }}
      >
        {/* Element 1 — decorative label (typewriter) */}
        <div
          style={{
            fontSize: 11,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "rgba(0, 212, 255, 0.40)",
            minHeight: "1.2em",
          }}
        >
          {typed}
          <span
            className="cursor-blink"
            style={{ color: "rgba(0, 212, 255, 0.60)", marginLeft: 1 }}
          >
            ▋
          </span>
        </div>

        {/* Element 2 — main headline */}
        <h1
          className="font-display"
          style={{
            marginTop: 24,
            fontSize: 56,
            fontWeight: 900,
            letterSpacing: 12,
            textTransform: "uppercase",
            color: "rgba(255, 255, 255, 0.90)",
            textShadow: "0 0 40px rgba(0, 212, 255, 0.20)",
            opacity: showHeadline ? 1 : 0,
            transition: "opacity 0.6s ease-out",
          }}
        >
          THE SYSTEM
        </h1>

        {/* Element 3 — sub-headline */}
        <div
          style={{
            marginTop: 16,
            fontSize: 18,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "rgba(255, 255, 255, 0.45)",
            opacity: showSub ? 1 : 0,
            transition: "opacity 0.4s ease-out",
          }}
        >
          WELCOMES YOU
        </div>

        {/* Element 4 — body text */}
        <p
          style={{
            marginTop: 12,
            fontSize: 13,
            letterSpacing: 2,
            color: "rgba(255, 255, 255, 0.30)",
            opacity: showBody ? 1 : 0,
            transition: "opacity 0.5s ease-out",
          }}
        >
          You have been detected. Stand by for identification.
        </p>
      </main>

      {/* Element 5 — scroll indicator (click to proceed as well) */}
      <div
        className="anim-scroll-pulse"
        onClick={proceed}
        role="button"
        tabIndex={showBody ? 0 : -1}
        style={{
          position: "fixed",
          bottom: 60,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          cursor: showBody ? "pointer" : "default",
          pointerEvents: showBody ? "auto" : "none",
        }}
      >
        <IconChevronsDown size={16} stroke={1.5} color="rgba(255, 255, 255, 0.25)" />
        <span
          style={{
            fontSize: 10,
            letterSpacing: 3,
            color: "rgba(255, 255, 255, 0.18)",
          }}
        >
          SCROLL TO PROCEED
        </span>
      </div>
    </SystemFrame>
  );
}
