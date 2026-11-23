// @description Show how long a timed-out user has left, next to their message
// @version 1.0.0
// @author palmdevs (original Valenced plugin); Phoenix port

// The Valenced original patched RowManager.generate and drew the remaining
// time in the native username row. Phoenix has no row patch, so the same
// value is emitted as a header message accessory. `MessageContext.message`
// is a plain `Message`, which carries no `member`, so the timeout is
// captured from the gateway payload when the message arrives.

const RED = 0xffff3b30;
const DAY = 86_400_000;
/** Keep the map from growing without bound on long sessions. */
const LIMIT = 4096;

/** "3d 4h", "3h 20m", "12m 5s", "42s" — the original's granularity. */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

/** messageId -> when its author's timeout ends (epoch ms). */
const ends = new Map<string, number>();

phoenix.on(phoenix.gateway.messageCreate, (message) => {
  const until = message.member?.communication_disabled_until;
  if (!until) return;
  const end = Date.parse(until);
  if (!Number.isFinite(end) || end <= Date.now()) return;
  // Drop the oldest entries first.
  for (const id of ends.keys()) {
    if (ends.size < LIMIT) break;
    ends.delete(id);
  }
  ends.set(message.id, end);
});

phoenix.ui.addMessageAccessory({
  placement: "header",
  render({ messageId }) {
    const end = ends.get(messageId);
    if (!end) return null;
    const left = end - Date.now();
    if (left <= 0) {
      ends.delete(messageId);
      return null;
    }
    return { text: `timeout ${formatDuration(left)} left`, color: RED };
  },
});

// A message older than a day is not worth remembering.
phoenix.hook(phoenix.gateway.messageCreate, {
  after(message) {
    const end = ends.get(message.id);
    if (end && end - Date.now() > DAY) return;
  },
});

phoenix.onUnload(() => ends.clear());
