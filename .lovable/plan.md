# Plan: True offline support + mobile sidebar auto-close

## Issue 1 — App breaks when offline

Root causes (from screenshot + code review):

1. The service worker caches `/index.html` so the shell loads, but inside the app:
   - `AuthContext` calls `supabase.auth.getSession()` (works offline via local storage) but then `fetchProfile`/`fetchRoles` hit Supabase. Offline these throw, `profile` stays `null`, `profileComplete` becomes `false`, and `ProtectedRoute` redirects to `/complete-profile`. That route's outer chrome isn't rendered, leaving the bare "MB / You're offline" splash.
   - Every query hook (e.g. `useTransactions`) calls `supabase.auth.getUser()` inside `queryFn`, which is a network round-trip. Offline it throws, so even though React Query has a persisted cache, the cached data never displays because the query errors immediately on mount.
   - Mutations (`useCreateTransaction`, etc.) call Supabase directly and surface a toast error offline; nothing is queued for later sync.

### Fixes

**a. Persist profile + roles locally so auth survives offline**

In `AuthContext.tsx`:
- Cache the last fetched `profile` and `roles` in `localStorage` (`mahbook:profile`, `mahbook:roles`) keyed by user id.
- On mount, hydrate `profile`/`roles` from cache immediately so `profileComplete` is correct before any network call.
- Wrap `fetchProfile` / `fetchRoles` in try/catch so a network failure keeps the cached values instead of nulling them.
- Clear cache on `signOut`.

**b. Stop blocking queries on `supabase.auth.getUser()`**

Replace the in-`queryFn` `getUser()` calls with the `user.id` already held in `AuthContext`. Add a small helper hook `useUserId()` and pass it via `enabled`/closure, e.g.:

```ts
const userId = useUserId();
return useQuery({
  queryKey: ["transactions", userId],
  enabled: !!userId,
  queryFn: async () => { /* uses userId directly */ },
  networkMode: "offlineFirst",
});
```

Apply to the read hooks that currently call `supabase.auth.getUser()` inside `queryFn` (`use-transactions`, and any other hook doing the same — quick `rg` sweep before editing). Persisted React Query cache (already configured in `src/lib/offline.ts`) then displays last-known data offline.

**c. Queue writes while offline and auto-sync on reconnect**

Enable React Query's pause-and-resume behavior for mutations:
- In each mutation hook (`useCreateTransaction`, `useUpdateTransaction`, `useDeleteTransaction`, plus the equivalent hooks for accounts, categories, budgets, receivables, payables, savings, etc.), set `networkMode: "online"` so the mutation is paused (not failed) while offline.
- Add an `onMutate` optimistic update for the create/update/delete cases that matter most for UX (transactions, accounts, categories) so the new entry appears immediately in the cached list. Use `queryClient.setQueryData` with a temp UUID; rollback on `onError`.
- Toast: when offline, show `"Saved locally — will sync when you reconnect"` instead of an error. Detect via `onlineManager.isOnline()` inside `onError` (paused mutations don't fire `onError`, but for transient failures we still want the friendly message).
- `App.tsx` already calls `queryClient.resumePausedMutations()` on hydration; also subscribe to `onlineManager` to call it whenever connectivity returns, and invalidate queries afterward so server state catches up.

**d. Service worker: keep current behavior but make sure navigation always falls back**

`public/sw.js` already does network-first for navigations with cached `/index.html` fallback — leave as-is. Bump `CACHE_VERSION` to `mahbook-v5` so installed users pick up the new client logic.

## Issue 2 — Mobile sidebar doesn't close on navigation

In `src/components/layout/AppSidebar.tsx`:
- Pull `isMobile` and `setOpenMobile` from `useSidebar()`.
- On every `NavLink` click (nav groups, admin link, system items), call `if (isMobile) setOpenMobile(false)`.

This collapses the mobile Sheet immediately after a route is selected, matching expected behavior.

## Files touched

- `src/contexts/AuthContext.tsx` — persist profile/roles, hydrate on mount, tolerate offline fetch errors.
- `src/hooks/use-transactions.ts` and other read hooks calling `supabase.auth.getUser()` inside `queryFn` — switch to `userId` from context, add `networkMode: "offlineFirst"`.
- All mutation hooks under `src/hooks/use-*.ts` — `networkMode: "online"`, optimistic updates for the high-traffic ones, friendlier offline toast.
- `src/App.tsx` — resume paused mutations on `onlineManager` reconnect + invalidate queries.
- `src/components/layout/AppSidebar.tsx` — auto-close mobile sidebar on link click.
- `public/sw.js` — bump `CACHE_VERSION` to `mahbook-v5`.

## Out of scope

- Building a custom IndexedDB write queue (React Query's persisted paused-mutations cover this).
- Offline auth sign-in/sign-up (Supabase auth requires network for new sessions; existing sessions remain valid offline).
