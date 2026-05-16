# Why offline mode isn't working on the deployed app

Root cause is in `index.html` (lines 51–67):

```js
const isLocalPreview =
  ['localhost', '127.0.0.1'].includes(window.location.hostname)
  || window.location.hostname.includes('lovableproject.com')
  || window.location.hostname.includes('lovable.app');   // <-- this line

if (isLocalPreview) {
  // unregister all SWs + delete mahbook-* caches
}
```

The published site lives at `https://mahbooks.lovable.app`. Because the host
contains `lovable.app`, the bootstrap code treats it as a preview and
**actively unregisters the service worker and wipes the caches on every
load**. So:

- `/sw.js` never stays registered on the deployed PWA.
- `caches` named `mahbook-v5-*` are deleted immediately.
- When the device goes offline, there's no SW to serve `/index.html` or
  cached assets, and the browser falls back to its native "You're offline"
  screen — exactly what the screenshot shows.

The SW + offline-first React Query work we shipped is fine; it just never
gets a chance to run in production.

A secondary issue: the `controllerchange` handler unconditionally calls
`window.location.reload()`. If a new SW activates while the device is
offline, the reload fails and the user is stuck on the browser's offline
page. We should skip the reload when `navigator.onLine === false`.

# Plan

### 1. `index.html` — only treat true preview hosts as "local preview"

Tighten the check so we keep unregistering the SW in the Lovable editor
preview (which runs inside an iframe and on `id-preview--*.lovable.app` /
`*.lovableproject.com`), but **register normally on the published custom
subdomain** (e.g. `mahbooks.lovable.app`, custom domains).

```js
const host = window.location.hostname;
const isInIframe = (() => { try { return window.self !== window.top; } catch { return true; } })();
const isLovableEditorPreview =
  host === 'localhost' ||
  host === '127.0.0.1' ||
  host.includes('lovableproject.com') ||
  host.startsWith('id-preview--') ||      // editor preview subdomains
  isInIframe;                              // any iframe context (covers editor)

if (isLovableEditorPreview) {
  // existing unregister + cache cleanup
} else {
  window.addEventListener('load', /* existing register('/sw.js') flow */);
}
```

This keeps the editor preview clean (per Lovable PWA guidance) while
letting the published `mahbooks.lovable.app` domain install and keep the
service worker.

### 2. `index.html` — don't reload on `controllerchange` while offline

```js
navigator.serviceWorker.addEventListener('controllerchange', function () {
  if (refreshing) return;
  if (navigator.onLine === false) return;   // <-- new guard
  refreshing = true;
  window.location.reload();
});
```

Prevents the white "You're offline" screen if the SW updates mid-session
without connectivity.

### 3. `public/sw.js` — bump cache version to `mahbook-v6`

So returning users force-evict any stale `mahbook-v5` shell and pick up
the corrected client logic on next visit.

### 4. Verification steps to share with the user

After deploy, on `https://mahbooks.lovable.app`:

1. Load the app once online → DevTools › Application › Service Workers
   should now show `sw.js` as **activated and running**, and
   Cache Storage should contain `mahbook-v6-shell` / `mahbook-v6-assets`.
2. DevTools › Network → set to **Offline**, hard-refresh: the app shell
   should load, `OfflineBanner` should show the red "You're offline" bar,
   and cached transactions/accounts should still render.
3. Add a transaction while offline → it appears optimistically with the
   "Saved locally — will sync when you're back online" toast.
4. Toggle Network back to **Online** → amber "Syncing N changes…" banner,
   then green "All changes synced."

## Files touched

- `index.html` — narrow the preview check; guard the reload.
- `public/sw.js` — `CACHE_VERSION = 'mahbook-v6'`.

## Out of scope

- Editor preview offline support (intentionally disabled per Lovable PWA
  guidance — service workers in iframes cause stale-content problems).
- Any changes to `AuthContext`, React Query config, or `OfflineBanner` —
  those already work, they just need the SW alive in production.
