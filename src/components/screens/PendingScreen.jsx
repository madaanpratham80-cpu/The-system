"use client";

import { useEffect, useState } from "react";
import SystemFrame from "@/components/SystemFrame";
import { getSystemState } from "@/lib/systemState";

/**
 * Temporary placeholder for calibration screens not yet built.
 * Confirms flowMap routing lands on a real page; replaced as each
 * screen is described and implemented.
 */
export default function PendingScreen({ code, title }) {
  const [state, setState] = useState({});

  useEffect(() => {
    setState(getSystemState());
  }, []);

  return (
    <SystemFrame status="[CALIBRATION PENDING]">
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div
          style={{
            fontSize: 10,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "rgba(0, 212, 255, 0.40)",
            marginBottom: 18,
          }}
        >
          [{code}]
        </div>
        <div
          style={{
            fontSize: 22,
            letterSpacing: 2,
            color: "rgba(255, 255, 255, 0.85)",
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 12,
            letterSpacing: 2,
            color: "rgba(0, 196, 150, 0.55)",
          }}
        >
          CALIBRATION MODULE — PENDING
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 11,
            letterSpacing: 1,
            color: "rgba(255, 255, 255, 0.25)",
          }}
        >
          {state.name ? `OPERATOR: ${state.name.toUpperCase()}` : ""}
          {state.path ? `  |  PATH: ${state.path.toUpperCase()}` : ""}
        </div>
      </main>
    </SystemFrame>
  );
}
