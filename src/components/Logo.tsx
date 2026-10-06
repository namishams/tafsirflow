// Mark: the Arabic word "Qurʾān" (قرآن) in Amiri on a solid square – the same artwork as the favicon and app icon
export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <span aria-hidden="true" className="inline-grid shrink-0 place-items-center bg-accent font-arabic font-bold leading-none text-white" style={{ width: size, height: size, borderRadius: size * 0.22, fontSize: size * 0.44, paddingBottom: size * 0.1 }} dir="rtl">
      قرآن
    </span>
  );
}
