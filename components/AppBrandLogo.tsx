import Image from "next/image";

/** AIA mark for app shell headers; SVG uses unoptimized Image (Next.js). */
export function AppBrandLogo() {
  return (
    <Image
      src="/aia-logo-red.svg"
      alt=""
      width={32}
      height={32}
      className="h-8 w-8 shrink-0 object-contain contrast-[1.12] saturate-[1.08] drop-shadow-[0_0_0.75px_rgba(142,8,40,0.85)]"
      unoptimized
    />
  );
}
