## Problem

`src/contexts/AppContext.tsx` seeds `notifications` from a hardcoded `DEFAULT_NOTIFICATIONS` array (6 mock items like "Budget threshold reached", "Tanvir Ahmed owes…") whenever `localStorage["cc_notifications"]` is empty. So every new account / fresh browser sees these fake alerts in the header bell dropdown.

These mock entries are unrelated to the user's real data and contradict the live `AlertsCard` (which already computes real alerts from budgets, reminders, and installments).

## Fix

In `src/contexts/AppContext.tsx`:

1. Remove the `DEFAULT_NOTIFICATIONS` constant.
2. Change `loadNotifications()` to return `[]` when nothing is stored.
3. Leave the rest of the notification API (`markRead`, `markAllRead`, `unreadCount`, persistence) untouched so future real notifications still work.

No other files need changes — the bell UI already handles an empty list (it just shows "no notifications" / zero badge).

## Optional cleanup (only if you want)

Clear stale mock notifications for existing sessions by bumping the storage key (e.g. `cc_notifications` → `cc_notifications_v2`) so users who already have the seeded mocks in localStorage also get a clean slate. Otherwise existing browsers keep their old seeded entries until "Mark all read" / manual clear.

Confirm whether you want the storage-key bump, or just the default-to-empty change.
