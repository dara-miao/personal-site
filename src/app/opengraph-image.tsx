import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Dara Miao";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const dmMarkData = await readFile(
  join(process.cwd(), "public/dm-corner.png"),
  "base64",
);
const scriptData = await readFile(
  join(process.cwd(), "public/dara-miao-script.png"),
  "base64",
);
const dmMarkSrc = `data:image/png;base64,${dmMarkData}`;
const scriptSrc = `data:image/png;base64,${scriptData}`;

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(165deg, #fdfdfb 0%, #f7f4ef 55%, #efe8dc 100%)",
        }}
      >
        <img
          src={dmMarkSrc}
          alt=""
          width={420}
          height={323}
          style={{ opacity: 0.88 }}
        />
        <img
          src={scriptSrc}
          alt=""
          width={480}
          height={88}
          style={{ marginTop: 36, opacity: 0.82 }}
        />
      </div>
    ),
    { ...size },
  );
}
