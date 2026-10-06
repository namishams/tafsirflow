// Signature line: proudly developed with heart in Dubai, United Arab Emirates (kept in English on purpose)
export default function MadeInDubai({ className = "" }: { className?: string }) {
  return (
    <span dir="ltr" className={`inline-flex flex-wrap items-center justify-center gap-x-1.5 ${className}`}>
      <span>Proudly developed with</span>
      <svg aria-label="love" viewBox="0 0 24 24" className="h-3 w-3 text-[#c8102e]" fill="currentColor"><path d="M12 21s-7.5-4.6-9.8-9.3C.6 8.3 2.7 4.5 6.5 4.5c2.1 0 3.6 1.1 4.5 2.6.9-1.5 2.4-2.6 4.5-2.6 3.8 0 5.9 3.8 4.3 7.2C19.5 16.4 12 21 12 21z" /></svg>
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">in Dubai, United Arab Emirates
      <span aria-hidden className="inline-flex h-2.5 w-4 overflow-hidden rounded-[1px] ring-1 ring-black/10"><span className="w-1 bg-[#ef3340]" /><span className="flex flex-1 flex-col"><span className="flex-1 bg-[#009739]" /><span className="flex-1 bg-white" /><span className="flex-1 bg-black" /></span></span></span>
    </span>
  );
}
