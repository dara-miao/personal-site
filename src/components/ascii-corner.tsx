import Image from "next/image";

/** Italianno script "dm" — decorative corner watermark */
export function AsciiCorner() {
  return (
    <Image
      src="/dm-corner.png"
      alt=""
      width={408}
      height={314}
      aria-hidden
      className="ascii-corner"
      unoptimized
    />
  );
}
