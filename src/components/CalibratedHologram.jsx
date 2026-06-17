/**
 * CalibratedHologram — body-type-aware wireframe figure for fitness screens.
 * Reads nothing from systemState; all values passed as props.
 * Used by Screen 06B and every fitness screen after it.
 */
import styles from "./CalibratedHologram.module.css";

// ── Scale helpers ─────────────────────────────────────────────────────────────

function heightToScaleY(h) {
  const n = Number(h);
  if (!n) return 1;
  return 0.82 + ((Math.max(140, Math.min(220, n)) - 140) / 80) * 0.36;
}

function weightToScaleX(w) {
  const n = Number(w);
  if (!n) return 1;
  return 0.78 + ((Math.max(40, Math.min(200, n)) - 40) / 160) * 0.54;
}

// ── Body shape sets ───────────────────────────────────────────────────────────

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

// ── Shape variant lookup ──────────────────────────────────────────────────────

const MALE_VARIANTS = [
  { id: "skinny",     clipId: "ch-m-skinny", Shapes: MaleSkinnyShapes    },
  { id: "skinny-fat", clipId: "ch-m-sf",     Shapes: MaleSkinnyFatShapes },
  { id: "fat",        clipId: "ch-m-fat",    Shapes: MaleFatShapes       },
];

const FEMALE_VARIANTS = [
  { id: "skinny",     clipId: "ch-f-skinny", Shapes: FemaleSkinnyShapes    },
  { id: "skinny-fat", clipId: "ch-f-sf",     Shapes: FemaleSkinnyFatShapes },
  { id: "fat",        clipId: "ch-f-fat",    Shapes: FemaleFatShapes       },
];

// ── SVG renderer ──────────────────────────────────────────────────────────────

function CalibratedSVG({ gender, bodyType, opacity }) {
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
      style={{ width: "100%", height: "100%", overflow: "visible", opacity, transition: "opacity 0.6s ease" }}
    >
      <defs>
        <pattern id="ch-grid" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M 14 0 L 0 0 0 14" fill="none" stroke="rgba(0,212,255,0.38)" strokeWidth="0.5" />
        </pattern>
        {MALE_VARIANTS.map(({ clipId, Shapes }) => (
          <clipPath key={clipId} id={clipId}><Shapes /></clipPath>
        ))}
        {FEMALE_VARIANTS.map(({ clipId, Shapes }) => (
          <clipPath key={clipId} id={clipId}><Shapes /></clipPath>
        ))}
        <clipPath id="ch-neutral"><NeutralShapes /></clipPath>
      </defs>

      {/* Neutral fallback */}
      <g style={{ ...bodyStyle, opacity: gender ? 0 : 1, transition: "opacity 0.8s ease" }}>
        <NeutralShapes />
        <rect x="0" y="0" width="200" height="390" fill="url(#ch-grid)" stroke="none" clipPath="url(#ch-neutral)" />
      </g>

      {/* Male variants */}
      {MALE_VARIANTS.map(({ id, clipId, Shapes }) => (
        <g key={id} style={{ ...bodyStyle, opacity: gender === "male" && activeType === id ? 1 : 0, transition: "opacity 0.5s ease" }}>
          <Shapes />
          <rect x="0" y="0" width="200" height="390" fill="url(#ch-grid)" stroke="none" clipPath={`url(#${clipId})`} />
        </g>
      ))}

      {/* Female variants */}
      {FEMALE_VARIANTS.map(({ id, clipId, Shapes }) => (
        <g key={id} style={{ ...bodyStyle, opacity: gender === "female" && activeType === id ? 1 : 0, transition: "opacity 0.5s ease" }}>
          <Shapes />
          <rect x="0" y="0" width="200" height="390" fill="url(#ch-grid)" stroke="none" clipPath={`url(#${clipId})`} />
        </g>
      ))}

      {/* Platform */}
      <ellipse cx="100" cy="370" rx="84" ry="11"
        fill="rgba(0,212,255,0.04)" stroke="rgba(0,212,255,0.12)" strokeWidth="1" />
      <ellipse cx="100" cy="370" rx="46" ry="7"
        fill="rgba(0,212,255,0.07)" stroke="rgba(0,212,255,0.22)" strokeWidth="1" />

      <rect className={styles.scanLine} x="0" y="0" width="200" height="5"
        fill="rgba(0,212,255,0.10)" stroke="none" />
    </svg>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

/**
 * @param {string|null}  gender   - "male" | "female" | null
 * @param {string|null}  bodyType - "skinny" | "skinny-fat" | "fat" | null
 * @param {number|null}  heightCm - drives scaleY
 * @param {number|null}  weightKg - drives scaleX
 * @param {number}       opacity  - base SVG opacity (default 0.70)
 * @param {boolean}      glow     - true for a brief cyan glow pulse
 */
export default function CalibratedHologram({
  gender   = null,
  bodyType = null,
  heightCm = null,
  weightKg = null,
  opacity  = 0.70,
  glow     = false,
}) {
  const scaleY = heightCm ? heightToScaleY(heightCm) : 1;
  const scaleX = weightKg ? weightToScaleX(weightKg) : 1;

  return (
    <div className={styles.holoWrap}>
      <div
        className={`${styles.holoInner} ${glow ? styles.glowPulse : ""}`}
        style={{
          transform:       `scaleX(${scaleX}) scaleY(${scaleY})`,
          transformOrigin: "center 90%",
          transition:      "transform 0.3s ease",
        }}
      >
        <CalibratedSVG gender={gender} bodyType={bodyType} opacity={opacity} />
      </div>
    </div>
  );
}
