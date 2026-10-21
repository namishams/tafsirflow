import { useRemoteConfig, remoteConfig, type FeedConfig } from "@/features/feed/remote";

// Server switches (website src/lib/feed/config.json, served with the feed config): posting.enabled (owner decision
// 21.10.2026: off – the network shows learning achievements only; the clip code stays behind this switch) and sijill
// (moments in the main feed, leaderboards, compare). Unknown or offline = posting off, leaderboards and compare on.
type Remote = FeedConfig & { posting?: { enabled?: boolean }; sijill?: { momentsInFeed?: boolean; leaderboards?: boolean; compare?: boolean } };
const flags = (c: Remote | null) => ({
  posting: c?.posting?.enabled === true,
  momentsInFeed: c?.sijill?.momentsInFeed === true,
  leaderboards: c?.sijill?.leaderboards !== false,
  compare: c?.sijill?.compare !== false,
});
export const sijillFlags = () => flags(remoteConfig() as Remote | null);
export function useSijillFlags() { return flags(useRemoteConfig() as Remote | null); }
/** clips, stories, comments and the path to posting are switched on */
export const usePostingOn = () => useSijillFlags().posting;
