import Image from "next/image";

type ProfileCardProps = {
  name: string;
  headline: string;
  photoSrc?: string;
};

export function ProfileCard({ name, headline, photoSrc = "/headshot.png" }: ProfileCardProps) {
  return (
    <div className="mb-14">
      <div className="mb-6 h-[96px] w-[96px] overflow-hidden rounded-[14px] bg-subtle">
        <Image
          src={photoSrc}
          alt={name}
          width={384}
          height={384}
          priority
          className="h-full w-full object-cover object-[center_20%]"
        />
      </div>
      <h1 className="hero-name m-0">{name}</h1>
      <p className="body-text m-0 -mt-1.5 font-medium text-foreground">
        {headline}
      </p>
    </div>
  );
}
