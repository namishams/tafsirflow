// The skyline of the Emirates as one gold line: Sheikh Zayed Grand Mosque, Louvre Abu Dhabi, Museum of the Future,
// Burj Khalifa, Dubai Frame, Burj Al Arab, a dhow on the Creek and Jumeirah Mosque. It draws itself as you scroll.
const P = [
  // Sheikh Zayed Grand Mosque
  "M46 150V64h8v86M43 64h14M47 64V54h6v10M50 54v-9",
  "M78 150v-38h144v38",
  "M116 112a34 40 0 0 1 68 0M150 72v-9",
  "M90 113a14 17 0 0 1 28 0M182 113a14 17 0 0 1 28 0",
  "M92 150v-16a7 7 0 0 1 14 0v16M116 150v-16a7 7 0 0 1 14 0v16M170 150v-16a7 7 0 0 1 14 0v16M194 150v-16a7 7 0 0 1 14 0v16",
  "M246 150V64h8v86M243 64h14M247 64V54h6v10M250 54v-9",
  // Louvre Abu Dhabi
  "M296 128a70 20 0 0 1 140 0M300 128h132",
  "M322 128v22M410 128v22M334 150v-12h20v12M362 150v-16h26v16",
  // Museum of the Future
  "M466 150c16-14 84-14 100 0",
  // Burj Khalifa
  "M630 6l1 24h3l1 22h3l2 24h4l2 26h4l3 26h4l2 22M630 6l-1 24h-3l-1 22h-3l-2 24h-4l-2 26h-4l-3 26h-4l-2 22",
  // Dubai Frame
  "M690 150V70h50v80M698 150V78h34v72",
  // Burj Al Arab
  "M800 150V38M800 38c40 22 58 72 56 112M800 62h40M800 72h-14",
  // dhow
  "M898 140h58l-8 8h-42zM924 140v-36M924 106c14 6 22 18 24 30h-24",
  // Jumeirah Mosque
  "M1030 150v-32h92v32M1050 118a26 30 0 0 1 52 0M1076 88v-9M1060 150v-14a6 6 0 0 1 12 0v14M1080 150v-14a6 6 0 0 1 12 0v14",
  "M1016 150V82h8v68M1013 82h14M1017 82v-9h6v9M1020 73v-8",
  "M1132 150V82h8v68M1129 82h14M1133 82v-9h6v9M1136 73v-8",
  // water
  "M0 150h1200M270 157h46M512 158h70M880 157h90M1150 157h30",
];
const STARS: [number, number, number][] = [[120, 30, 0], [380, 54, 1.1], [560, 22, 2], [740, 40, .6], [960, 28, 1.6], [1170, 48, 2.4]];

export default function Skyline() {
  return (
    <svg aria-hidden viewBox="0 0 1200 160" preserveAspectRatio="xMidYMax meet" className="skyline block h-auto w-full text-[rgb(201_166_94)]">
      <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity=".75">
        {P.map((d, i) => <path key={i} d={d} pathLength={1} />)}
        <ellipse cx="516" cy="98" rx="40" ry="46" pathLength={1} />
        <ellipse cx="522" cy="96" rx="20" ry="30" pathLength={1} />
        <path d="M488 84c8-6 16-8 22-6M486 104c6 4 10 10 12 18M538 70c8 6 14 14 16 24M544 118c-4 8-10 12-18 14" strokeWidth=".9" pathLength={1} />
        <path d="M322 122h88" className="dots" strokeWidth="1.6" />
      </g>
      {STARS.map(([x, y, d]) => <path key={x} className="twinkle" style={{ animationDelay: `${d}s` }} d={`M${x} ${y - 5}l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5z`} fill="currentColor" />)}
    </svg>
  );
}
