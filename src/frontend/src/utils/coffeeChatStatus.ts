import type { ChatStatus } from '../components/coffee-chats/CoffeeChatCard';

/**
 * Derive the display status for a coffee chat based on the stored status
 * and whether the scheduled time has passed.
 *
 * Status mapping for display:
 *   pending   → pending (employer hasn't accepted)
 *   accepted  → upcoming (accepted, not yet occurred)
 *   scheduled → upcoming (scheduled, not yet occurred)
 *   completed → completed
 *   cancelled → cancelled
 *
 * Auto-completion: if scheduled_at is in the past and status is accepted/scheduled,
 * the display status becomes 'completed'.
 */
export type DisplayStatus = 'pending' | 'upcoming' | 'completed' | 'cancelled' | 'declined';

export function deriveDisplayStatus(
  status: ChatStatus,
  scheduledAt?: string | null,
): DisplayStatus {
  if (status === 'cancelled') return 'cancelled';

  // Auto-complete: if the scheduled time has passed
  if (scheduledAt && (status === 'accepted' || status === 'scheduled')) {
    const scheduledTime = new Date(scheduledAt);
    if (scheduledTime < new Date()) {
      return 'completed';
    }
  }

  if (status === 'completed') return 'completed';
  if (status === 'accepted' || status === 'scheduled') return 'upcoming';
  return 'pending';
}

/**
 * Sort coffee chats for date detail view.
 * Order: upcoming (earliest first), pending (earliest first), completed (earliest first)
 */
export function sortChatsForDateView<T extends { displayStatus: DisplayStatus; scheduledAt?: string | null }>(
  chats: T[],
): T[] {
  const order: Record<DisplayStatus, number> = {
    upcoming: 0,
    pending: 1,
    completed: 2,
    cancelled: 3,
    declined: 4,
  };

  return [...chats].sort((a, b) => {
    const orderDiff = order[a.displayStatus] - order[b.displayStatus];
    if (orderDiff !== 0) return orderDiff;
    // Within same status group, sort by time (earliest first)
    const timeA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : Infinity;
    const timeB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : Infinity;
    return timeA - timeB;
  });
}
