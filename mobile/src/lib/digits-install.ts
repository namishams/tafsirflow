// Imported first by the root layout, before any module can hold on to React Native's Text (see digits.ts)
import { installLocalDigits } from "./digits";

installLocalDigits();
