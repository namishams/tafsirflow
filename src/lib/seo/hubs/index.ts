import type { Hub, HubId } from "../types";

export async function loadHub(locale: string, id: HubId): Promise<Hub> {
  const own = (await import(`./${locale}`).catch(() => null))?.default as Record<HubId, Hub> | undefined;
  if (own?.[id]) return own[id];
  return ((await import(`./${"en" as string}`)).default as Record<HubId, Hub>)[id];
}
