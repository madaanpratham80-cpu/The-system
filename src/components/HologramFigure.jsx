import styles from "./HologramFigure.module.css";

// ─── Body shape sets ─────────────────────────────────────────────────────────
// Polygons/ellipses for each silhouette. The same elements are used twice per
// figure: once in a <clipPath> (to mask the mesh-grid overlay) and once as the
// rendered geometry (dark fill + cyan stroke inherited from the parent <g>).

function NeutralShapes() {
  return (
    <>
      <ellipse cx="100" cy="40"  rx="25" ry="28" />
      <rect    x="93"  y="67"   width="14"  height="16" />
      <polygon points="62,83 138,83 133,195 67,195" />
      <polygon points="62,83 44,89 41,200 62,200 67,195" />
      <polygon points="138,83 156,89 159,200 138,200 133,195" />
      <polygon points="67,195 133,195 130,240 70,240" />
      <rect    x="70"  y="240"  width="27"  height="114" />
      <rect    x="103" y="240"  width="27"  height="114" />
    </>
  );
}

function MaleShapes() {
  return (
    <>
      {/* Wide shoulders, rectangular chest, narrower hips */}
      <ellipse cx="100" cy="40"  rx="26" ry="29" />
      <rect    x="91"  y="69"   width="18"  height="15" />
      <polygon points="45,84 155,84 140,196 60,196" />
      <polygon points="45,84 26,90 23,198 47,198 60,196" />
      <polygon points="155,84 174,90 177,198 153,198 140,196" />
      <rect    x="60"  y="196"  width="80"  height="26" />
      <polygon points="62,222 138,222 135,254 65,254" />
      <rect    x="65"  y="254"  width="29"  height="100" />
      <rect    x="106" y="254"  width="29"  height="100" />
    </>
  );
}

function FemaleShapes() {
  return (
    <>
      {/* Narrower shoulders, defined waist, wider hips */}
      <ellipse cx="100" cy="38"  rx="23" ry="27" />
      <rect    x="93"  y="65"   width="14"  height="17" />
      <polygon points="55,82 145,82 130,178 70,178" />
      <polygon points="55,82 38,88 36,183 56,183 70,178" />
      <polygon points="145,82 162,88 164,183 144,183 130,178" />
      <rect    x="72"  y="178"  width="56"  height="27" />
      <polygon points="47,205 153,205 150,254 50,254" />
      <rect    x="52"  y="254"  width="36"  height="100" />
      <rect    x="112" y="254"  width="36"  height="100" />
    </>
  );
}

// ─── SVG renderer ─────────────────────────────────────────────────────────────

function HologramSVG({ gender }) {
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
      style={{
        width:      "100%",
        height:     "100%",
        overflow:   "visible",
        opacity:    gender ? 0.42 : 0.22,
        transition: "opacity 0.8s ease",
      }}
    >
      <defs>
        <pattern id="hfBodyGrid" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M 14 0 L 0 0 0 14" fill="none" stroke="rgba(0,212,255,0.38)" strokeWidth="0.5" />
        </pattern>
        <clipPath id="hfClipNeutral"><NeutralShapes /></clipPath>
        <clipPath id="hfClipMale"><MaleShapes /></clipPath>
        <clipPath id="hfClipFemale"><FemaleShapes /></clipPath>
      </defs>

      {/* Neutral (pre-selection) */}
      <g style={{ ...bodyStyle, opacity: gender ? 0 : 1, transition: "opacity 0.8s ease" }}>
        <NeutralShapes />
        <rect x="0" y="0" width="200" height="360"
          fill="url(#hfBodyGrid)" stroke="none" clipPath="url(#hfClipNeutral)" />
      </g>

      {/* Male */}
      <g style={{ ...bodyStyle, opacity: gender === "male" ? 1 : 0, transition: "opacity 0.8s ease" }}>
        <MaleShapes />
        <rect x="0" y="0" width="200" height="360"
          fill="url(#hfBodyGrid)" stroke="none" clipPath="url(#hfClipMale)" />
      </g>

      {/* Female */}
      <g style={{ ...bodyStyle, opacity: gender === "female" ? 1 : 0, transition: "opacity 0.8s ease" }}>
        <FemaleShapes />
        <rect x="0" y="0" width="200" height="360"
          fill="url(#hfBodyGrid)" stroke="none" clipPath="url(#hfClipFemale)" />
      </g>

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

// ─── Public component ─────────────────────────────────────────────────────────

/**
 * Reusable holographic wireframe figure used across all fitness-path screens.
 * Pass `gender` ("male" | "female" | null) to control which silhouette shows.
 * Pass `glow={true}` for the brief cyan pulse fired on gender selection.
 * The float animation lives here so it never restarts when glow toggles.
 */
export default function HologramFigure({ gender = null, glow = false }) {
  return (
    <div className={styles.holoWrap}>
      <div className={`${styles.holoInner} ${glow ? styles.glowPulse : ""}`}>
        <HologramSVG gender={gender} />
      </div>
    </div>
  );
}
