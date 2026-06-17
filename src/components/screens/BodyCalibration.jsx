"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconArrowsMinimize,
  IconMinus,
  IconArrowsMaximize,
  IconChevronsDown,
} from "@tabler/icons-react";
import SystemFrame from "@/components/SystemFrame";
import { getSystemState, setSystemState } from "@/lib/systemState";
import { nextScreen } from "@/lib/flowMap";
import styles from "./BodyCalibration.module.css";

const LABEL = "[BODY SCAN INITIATED]";
const TYPE_START_DELAY = 600;
const TYPE_SPEED = 40;

// ── Scale helpers ─────────────────────────────────────────────────────────────

function heightToScaleY(h) {
  const n = Number(h);
  if (!Number.isFinite(n)) return 1;
  return 0.82 + ((Math.max(140, Math.min(220, n)) - 140) / 80) * 0.36;
}

function weightToScaleX(w) {
  const n = Number(w);
  if (!Number.isFinite(n)) return 1;
  return 0.78 + ((Math.max(40, Math.min(200, n)) - 40) / 160) * 0.54;
}

// ── SVG body shape sets (6 variants) ─────────────────────────────────────────

function MaleSkinnyShapes() {
  return (
    <>
      <ellipse cx="100" cy="40" rx="22" ry="26" />
      <rect x="94" y="66" width="12" height="14" />
      <polygon points="60,80 140,80 132,192 68,192" />
      <polygon points="60,80 42,86 40,194 62,194 68,192" />
      <polygon points="140,80 158,86 160,194 138,194 132,192" />
      <rect x="68" y="192" width="64" height="20" />
      <polygon points="70,212 130,212 126,250 74,250" />
      <rect x="74" y="250" width="22" height="104" />
      <rect x="104" y="250" width="22" height="104" />
    </>
  );
}

function MaleSkinnyFatShapes() {
  return (
    <>
      <ellipse cx="100" cy="40" rx="26" ry="29" />
      <rect x="91" y="69" width="18" height="15" />
      <polygon points="44,84 156,84 148,200 52,200" />
      <polygon points="44,84 25,90 23,198 47,198 52,200" />
      <polygon points="156,84 175,90 177,198 153,198 148,200" />
      <rect x="52" y="200" width="96" height="26" />
      <polygon points="54,226 146,226 141,258 59,258" />
      <rect x="61" y="258" width="28" height="96" />
      <rect x="111" y="258" width="28" height="96" />
    </>
  );
}

function MaleFatShapes() {
  return (
    <>
      <ellipse cx="100" cy="40" rx="28" ry="30" />
      <rect x="88" y="70" width="24" height="16" />
      <polygon points="34,86 166,86 160,215 40,215" />
      <polygon points="34,86 13,93 11,212 37,212 40,215" />
      <polygon points="166,86 187,93 189,212 163,212 160,215" />
      <rect x="40" y="215" width="120" height="30" />
      <polygon points="42,245 158,245 150,280 50,280" />
      <rect x="52" y="280" width="36" height="74" />
      <rect x="112" y="280" width="36" height="74" />
    </>
  );
}

function FemaleSkinnyShapes() {
  return (
    <>
      <ellipse cx="100" cy="38" rx="20" ry="24" />
      <rect x="94" y="62" width="12" height="18" />
      <polygon points="63,80 137,80 120,170 80,170" />
      <polygon points="63,80 47,86 45,174 65,174 80,170" />
      <polygon points="137,80 153,86 155,174 135,174 120,170" />
      <rect x="76" y="170" width="48" height="22" />
      <polygon points="60,192 140,192 132,244 68,244" />
      <rect x="69" y="244" width="24" height="110" />
      <rect x="107" y="244" width="24" height="110" />
    </>
  );
}

