## Goal
Replace the flat "MB" PWA icon set with a premium 3D-styled icon matching the uploaded reference (deep navy-blue rounded squircle, beveled metallic "MB" with gold edge highlights, soft outer glow).

## Approach
1. **Generate a master icon** (1024×1024 PNG, transparent background) using `imagegen` with the `premium` tier for crisp text/bevel fidelity. Prompt will describe: rounded-squircle tile, deep navy gradient, 3D extruded "MB" monogram with brushed-metal face and gold beveled edges, soft ambient glow, subtle highlight — matching the reference screenshot.
2. **Generate a maskable variant** with extra safe-zone padding (icon centered at ~70% of canvas) so Android adaptive masks don't clip the monogram.
3. **Resize into all required PWA + iOS sizes** via a sharp/imagemagick script:
   - `public/icons/icon-{72,96,128,144,152,192,384,512}.png` (any purpose)
   - `public/icons/icon-{192,512}-maskable.png` (maskable, padded source)
   - `public/apple-touch-icon.png` (180)
   - `public/apple-touch-icon-{120,152,167,180}.png`
   - `public/favicon.ico` regen optional (skip unless requested)
4. **Update `src/components/shared/BrandLogo.tsx`** so the in-app brand tile visually echoes the new icon: deeper navy gradient + subtle gold inner ring + stronger inset highlight (keeps existing API, no layout change). This keeps the app header consistent with the installed icon.
5. **No manifest.json change needed** — sizes/paths already match. Bump SW cache version (`mahbook-v3` → `mahbook-v4`) in `public/sw.js` so installed users get the new icons on next update.
6. **QA**: view a few of the generated PNGs to confirm the bevel/colors render, check the maskable version stays inside the safe circle.

## Files touched
- `public/icons/*.png` (overwrite all sizes)
- `public/apple-touch-icon*.png` (overwrite)
- `public/sw.js` (cache version bump only)
- `src/components/shared/BrandLogo.tsx` (visual polish to match)

## Out of scope
- Manifest schema changes, new routes, splash screens, favicon.ico regen.

## Question before I build
The reference shows a **deep navy + gold** premium look, but the current brand memory specifies an **indigo→violet gradient** (`#6366f1`→violet) used across the app. Two options:

- **A. Match the screenshot exactly** — navy/gold icon. The installed app icon will look distinct from the in-app indigo/violet brand tiles (slight inconsistency).
- **B. Premium 3D in the existing indigo→violet palette** — same depth/bevel/glow treatment as the reference, but indigo/violet face with lighter violet highlights instead of gold. Keeps the whole brand system consistent.

I'll ask this as a quick question after you approve the plan.
