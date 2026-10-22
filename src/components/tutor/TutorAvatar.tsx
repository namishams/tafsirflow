"use client";

import { useId } from "react";

// Dalil, the AI tutor: a calm sheikh in white ghutra, dark agal and a black bisht with gold trim, drawn as a
// circular emerald badge. Same artwork (same paths, 200 x 200 viewBox) as mobile/src/features/tutor/TutorAvatar.tsx.
// Idle motion is pure CSS (breathing, an occasional blink) and only runs with prefers-reduced-motion: no-preference.

const CSS = `
@media (prefers-reduced-motion: no-preference) {
  .dalil-anim .dalil-breath { animation: dalil-breathe 4s ease-in-out infinite; }
  .dalil-anim .dalil-lids { animation: dalil-blink 5.2s linear infinite; }
  .dalil-anim .dalil-glow { animation: dalil-glow 1.6s ease-in-out infinite; }
}
@keyframes dalil-breathe { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-1.2px) scale(1.015); } }
@keyframes dalil-blink { 0%, 93% { opacity: 0; } 93.4%, 95.4% { opacity: 1; } 95.8%, 100% { opacity: 0; } }
@keyframes dalil-glow { 0%, 100% { opacity: 0.15; } 50% { opacity: 0.85; } }
`;

const STAR_OUTER = "M100.0 10.0L121.7 31.7L152.3 31.7L152.3 62.3L174.0 84.0L152.3 105.7L152.3 136.3L121.7 136.3L100.0 158.0L78.3 136.3L47.7 136.3L47.7 105.7L26.0 84.0L47.7 62.3L47.7 31.7L78.3 31.7Z";
const STAR_INNER = "M100.0 32.0L115.2 47.2L136.8 47.2L136.8 68.8L152.0 84.0L136.8 99.2L136.8 120.8L115.2 120.8L100.0 136.0L84.8 120.8L63.2 120.8L63.2 99.2L48.0 84.0L63.2 68.8L63.2 47.2L84.8 47.2Z";