function FemaleSkinnyFatShapes() {
  return (
    <>
      <ellipse cx="100" cy="38" rx="23" ry="27" />
      <rect x="93" y="65" width="14" height="17" />
      <polygon points="55,82 145,82 130,178 70,178" />
      <polygon points="55,82 38,88 36,183 56,183 70,178" />
      <polygon points="145,82 162,88 164,183 144,183 130,178" />
      <rect x="72" y="178" width="56" height="27" />
      <polygon points="47,205 153,205 150,254 50,254" />
      <rect x="52" y="254" width="36" height="100" />
      <rect x="112" y="254" width="36" height="100" />
    </>
  );
}

function FemaleFatShapes() {
  return (
    <>
      <ellipse cx="100" cy="38" rx="25" ry="28" />
      <rect x="91" y="66" width="18" height="18" />
      <polygon points="46,84 154,84 140,186 60,186" />
      <polygon points="46,84 26,90 24,190 50,190 60,186" />
      <polygon points="154,84 174,90 176,190 150,190 140,186" />
      <rect x="44" y="186" width="112" height="32" />
      <polygon points="40,218 160,218 150,268 50,268" />
      <rect x="52" y="268" width="38" height="86" />
      <rect x="110" y="268" width="38" height="86" />
    </>
  );
}

// Neutral fallback (no gender data)
function NeutralShapes() {
  return (
    <>
      <ellipse cx="100" cy="40" rx="25" ry="28" />
      <rect x="93" y="68" width="14" height="16" />
      <polygon points="62,84 138,84 132,196 68,196" />
      <polygon points="62,84 44,90 42,198 64,198 68,196" />
      <polygon points="138,84 156,90 158,198 136,198 132,196" />
      <polygon points="68,196 132,196 128,240 72,240" />
      <rect x="72" y="240" width="26" height="114" />
      <rect x="102" y="240" width="26" height="114" />
    </>
  );
}

// ── Hologram SVG ──────────────────────────────────────────────────────────────

const MALE_VARIANTS = [
  { id: "skinny",     clipId: "bc-m-skinny", Shapes: MaleSkinnyShapes    },
  { id: "skinny-fat", clipId: "bc-m-sf",     Shapes: MaleSkinnyFatShapes },
  { id: "fat",        clipId: "bc-m-fat",    Shapes: MaleFatShapes       },
];

const FEMALE_VARIANTS = [
  { id: "skinny",     clipId: "bc-f-skinny", Shapes: FemaleSkinnyShapes    },
  { id: "skinny-fat", clipId: "bc-f-sf",     Shapes: FemaleSkinnyFatShapes },
  { id: "fat",        clipId: "bc-f-fat",    Shapes: FemaleFatShapes       },
];

