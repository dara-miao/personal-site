import Image from "next/image";

export function ProfileScriptMark() {
  return (
    <div className="profile-script-mark" aria-hidden>
      <Image
        src="/dara-miao-script.png"
        alt=""
        width={658}
        height={121}
        priority
        unoptimized
        className="profile-script-mark__image"
        aria-hidden
        draggable={false}
      />
    </div>
  );
}
