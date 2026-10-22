import { T } from "./api";
import { M } from "@/features/messenger/api";

// Unread counts of the talent network for the own profile (owner, 22.10.2026: the Profile tab shows a dot on the menu
// button, the settings list Notifications, Messages and Requests first, each with its count). Every call is best
// effort: a failure counts as 0 and never blocks the screen.
export type Unread = { notes: number; messages: number; connections: number; follows: number };
export const NO_UNREAD: Unread = { notes: 0, messages: 0, connections: 0, follows: 0 };
export const unreadTotal = (u: Unread) => u.notes + u.messages + u.connections + u.follows;

const count = <X,>(p: Promise<X>, f: (x: X) => number) => p.then(f).catch(() => 0);

/** `interact`: 16+ (messages and connection requests); `privateAccount`: follow requests wait for approval */
export async function loadUnread(opts: { interact: boolean; privateAccount: boolean }): Promise<Unread> {
  const [notes, messages, connections, follows] = await Promise.all([
    count(T.notifications(), (d) => d.unread ?? 0),
    opts.interact ? count(M.unread(), (d) => (d.inbox ?? 0) + (d.requests ?? 0)) : Promise.resolve(0),
    opts.interact ? count(T.connections(), (d) => d.incoming.length) : Promise.resolve(0),
    opts.privateAccount ? count(T.followRequests(), (d) => d.requests.length) : Promise.resolve(0),
  ]);
  return { notes, messages, connections, follows };
}