function BodyHologramSVG({ gender, bodyType, holoOpacity }) {
  const activeType = bodyType || "skinny-fat";

  const bodyStyle = {
    fill:           "rgba(7,11,13,0.88)",
    stroke:         "rgba(0,212,255,0.65)",
    strokeWidth:    "0.8",
    strokeLinejoin: "round",
  };

  return (
    <svg
      viewBox="0 0 200 390"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", overflow: "visible", opacity: holoOpacity, transition: "opacity 0.6s ease" }}
    >
      <defs>
        <pattern id="bc-grid" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M 14 0 L 0 0 0 14" fill="none" stroke="rgba(0,212,255,0.38)" strokeWidth="0.5" />
        </pattern>
        {MALE_VARIANTS.map(({ clipId, Shapes }) => (
          <clipPath key={clipId} id={clipId}><Shapes /></clipPath>
        ))}
        {FEMALE_VARIANTS.map(({ clipId, Shapes }) => (
          <clipPath key={clipId} id={clipId}><Shapes /></clipPath>
        ))}
        <clipPath id="bc-neutral"><NeutralShapes /></clipPath>
      </defs>

      {/* Neutral — shown when no gender is set */}
      <g style={{ ...bodyStyle, opacity: gender ? 0 : 1, transition: "opacity 0.8s ease" }}>
        <NeutralShapes />
        <rect x="0" y="0" width="200" height="390" fill="url(#bc-grid)" stroke="none" clipPath="url(#bc-neutral)" />
      </g>

      {/* Male variants */}
      {MALE_VARIANTS.map(({ id, clipId, Shapes }) => (
        <g key={id} style={{ ...bodyStyle, opacity: gender === "male" && activeType === id ? 1 : 0, transition: "opacity 0.5s ease" }}>
          <Shapes />
          <rect x="0" y="0" width="200" height="390" fill="url(#bc-grid)" stroke="none" clipPath={`url(#${clipId})`} />
        </g>
      ))}

      {/* Female variants */}
      {FEMALE_VARIANTS.map(({ id, clipId, Shapes }) => (
        <g key={id} style={{ ...bodyStyle, opacity: gender === "female" && activeType === id ? 1 : 0, transition: "opacity 0.5s ease" }}>
          <Shapes />
          <rect x="0" y="0" width="200" height="390" fill="url(#bc-grid)" stroke="none" clipPath={`url(#${clipId})`} />
        </g>
      ))}

      {/* Platform */}
      <ellipse cx="100" cy="370" rx="84" ry="11"
        fill="rgba(0,212,255,0.04)" stroke="rgba(0,212,255,0.12)" strokeWidth="1" />
      <ellipse cx="100" cy="370" rx="46" ry="7"
        fill="rgba(0,212,255,0.07)" stroke="rgba(0,212,255,0.22)" strokeWidth="1" />

      {/* Scan line */}
      <rect className={styles.scanLine} x="0" y="0" width="200" height="5"
        fill="rgba(0,212,255,0.10)" stroke="none" />
    </svg>
  );
}

// ── Body type card data ───────────────────────────────────────────────────────

const BODY_TYPES = [
  { id: "skinny",     Icon: IconArrowsMinimize, title: "SKINNY",      sub: "Lean, low body fat"     },
  { id: "skinny-fat", Icon: IconMinus,          title: "SKINNY-FAT",  sub: "Average, soft midsection" },
  { id: "fat",        Icon: IconArrowsMaximize, title: "FAT",         sub: "Higher body fat"        },
];

// ── Validation ────────────────────────────────────────────────────────────────

function validateHeight(v) {
  if (!v.trim()) return null; // empty — no error yet
  const n = Number(v);
  if (!Number.isFinite(n) || n < 140 || n > 220) return "Height must be between 140 and 220 cm.";
  return "";
}

function validateWeight(v) {
  if (!v.trim()) return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 40 || n > 200) return "Weight must be between 40 and 200 kg.";
  return "";
}

function validateTargetWeight(v, currentWeightStr) {
  if (!v.trim()) return "";
  const n = Number(v);
  if (!Number.isFinite(n) || n < 40 || n > 200) return "Target must be between 40 and 200 kg.";
  const cw = Number(currentWeightStr);
  if (Number.isFinite(cw) && n >= cw) return "Target should be less than current weight.";
  return "";
}

// ── Main component ────────────────────────────────────────────────────────────

