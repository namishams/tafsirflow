// mirrors the AsyncStorage API (@react-native-async-storage/async-storage) that the copied app modules use, on
// localStorage. Only getItem / setItem / removeItem / multiRemove / getAllKeys.
const ls = () => { try { return typeof window === "undefined" ? null : window.localStorage; } catch { return null; } };
const AsyncStorage = {
  async getItem(k: string): Promise<string | null> { return ls()?.getItem(k) ?? null; },
  async setItem(k: string, v: string): Promise<void> { try { ls()?.setItem(k, v); } catch { /* full or blocked */ } },
  async removeItem(k: string): Promise<void> { ls()?.removeItem(k); },
  async multiRemove(ks: string[]): Promise<void> { for (const k of ks) ls()?.removeItem(k); },
  async getAllKeys(): Promise<string[]> { const s = ls(); return s ? Object.keys(s) : []; },
};
export default AsyncStorage;
