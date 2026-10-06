// Mark: an eight-point star (rub el hizb) cut into a solid square – restrained, works at 16px
export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7" className="fill-accent" />
      <path d="M16 6l2.6 6.4L25 9.4l-3 6.6 3 6.6-6.4-3L16 26l-2.6-6.4L7 22.6 10 16 7 9.4l6.4 3L16 6z" fill="none" stroke="white" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}
