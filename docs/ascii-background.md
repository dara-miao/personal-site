# ASCII aurora background

Canvas-based aurora field behind the bio page. Glyphs drift on layered simplex noise with vertical ombre coloring and optional cursor bloom.

## Tuning (calm / sparse ↔ lively / dense)

All constants live at the top of `src/components/ascii-background.tsx`.

| Dial | Default | Effect |
|------|---------|--------|
| `DENSITY_FLOOR` | `0.28` | Raise (e.g. `0.35`) for fewer visible glyphs; lower for more coverage |
| `GLYPHS` | 3× `" "` then `·`…`∿` | Add leading `" "` entries for emptier low-density bands; remove `·` if still dotty |
| `BASE_ALPHA` | `0.11` | Global whisper level; also scaled by `--ascii-opacity` in CSS |
| `CELL_PX` | `13` | Larger = sparser grid (try `14`–`15`); smaller = finer grain |
| `PEAK_THRESHOLD` | `0.97` | Higher = rarer peak stars (`'`, `+`, `*`) |
| `TEXT_ZONE_RADIUS` | `0.34` | Wider legibility fade around center bio copy (fraction of viewport width) |

Global opacity override: `--ascii-opacity` on `:root` in `globals.css` (default `0.15`).

## Motion ombre tint

Self-drifting aurora bands get a stronger cream / blue / gold wash than static cells. Activity is derived per cell from:

- **Temporal delta** — `|field(t) − field(t − 32ms)|`, scaled by `MOTION_FIELD_SCALE`
- **Flow swing** — displacement change in the flow vector vs one frame ago, scaled by `MOTION_FLOW_SCALE`
- **Glyph density** — flowing glyphs (`~`, `∿`, `─`) contribute via `effectiveField²`

| Dial | Default | Effect |
|------|---------|--------|
| `OMBRE_MOTION_TINT` | `0.62` | Max ombre wash mix on active cells |
| `OMBRE_MOTION_ACCENT` | `0.48` | Blue accent boost layered on motion wash |
| `MOTION_SAMPLE_MS` | `32` | Lookback for temporal / flow comparison |
| `MOTION_FIELD_SCALE` | `11` | Sensitivity to field change over time |
| `MOTION_FLOW_SCALE` | `2.4` | Sensitivity to flow-vector swing |

Motion tint is attenuated in the bio text zone (`28%` at center → full at edge) so copy stays legible. Static reduced-motion fallback passes `motionFactor = 0`.

## Photo reveal ombre

The scroll-revealed photo layer (`.reveal-layer`) carries a self-flowing wide ombre — no cursor interaction. Color continuity from the bio ASCII palette (`--ascii-ombre-accent`, `--ascii-ombre-end`, `--ascii-ombre-start`, `--reveal-bg`).

| Piece | Location | Role |
|-------|----------|------|
| Base washes | `.reveal-layer` background | Three wide ellipses (60–120% viewport) + angled linear gradient |
| Drift overlay | `.reveal-layer::before` | Four overlapping transparent radials + linear sweep |
| Animation | `useRevealOmbreAmbient` in `reveal-ombre-ambient.tsx` | rAF sets `--reveal-drift-*` and `--reveal-drift-angle` via layered sin/cos; gentle `--reveal-ombre-pulse` opacity |

Tuning dials on `.reveal-layer`: `--reveal-ombre-accent-strength`, `--reveal-ombre-warm-strength`, `--reveal-ombre-cream-strength`. With `prefers-reduced-motion: reduce`, drift stops and overlay opacity is fixed.

## Motion

- Animated aurora when motion is allowed; static sparse dot grid when `prefers-reduced-motion: reduce`.
- Scroll drift and pointer bloom unchanged — ombre and flow remain; density/alpha were reduced for editorial calm.