export default function TutorAvatar({ size = 40, still = false, speaking = false, className = "" }: { size?: number; still?: boolean; speaking?: boolean; className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = (n: string) => `dalil-${uid}-${n}`;
  const u = (n: string) => `url(#${id(n)})`;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" role="img" aria-label="Dalil" className={`${still ? "" : "dalil-anim "}${className}`.trim()}>
      <style>{CSS}</style>
      <defs>
        <radialGradient id={id("bg")} cx="50%" cy="40%" r="62%"><stop offset="0" stopColor="#3f9a68" /><stop offset="0.55" stopColor="#1f6b4a" /><stop offset="1" stopColor="#0c4a37" /></radialGradient>
        <linearGradient id={id("gold")} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f3dfa2" /><stop offset="0.5" stopColor="#c9a14a" /><stop offset="1" stopColor="#e8c877" /></linearGradient>
        <linearGradient id={id("trim")} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f3dfa2" /><stop offset="1" stopColor="#c9a14a" /></linearGradient>
        <linearGradient id={id("ghutra")} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#e4dfd3" /><stop offset="0.35" stopColor="#f7f4ec" /><stop offset="0.65" stopColor="#f7f4ec" /><stop offset="1" stopColor="#ddd7ca" /></linearGradient>
        <linearGradient id={id("bisht")} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2c2f33" /><stop offset="1" stopColor="#121416" /></linearGradient>
        <linearGradient id={id("skin")} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d4a080" /><stop offset="0.6" stopColor="#c89474" /><stop offset="1" stopColor="#b8826a" /></linearGradient>
        <linearGradient id={id("beard")} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2e2520" /><stop offset="0.75" stopColor="#3a302a" /><stop offset="1" stopColor="#6b635b" /></linearGradient>
        <linearGradient id={id("thobe")} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#dcd6c9" /><stop offset="0.5" stopColor="#f7f4ec" /><stop offset="1" stopColor="#dcd6c9" /></linearGradient>
        <clipPath id={id("clip")}><circle cx="100" cy="100" r="97" /></clipPath>
      </defs>
      <circle cx="100" cy="100" r="98" fill={u("bg")} />
      <g clipPath={u("clip")}>
        <path d={STAR_OUTER} fill="none" stroke="#e8c877" strokeWidth={1.2} opacity={0.22} />
        <path d={STAR_INNER} fill="#e8c877" opacity={0.07} />
        <g className="dalil-breath" style={{ transformBox: "view-box", transformOrigin: "100px 200px" }}>
          {/* ghutra (back), shadowed lining around the face */}
          <path d="M100 24C135 24 153 45 154 76C155 104 158 128 168 150L170 176L30 176L32 150C42 128 45 104 46 76C47 45 65 24 100 24Z" fill={u("ghutra")} />
          <ellipse cx="100" cy="102" rx="34" ry="44" fill="#cfc8b9" />
          {/* thobe, neck, collar and tassel */}
          <path d="M66 152C80 146 120 146 134 152L134 200L66 200Z" fill={u("thobe")} />
          <path d="M86 126L86 150C94 157 106 157 114 150L114 126Z" fill="#a8765a" />
          <path d="M85 149C92 157 108 157 115 149" fill="none" stroke="#d6d0c2" strokeWidth={2.4} strokeLinecap="round" />
          <path d="M100 156L100 182" stroke="#e2dccf" strokeWidth={2} strokeLinecap="round" />
          <ellipse cx="100" cy="185" rx="2.2" ry="3.4" fill="#e2dccf" />
          {/* bisht with gold trim */}
          <path d="M2 200C6 172 32 156 64 151C72 150 78 150 83 152C85 170 89 186 92 200Z" fill={u("bisht")} />
          <path d="M198 200C194 172 168 156 136 151C128 150 122 150 117 152C115 170 111 186 108 200Z" fill={u("bisht")} />
          <path d="M83 152C85 170 89 186 92 200" fill="none" stroke={u("trim")} strokeWidth={3.4} strokeLinecap="round" />
          <path d="M117 152C115 170 111 186 108 200" fill="none" stroke={u("trim")} strokeWidth={3.4} strokeLinecap="round" />
          <path d="M78.5 153C80 160 81 166 83.5 172" fill="none" stroke="#c9a14a" strokeWidth={1.4} strokeLinecap="round" opacity={0.8} />
          <path d="M121.5 153C120 160 119 166 116.5 172" fill="none" stroke="#c9a14a" strokeWidth={1.4} strokeLinecap="round" opacity={0.8} />
          <path d="M40 162C46 170 50 182 52 200" fill="none" stroke="#000" strokeWidth={1.4} opacity={0.25} />
          <path d="M160 162C154 170 150 182 148 200" fill="none" stroke="#000" strokeWidth={1.4} opacity={0.25} />
          {/* face */}
          <ellipse cx="100" cy="100" rx="26" ry="33" fill={u("skin")} />
          <ellipse cx="83" cy="110" rx="5" ry="3.5" fill="#d98a72" opacity={0.25} />
          <ellipse cx="117" cy="110" rx="5" ry="3.5" fill="#d98a72" opacity={0.25} />
          {/* beard with a touch of grey */}
          <path d="M74 96C74.5 110 79.5 117.5 88 120C94 121.6 106 121.6 112 120C120.5 117.5 125.5 110 126 96C129.5 119 127 136 118 145C112 150 105.5 152.5 100 152.5C94.5 152.5 88 150 82 145C73 136 70.5 119 74 96Z" fill={u("beard")} />
          <path d="M94 136Q96 144 95 150M106 136Q104 144 105 150M100 140L100 151.5" fill="none" stroke="#cfc9c0" strokeWidth={1} strokeLinecap="round" opacity={0.5} />
          <path d="M76 116Q78 124 81 129M124 116Q122 124 119 129" fill="none" stroke="#c7c1b8" strokeWidth={0.9} strokeLinecap="round" opacity={0.4} />
          {/* gentle smile, moustache, nose */}
          <path d="M94 125Q100 130 106 125Q100 127.6 94 125Z" fill="#b0705c" />
          <path d="M92.3 123.6Q100 127.6 107.7 123.6" fill="none" stroke="#6e4031" strokeWidth={1.1} strokeLinecap="round" />
          <path d="M86.5 121C90 115 97 114.5 100 117C103 114.5 110 115 113.5 121C109 122.8 104 122.3 100 120.8C96 122.3 91 122.8 86.5 121Z" fill="#2a221d" />
          <path d="M98.6 98C98.4 104 97.4 108 96.2 110.8" fill="none" stroke="#a06c52" strokeWidth={1.3} strokeLinecap="round" opacity={0.8} />
          <path d="M95.2 111.6Q96.5 114.2 100 114.2Q103.5 114.2 104.8 111.6" fill="none" stroke="#93604a" strokeWidth={1.4} strokeLinecap="round" />
          <path d="M101.5 100C102 104 102.6 107 103.2 109" fill="none" stroke="#e2b394" strokeWidth={1.2} strokeLinecap="round" opacity={0.6} />
          {/* eyes */}
          <path d="M81.5 96Q88 91.6 94.5 96Q88 99.4 81.5 96Z" fill="#fbf7ee" />
          <circle cx="88.3" cy="95.7" r="2.7" fill="#3b2617" />
          <circle cx="88.3" cy="95.7" r="1.3" fill="#140c08" />
          <circle cx="89.2" cy="94.8" r="0.7" fill="#fff" />
          <path d="M81 96.2Q88 90.8 95 96" fill="none" stroke="#2f2119" strokeWidth={1.5} strokeLinecap="round" />
          <path d="M105.5 96Q112 91.6 118.5 96Q112 99.4 105.5 96Z" fill="#fbf7ee" />
          <circle cx="111.7" cy="95.7" r="2.7" fill="#3b2617" />
          <circle cx="111.7" cy="95.7" r="1.3" fill="#140c08" />
          <circle cx="112.6" cy="94.8" r="0.7" fill="#fff" />
          <path d="M105 96Q112 90.8 119 96.2" fill="none" stroke="#2f2119" strokeWidth={1.5} strokeLinecap="round" />
          <path d="M83 99.3Q88 101 93 99.3M107 99.3Q112 101 117 99.3" fill="none" stroke="#a8765a" strokeWidth={0.8} opacity={0.7} />
          {/* eyelids (blink) */}
          <g className="dalil-lids" opacity={0}>
            <path d="M80.5 96.2Q88 90.4 95.5 96Q88 100 80.5 96.2Z" fill="#c89474" />
            <path d="M104.5 96Q112 90.4 119.5 96.2Q112 100 104.5 96Z" fill="#c89474" />
            <path d="M81.5 96.8Q88 99.2 94.5 96.8M105.5 96.8Q112 99.2 118.5 96.8" fill="none" stroke="#2f2119" strokeWidth={1.5} strokeLinecap="round" />
          </g>
          {/* brows */}
          <path d="M79.5 88.5Q87 83.5 95.5 87" fill="none" stroke="#2b211c" strokeWidth={3} strokeLinecap="round" />
          <path d="M120.5 88.5Q113 83.5 104.5 87" fill="none" stroke="#2b211c" strokeWidth={3} strokeLinecap="round" />
          {/* ghutra front fold over the forehead */}
          <path d="M58 96C57 64 76 46 100 46C124 46 143 64 142 96C138 78 124 67 104 65.5L100 68L96 65.5C76 67 62 78 58 96Z" fill={u("ghutra")} />
          <path d="M62 86C68 74 82 68 96 67L100 69.5L104 67C118 68 132 74 138 86" fill="none" stroke="#6b5a48" strokeWidth={2.5} opacity={0.18} />
          {/* agal */}
          <path d="M55 58Q100 32 145 58" fill="none" stroke="#1a1a1c" strokeWidth={5.5} strokeLinecap="round" />
          <path d="M57 48Q100 22 143 48" fill="none" stroke="#1a1a1c" strokeWidth={5} strokeLinecap="round" />
          <path d="M60 56Q100 33 140 56M62 46Q100 23.5 138 46" fill="none" stroke="#5a5a60" strokeWidth={1} opacity={0.6} />
        </g>
      </g>
      {speaking && <circle className="dalil-glow" cx="100" cy="100" r="95" fill="none" stroke="#f3dfa2" strokeWidth={5} opacity={0.5} />}
      <circle cx="100" cy="100" r="96" fill="none" stroke={u("gold")} strokeWidth={2.4} />
      <circle cx="100" cy="100" r="92.5" fill="none" stroke="#e8c877" strokeWidth={0.6} opacity={0.45} />
    </svg>
  );
}
