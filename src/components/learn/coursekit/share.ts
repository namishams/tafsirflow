"use client";
// Web replacement for the app's Share.share / ShareSheet: the system share sheet where the browser has one
// (navigator.share), otherwise the clipboard. Resolves to "shared", "copied" or "failed"; a cancelled share is "failed"
// without a message.
export async function shareOrCopy(data: { title?: string; text: string; url?: string }): Promise<"shared" | "copied" | "failed"> {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      await navigator.share(data);
      return "shared";
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") return "failed";
  }
  try {
    await navigator.clipboard.writeText([data.text, data.url].filter(Boolean).join(" "));
    return "copied";
  } catch {
    return "failed";
  }
}
