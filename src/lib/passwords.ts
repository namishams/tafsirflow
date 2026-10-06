// Passwords that appear at the top of every leaked-password list are refused outright
const COMMON = new Set([
  "12345678", "123456789", "1234567890", "password", "password1", "passwort", "passwort1", "qwertyui", "qwertzui", "11111111", "00000000",
  "iloveyou", "abcd1234", "abc12345", "1q2w3e4r", "qwerty123", "123123123", "88888888", "87654321", "admin123", "letmein1",
  "bismillah", "bismillah1", "allahuakbar", "muhammad", "muhammad1", "mohammed", "alhamdulillah", "quran123", "masterclass",
]);

export function passwordProblem(pw: string, email: string): "weak" | null {
  if (pw.length < 10 || pw.length > 200) return "weak";
  const p = pw.toLowerCase();
  if (COMMON.has(p) || COMMON.has(p.replace(/[!.?]+$/, ""))) return "weak";
  if (/^(.)\1+$/.test(pw)) return "weak";
  const local = email.split("@")[0].toLowerCase();
  if (local.length >= 4 && p.includes(local)) return "weak";
  return null;
}
