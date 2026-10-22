// The Dubai skyline as one gold line, drawn by hand with roughly true relative heights: a minaret and dome, the Emirates
// Towers, Dubai Frame, the twisted Cayan Tower, Burj Khalifa with its stepped Y-shaped wings and thin spire, and the
// Burj Al Arab sail with its helipad. It draws itself as you scroll.
const P = [
  // minaret and dome
  "M26 150V84h7v66M24 84h11M26 84v-8h7v8M29.5 76v-8M28 66h3",
  "M52 150v-30h54v30M56 120a23 26 0 0 1 46 0M79 94v-8M76 86h6M62 150v-12a5 5 0 0 1 10 0v12M86 150v-12a5 5 0 0 1 10 0v12",
  // generic tower
  "M138 150v-50h20v50M148 100v-12",
  // Emirates Towers: two angular towers with triangular crowns
  "M186 150v-8h82v8",
  "M192 142V104l15-26 15 26v38M207 78v-10M207 78v26M192 104h30",
  "M232 142v-30l13-20 13 20v30M245 92v-8M245 92v20",
  "M276 150v-36l22-9v45",
  // Dubai Frame
  "M320 150v-50h32v50h-6v-44h-20v44zM320 100h32",
  // Cayan Tower: the floors turn 90 degrees over the height
  "M390 150L391.7 147L393.2 144L394.5 141L395.5 138L395.9 135L395.9 132L395.5 129L394.5 126L393.2 123L391.7 120L390 117L388.3 114L386.8 111L385.5 108L384.5 105L384.1 102L384.1 99L384.5 96L385.5 93L386.8 90L388.3 87L390 84h20L408.3 87L406.8 90L405.5 93L404.5 96L404.1 99L404.1 102L404.5 105L405.5 108L406.8 111L408.3 114L410 117L411.7 120L413.2 123L414.5 126L415.5 129L415.9 132L415.9 135L415.5 138L414.5 141L413.2 144L411.7 147L410 150",
  "M393.2 144L413.2 141.1M395.9 135L415.9 134.5M394.5 126L414.5 128.3M390 117L410 120.5M385.5 108L405.5 110.3M384.1 99L404.1 98.5M386.8 90L406.8 87.1",
  // generic towers
  "M432 150v-52h10v-8h10v8h10v52",
  "M466 150v-34a10 10 0 0 1 20 0v34",
  "M498 150v-62l22 12v50M509 94v-10",
  "M532 150v-44h24v44M544 106v-14M538 106v-6h12v6",
  "M566 150v-38l18 7v31",
  // Burj Khalifa: Y-shaped wings, setbacks that spiral and a long thin spire
  "M660 150V124h-7V100h-5V78h-4V56h-2.5V36h-.8V10L640 2L639.3 10V36h-.8V62h-2.5V84h-4V106h-5V132h-7V150",
  "M640 150V40M633 150V108M647 150V108M627 132h26M632 106h16M636 84h8M640.7 20h-1.4M640.5 30h-1",
  // generic towers
  "M678 150v-56h6l6-8 6 8h6v56M690 86v-10",
  "M714 150v-36h14v-10h12v46",
  // Burj Al Arab: the sail with mast, helipad and cantilevered restaurant
  "M780 150V70M780 84C816 92 836 118 834 150M780 104C804 110 820 126 820 150M780 124c14 4 22 14 22 26",
  "M758 104h22M768 106l12 10M796 110h22",
  "M770 150h74",
  // generic towers
  "M868 150v-42l22-8v50",
  "M902 150v-62h8v-6h8v6h8v62M914 82v-12",
  "M944 150v-34l11-12 11 12v34",
  "M978 150v-50h24v50M990 100v-10",
  "M1014 150v-40a10 10 0 0 1 20 0v40",
  "M1046 150v-56h22v56M1046 106h22",
  // water
  "M0 150h1200M270 157h46M512 158h70M880 157h90M1150 157h30",
];
const STARS: [number, number, number][] = [[120, 30, 0], [380, 54, 1.1], [560, 22, 2], [740, 40, .6], [960, 28, 1.6], [1170, 48, 2.4]];

export default function Skyline() {
  return (
    <svg aria-hidden viewBox="0 0 1200 160" preserveAspectRatio="xMidYMax meet" className="skyline block h-auto w-full text-[rgb(201_166_94)]">
      <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity=".75">
        {P.map((d, i) => <path key={i} d={d} pathLength={1} />)}
      </g>
      {STARS.map(([x, y, d]) => <path key={x} className="twinkle" style={{ animationDelay: `${d}s` }} d={`M${x} ${y - 5}l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5z`} fill="currentColor" />)}
    </svg>
  );
}
