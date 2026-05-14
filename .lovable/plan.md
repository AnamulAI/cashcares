## Goal

Make MahBook installable as a real standalone PWA on Android (and pinnable with a proper icon on iOS), instead of degrading to a Chrome shortcut.

## Root cause

`public/manifest.json` references `/icons/icon-*.png` and `/favicon.ico`, but **`public/icons/` does not exist**. When Android Chrome can't fetch the required 192px and 512px icons, it fails the installability check and offers only "Add to Home screen" (= shortcut), not "Install app" (= standalone PWA).

## Changes

### 1. Generate the MahBook icon set
Use the image generator (premium/transparent) to produce one master 1024×1024 PNG of the MB monogram on the indigo→violet gradient tile (matching `BrandLogo`), then downscale with ImageMagick to every size the manifest requires:

- `public/icons/icon-72x72.png`
- `public/icons/icon-96x96.png`
- `public/icons/icon-128x128.png`
- `public/icons/icon-144x144.png`
- `public/icons/icon-152x152.png`
- `public/icons/icon-192x192.png` (maskable + any)
- `public/icons/icon-384x384.png`
- `public/icons/icon-512x512.png` (maskable + any)
- `public/apple-touch-icon.png` (180×180, with safe padding for iOS rounded mask)

The 192 and 512 maskable variants need ~10% safe-zone padding so Android's adaptive icon mask doesn't crop the monogram.

### 2. Tighten `public/manifest.json`
- Add `"id": "/"` for stable PWA identity
- Split icon entries so 192 and 512 each have **separate** `purpose: "any"` and `purpose: "maskable"` records (Chrome treats combined `"any maskable"` more strictly)
- Keep `start_url`, `scope`, `display: "standalone"` as-is

### 3. Tighten `index.html`
- Point `apple-touch-icon` to the new `/apple-touch-icon.png`
- Keep existing iOS standalone meta tags

### 4. Verification
- Visually QA the generated icons (open the PNGs, confirm the MB monogram is centered and not clipped on the maskable variants)
- Note to the user: install testing must be done on the **published URL** (`https://mahbooks.lovable.app`), not the editor preview — the service worker is intentionally disabled inside the Lovable iframe to prevent cache-staleness bugs.

## Out of scope

- Changing the service-worker caching strategy (recently fixed, working correctly)
- Capacitor / native wrapper (different product decision — ask separately if you want true native iOS/Android builds for the App Store / Play Store)
