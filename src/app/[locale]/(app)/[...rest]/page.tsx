import { notFound } from "next/navigation";

// Any unknown address below /<locale>/ ends in the localised "not found" page (../not-found.tsx)
export default function CatchAll() {
  notFound();
}
