# THE SYSTEM

A dark sci-fi onboarding experience. Before a user ever reaches a dashboard, the system identifies them, assigns a path, and runs them through a calibration sequence. Every screen is a dialogue between the user and a cold, cinematic operating system — typewriters, holographic wireframes, and a persistent HUD that never lets you forget where you are.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Styling | Tailwind v4 (CSS-first `@theme` in `globals.css`) |
| Language | JavaScript (.jsx, no TypeScript) |
| Icons | @tabler/icons-react v3 |
| Fonts | Orbitron (display headline only), Share Tech Mono (everything else) |
| State | sessionStorage via `src/lib/systemState.js` |

---

## Design System

All screens share the same visual language. No exceptions.

```
Background    #070B0D
Primary       #00D4FF  (cyan — UI chrome, accents, hologram)
Green         #00C896  (system responses only)
Error         #FF3C3C

Font (body)   Share Tech Mono — all text, all sizes
Font (hero)   Orbitron 700/900 — "THE SYSTEM" headline only

No emojis. No gradients. No border-radius above 4px.
Scrollbars hidden. Text white at varying opacities.
```

**Shared HUD chrome (every screen via `SystemFrame`):**
- Fixed background grid (cyan lines at 3% opacity, 40px cells)
- Breathing corner brackets at all 4 corners
- Top-left: S logo in a thin breathing circle
- Top-right: live system clock (hidden on mobile)
- Bottom-left: `SYS.v1.0 | STATUS: ONLINE`
- Bottom-right: per-screen status string
- Page entry: `system-fade` 0.35s on every mount

---

## Onboarding Flow

Three universal screens run before all paths. After path selection the flow branches into one of four calibration sequences, then converges on the Dashboard.

```
Boot  -->  Identify  -->  Path Selection
                               |
          +-----------+--------+-----------+
          |           |                    |
       ACADEMICS    FITNESS            SIDE QUEST
          |           |                    |
         4A          4B                   4D
        (Age)      (Gender)              (Age)
          |           |                    |
         5A          5B                   5D
      (Academic    (Age)              (Habit
        Focus)       |               Selection)
          |          ...                  6D
         6A           |                   |
          |          ...               Dashboard
         ...
          |
       Dashboard


  BOTH path = fitness sequence (4B -> 5B -> 6B -> 7B)
              then academics sequence (5A -> 6A -> 7A -> 8A)
              then Dashboard
```

**Progress counters:** Academics / Fitness / Both show STEP X OF 5. Side Quest shows STEP X OF 3.

---

## Screens Built

| Route | Screen | Path | Status |
|---|---|---|---|
| `/` | Boot | Universal | Done |
| `/identify` | Identification / Login | Universal | Done |
| `/path-selection` | Path Selection | Universal | Done |
| `/screen-04a` | Age Input | Academics | Done |
| `/screen-05a` | Academic Focus | Academics | Done |
| `/screen-04b` | Gender Selection + Hologram | Fitness / Both | Done |
| `/screen-05b` | Age Input + Hologram | Fitness / Both | Done |
| `/screen-04d` | Age Input | Side Quest | Done |
| `/screen-05d` | Habit Selection | Side Quest | Done |

Screens not yet specced (6A, 6B, 6D, 7A, 7B, 8A, 8B, Dashboard) hit a `PendingScreen` placeholder or 404.

---

## Project Structure

```
src/
  app/
    layout.js                Root layout — fonts, metadata
    page.js                  Entry point -> Boot screen
    globals.css              Design tokens, shared keyframes, HUD helpers
    identify/
    path-selection/
    screen-04a/  screen-04b/  screen-04d/
    screen-05a/  screen-05b/  screen-05d/

  components/
    SystemFrame.jsx           Shared HUD chrome — wraps every screen
    HologramFigure.jsx        SVG wireframe body (neutral / male / female)
    HologramFigure.module.css
    screens/
      Boot.jsx
      Identification.jsx      + .module.css
      PathSelection.jsx       + .module.css
      AgeAcademics.jsx        + .module.css   (04A)
      AcademicFocus.jsx       + .module.css   (05A)
      GenderFitness.jsx       + .module.css   (04B)
      AgeFitness.jsx          + .module.css   (05B)
      AgeSideQuest.jsx        + .module.css   (04D)
      HabitSideQuest.jsx      + .module.css   (05D)
      PendingScreen.jsx

  lib/
    flowMap.js      Route sequences per path + nextScreen() helper
    systemState.js  sessionStorage read/write
```

---

## Session State Shape

User data accumulates in `sessionStorage` across screens and resets when the tab closes.

```js
{
  name:           string,
  authMethod:     "name",           // "google" when OAuth is wired
  userId:         null,             // future Supabase field
  path:           "academics" | "fitness" | "both" | "side-quest",
  gender:         "male" | "female",    // fitness / both paths only
  age:            number,
  academic_focus: string,               // academics / both paths
  habits:         string[],             // side quest path
}
```

---

## Hologram

Fitness-path screens (4B, 5B and onwards) display a wireframe human figure on the right panel. Selecting a gender in 4B crossfades the silhouette from neutral to male or female over 0.8s with a cyan `drop-shadow` glow pulse. The figure floats on a 4s sine loop and carries a mesh grid pattern and sweeping scan line.

The component (`HologramFigure`) is self-contained. When a Three.js / React Three Fiber asset is ready, only that file changes — no screen components need touching. The plan is morph targets on a GLTF model so body dimensions can be adjusted live based on user weight and height inputs.

---

## Running Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Navigate the flow from Boot, or jump directly to any route (e.g. `/screen-04b`). Session state does not persist across tab closes.

```bash
npm run build    # production build — must pass before committing
npm run lint     # ESLint
```

---

## Fonts

Loaded via `next/font/google` in `layout.js` and injected as CSS variables:

```
--font-orbitron          Orbitron 700 / 900
--font-share-tech-mono   Share Tech Mono 400
```

Tailwind v4 maps these to `font-display` and `font-mono` utility classes via `@theme` in `globals.css`.