export default function BodyCalibration() {
  const router    = useRouter();
  const timers    = useRef([]);
  const advanced  = useRef(false);
  const heightRef = useRef(null);

  const [name,   setName]   = useState("");
  const [gender, setGender] = useState(null);

  const [typed,        setTyped]        = useState("");
  const [typingDone,   setTypingDone]   = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showExplain,  setShowExplain]  = useState(false);
  const [showFields,   setShowFields]   = useState(false);

  const [height,       setHeight]       = useState("");
  const [weight,       setWeight]       = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [bodyType,     setBodyType]     = useState(null);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSys1,    setShowSys1]    = useState(false);
  const [showSys2,    setShowSys2]    = useState(false);
  const [leaving,     setLeaving]     = useState(false);

  const [holoGlow,  setHoloGlow]  = useState(false);
  const [holoPulse, setHoloPulse] = useState(false);

  useEffect(() => {
    const s = getSystemState();
    setName(s.name || "");
    setGender(s.gender || null);
  }, []);

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
      setTimeout(() => setShowExplain(true),  500),
      setTimeout(() => setShowFields(true),   600),
      setTimeout(() => heightRef.current?.focus(), 800),
    ];
    return () => t.forEach(clearTimeout);
  }, [typingDone]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const proceed = useCallback(() => {
    if (advanced.current) return;
    advanced.current = true;
    setLeaving(true);
    const path = getSystemState().path || "fitness";
    setTimeout(() => router.push(nextScreen(path, "/screen-06b")), 600);
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

  const triggerGlow = useCallback(() => {
    setHoloGlow(true);
    const t = setTimeout(() => setHoloGlow(false), 820);
    timers.current.push(t);
  }, []);

  const handleHeightChange = (e) => {
    const v = e.target.value;
    setHeight(v);
    const n = Number(v);
    if (Number.isFinite(n) && n >= 140 && n <= 220) triggerGlow();
  };

  const handleWeightChange = (e) => {
    const v = e.target.value;
    setWeight(v);
    const n = Number(v);
    if (Number.isFinite(n) && n >= 40 && n <= 200) triggerGlow();
  };

  const handleBodyTypeSelect = (id) => {
    if (isSubmitted) return;
    setBodyType(id);
    triggerGlow();
  };

  // Derived hologram state
  const heightValid = validateHeight(height) === "";
  const weightValid = validateWeight(weight) === "";
  const targetError = validateTargetWeight(targetWeight, weight);
  const targetValid = targetError === "";
  const isFormValid = heightValid && weightValid && targetValid && bodyType !== null;

  const scaleY = heightValid ? heightToScaleY(height) : 1;
  const scaleX = weightValid ? weightToScaleX(weight) : 1;

  const holoBaseOpacity = bodyType   ? 0.70
    : weightValid ? 0.60
    : heightValid ? 0.50
    : 0.45;
  const holoOpacity = holoPulse ? 0.90 : holoBaseOpacity;

  const handleSubmit = () => {
    if (isSubmitted || !isFormValid) return;
    setIsSubmitted(true);
    setSystemState({
      height_cm:         Number(height),
      weight_kg:         Number(weight),
      target_weight_kg:  targetWeight.trim() ? Number(targetWeight) : null,
      body_type:         bodyType,
    });
    setHoloPulse(true);
    timers.current.push(setTimeout(() => setHoloPulse(false), 300));
    timers.current.push(setTimeout(() => setShowSys1(true), 500));
    timers.current.push(setTimeout(() => setShowSys2(true), 1100));
  };

  return (
    <SystemFrame status="[BODY SCAN]">
      <div className={styles.screen} style={{ opacity: leaving ? 0 : 1 }}>

        {/* ── LEFT: input panel ────────────────────────────────────────────── */}
        <div className={styles.leftSide}>
          <div className={styles.panel}>
            <div className={styles.progress}>STEP 3 OF 5</div>

            <div className={styles.label}>
              {typed}
              {!typingDone && <span className="cursor-blink" aria-hidden>|</span>}
            </div>

            <div
              className={styles.question}
              style={{ opacity: showQuestion ? 1 : 0, transition: "opacity 0.4s ease-out" }}
            >
              Calibrate your physical parameters, {name || "operator"}.
            </div>

            <div
              className={styles.explanation}
              style={{ opacity: showExplain ? 1 : 0, transition: "opacity 0.5s ease-out" }}
            >
              Your hologram updates in real-time as you input data.
            </div>

            {/* ── Input fields ──────────────────────────────────────────── */}
            <div
              className={styles.fields}
              style={{ opacity: showFields ? 1 : 0, transition: "opacity 0.4s ease" }}
            >

              {/* Height */}
              <div className={styles.fieldRow}>
                <label className={styles.fieldLabel}>HEIGHT (CM)</label>
                <input
                  ref={heightRef}
                  type="number"
                  inputMode="numeric"
                  min={140} max={220}
                  placeholder="e.g. 175"
                  className={`${styles.fieldInput} ${isSubmitted ? styles.fieldInputDone : ""}`}
                  value={height}
                  onChange={handleHeightChange}
                  readOnly={isSubmitted}
                />
              </div>

              {/* Current weight */}
              <div className={styles.fieldRow}>
                <label className={styles.fieldLabel}>CURRENT WEIGHT (KG)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={40} max={200}
                  placeholder="e.g. 80"
                  className={`${styles.fieldInput} ${isSubmitted ? styles.fieldInputDone : ""}`}
                  value={weight}
                  onChange={handleWeightChange}
                  readOnly={isSubmitted}
                />
              </div>

              {/* Target weight (optional) */}
              <div className={styles.fieldRow}>
                <label className={styles.fieldLabel}>
                  TARGET WEIGHT (KG){" "}
                  <span className={styles.optionalTag}>(OPTIONAL)</span>
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={40} max={200}
                  placeholder="e.g. 72"
                  className={`${styles.fieldInput} ${isSubmitted ? styles.fieldInputDone : ""}`}
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  readOnly={isSubmitted}
                />
                {targetError && (
                  <div className={styles.fieldError} style={{ animation: "system-fade 0.2s ease" }}>
                    {targetError}
                  </div>
                )}
              </div>

              {/* Body type */}
              <div className={styles.bodyTypeSection}>
                <div className={styles.fieldLabel}>CURRENT BODY TYPE</div>
                <div className={styles.bodyCards}>
                  {BODY_TYPES.map(({ id, Icon, title, sub }, i) => (
                    <div
                      key={id}
                      role="button"
                      tabIndex={showFields && !isSubmitted ? 0 : -1}
                      onClick={() => handleBodyTypeSelect(id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleBodyTypeSelect(id); }
                      }}
                      className={`${styles.bodyCard} ${bodyType === id ? styles.bodyCardSelected : ""}`}
                      style={{
                        opacity:         showFields ? 1 : 0,
                        transform:       showFields ? "translateY(0)" : "translateY(12px)",
                        transition:      "opacity 0.4s ease, transform 0.4s ease, border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease",
                        transitionDelay: showFields ? `${i * 0.08}s` : "0s",
                      }}
                    >
                      <Icon size={18} stroke={1.75} className={styles.bodyCardIcon} />
                      <div className={styles.bodyCardTitle}>{title}</div>
                      <div className={styles.bodyCardSub}>{sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              {!isSubmitted && (
                <div className={styles.submitWrap}>
                  <button
                    type="button"
                    className={styles.confirmBtn}
                    onClick={handleSubmit}
                    disabled={!isFormValid}
                  >
                    SCAN COMPLETE
                  </button>
                </div>
              )}

              {/* System responses */}
              {showSys1 && (
                <div className={styles.sysLine1} style={{ animation: "system-fade 0.5s ease" }}>
                  Body scan complete. Physical profile stored.
                </div>
              )}
              {showSys2 && (
                <div className={styles.sysLine2} style={{ animation: "system-fade 0.5s ease" }}>
                  Hologram calibrated to your specifications.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: real-time hologram ─────────────────────────────────── */}
        <div className={styles.rightSide}>
          <div className={styles.holoWrap}>
            <div
              className={`${styles.holoInner} ${holoGlow ? styles.holoGlowPulse : ""}`}
              style={{
                transform:       `scaleX(${scaleX}) scaleY(${scaleY})`,
                transformOrigin: "center 90%",
                transition:      "transform 0.3s ease",
              }}
            >
              <BodyHologramSVG gender={gender} bodyType={bodyType} holoOpacity={holoOpacity} />
            </div>
          </div>
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
