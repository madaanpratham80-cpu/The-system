"use client";

import { useEffect, useState } from "react";

/**
 * Shared HUD chrome for every screen in THE SYSTEM:
 * fixed background grid, breathing corner brackets, and the persistent
 * HUD elements (S logo, live system clock, version tag, dynamic status).
 *
 * Wrap each screen's content as children — content lives in a z-10 layer
 * above the grid; the chrome sits at the viewport edges in a z-20 layer.
 *
 * @param {string} status  Bottom-right readout, changes per screen
 *                         (e.g. "[IDENTIFICATION REQUIRED]").
 */

const CYAN_BRACKET = "rgba(0, 212, 255, 0.20)";

function CornerBrackets() {
  const base = {
    position: "fixed",
    zIndex: 20,
    pointerEvents: "none",
  };

  return (
    <>
      <div
        className="anim-breathe system-bracket"
        style={{
          ...base,
          top: 24,
          left: 24,
          borderTop: `2px solid ${CYAN_BRACKET}`,
          borderLeft: `2px solid ${CYAN_BRACKET}`,
        }}
      />
      <div
        className="anim-breathe system-bracket"
        style={{
          ...base,
          top: 24,
          right: 24,
          borderTop: `2px solid ${CYAN_BRACKET}`,
          borderRight: `2px solid ${CYAN_BRACKET}`,
        }}
      />
      <div
        className="anim-breathe system-bracket"
        style={{
          ...base,
          bottom: 24,
          left: 24,
          borderBottom: `2px solid ${CYAN_BRACKET}`,
          borderLeft: `2px solid ${CYAN_BRACKET}`,
        }}
      />
      <div
        className="anim-breathe system-bracket"
        style={{
          ...base,
          bottom: 24,
          right: 24,
          borderBottom: `2px solid ${CYAN_BRACKET}`,
          borderRight: `2px solid ${CYAN_BRACKET}`,
        }}
      />
    </>
  );
}

function SystemClock() {
  const [time, setTime] = useState(null);

  useEffect(() => {
    const format = () =>
      new Date().toLocaleTimeString("en-GB", { hour12: false });
    setTime(format());
    const id = setInterval(() => setTime(format()), 1000);
    return () => clearInterval(id);
  }, []);

  // null on the server / first paint to avoid hydration mismatch
  return <span>SYSTEM CLOCK: {time ?? "--:--:--"}</span>;
}

export default function SystemFrame({ children, status = "[AWAITING INPUT]" }) {
  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{ backgroundColor: "#070b0d" }}
    >
      <div className="system-grid" />
      <CornerBrackets />

      {/* Top-left: S logo in a thin breathing circle (Orbitron) */}
      <div
        className="anim-breathe font-display"
        style={{
          position: "fixed",
          top: 28,
          left: 28,
          zIndex: 20,
          width: 28,
          height: 28,
          borderRadius: 9999,
          border: "1px solid rgba(0, 212, 255, 0.30)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          color: "rgba(0, 212, 255, 0.45)",
          pointerEvents: "none",
        }}
      >
        S
      </div>

      {/* Top-right: live system clock (hidden on mobile) */}
      <div
        className="system-clock"
        style={{
          position: "fixed",
          top: 28,
          right: 28,
          zIndex: 20,
          fontSize: 10,
          letterSpacing: 2,
          color: "rgba(255, 255, 255, 0.18)",
          pointerEvents: "none",
        }}
      >
        <SystemClock />
      </div>

      {/* Bottom-left: version + status */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          left: 28,
          zIndex: 20,
          fontSize: 9,
          letterSpacing: 2,
          color: "rgba(255, 255, 255, 0.14)",
          pointerEvents: "none",
        }}
      >
        SYS.v1.0 | STATUS: ONLINE
      </div>

      {/* Bottom-right: dynamic per-screen status */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 28,
          zIndex: 20,
          fontSize: 9,
          letterSpacing: 2,
          color: "rgba(255, 255, 255, 0.14)",
          pointerEvents: "none",
        }}
      >
        {status}
      </div>

      {children}
    </div>
  );
}
