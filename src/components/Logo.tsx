// Mark: the gold app icon (the same artwork as the favicon and the App Store icon)
export default function Logo({ size = 32 }: { size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/icon-192.png" width={size} height={size} alt="" aria-hidden="true" className="shrink-0" style={{ borderRadius: size * 0.22 }} />;
}
