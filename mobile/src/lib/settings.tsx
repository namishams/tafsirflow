import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { applyAppearance, type AppearanceSetting } from "./theme";
import { load, save } from "./storage";

type Ctx = { appearance: AppearanceSetting; setAppearance: (a: AppearanceSetting) => void };
const SettingsContext = createContext<Ctx>({ appearance: "system", setAppearance: () => undefined });

// Appearance chosen in the account: System, Light or Dark
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [appearance, setA] = useState<AppearanceSetting>("system");
  useEffect(() => { load<AppearanceSetting>("qmc.appearance", "system").then((a) => { setA(a); applyAppearance(a); }); }, []);
  const setAppearance = useCallback((a: AppearanceSetting) => { setA(a); applyAppearance(a); void save("qmc.appearance", a); }, []);
  const value = useMemo(() => ({ appearance, setAppearance }), [appearance, setAppearance]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
export const useSettings = () => useContext(SettingsContext);
