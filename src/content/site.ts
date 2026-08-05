export const collageCanvas = {
  width: 979,
  height: 729,
} as const;

export const site = {
  name: "Dara Miao",
  role: "Business and AI at USC Marshall",
  email: "daramiao19@gmail.com",
  social: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/dara-miao/" },
    { label: "Instagram", href: "https://www.instagram.com/dara.miao/" },
    { label: "X", href: "https://x.com/DaraMiaoX" },
  ],
  photos: [
    {
      src: "/photos/ted-talk.png",
      alt: "Speaking on the TED stage",
      width: 800,
      height: 1024,
      layout: { x: 24, y: 23, w: 229, h: 279 },
      objectPosition: "49.9% 51.8%",
    },
    {
      src: "/photos/golf-swing.png",
      alt: "Golf swing on the course",
      width: 1024,
      height: 682,
      layout: { x: 274, y: 23, w: 338, h: 224 },
      objectPosition: "49.6% 49.5%",
    },
    {
      src: "/photos/founders-dinner.png",
      alt: "USC Founders Table dinner",
      width: 1024,
      height: 621,
      layout: { x: 634, y: 22, w: 368, h: 225 },
      objectPosition: "49.3% 49.4%",
    },
    {
      src: "/photos/troylabs-checks.png",
      alt: "TroyLabs Launch winner checks",
      width: 1024,
      height: 819,
      layout: { x: 387, y: 263, w: 293, h: 234 },
      objectPosition: "49.4% 49.5%",
    },
    {
      src: "/photos/rocket-frame-outdoors.png",
      alt: "Working on a rocket frame outdoors",
      width: 1024,
      height: 767,
      layout: { x: 699, y: 264, w: 304, h: 234 },
      objectPosition: "53.6% 48.0%",
    },
    {
      src: "/photos/hiking-group.png",
      alt: "Hiking with friends in the mountains",
      width: 1024,
      height: 768,
      layout: { x: 24, y: 320, w: 343, h: 224 },
      objectPosition: "49.7% 50.7%",
    },
    {
      src: "/photos/rocket-launch.png",
      alt: "Rocket launch at the desert range",
      width: 1024,
      height: 576,
      layout: { x: 531, y: 512, w: 471, h: 238 },
      objectPosition: "49.9% 50.0%",
    },
    {
      src: "/photos/launch-check-flowers.png",
      alt: "Launch check presentation with flowers",
      width: 1024,
      height: 819,
      layout: { x: 24, y: 561, w: 281, h: 190 },
      objectPosition: "50.0% 55.9%",
    },
    {
      src: "/photos/agt-audience.png",
      alt: "In the America's Got Talent audience",
      width: 768,
      height: 1024,
      layout: { x: 324, y: 561, w: 188, h: 190 },
      objectPosition: "44.7% 55.9%",
    },
  ],
  paragraphs: [
    [
      { type: "text" as const, value: "I do GTM at " },
      {
        type: "link" as const,
        href: "https://www.mindfort.ai/",
        label: "MindFort AI (YC X25)",
      },
      {
        type: "text" as const,
        value:
          ", where AI agents find and patch vulnerabilities before attackers do. Backed by Y Combinator and Soma Capital.",
      },
    ],
    [
      {
        type: "text" as const,
        value: "During the school year, I am a product manager at ",
      },
      { type: "link" as const, href: "https://troylabs.vc/", label: "TroyLabs" },
      {
        type: "text" as const,
        value: ", USC's startup accelerator, where I PM'd for portcos like ",
      },
      { type: "link" as const, href: "https://www.withnara.com/", label: "Nara" },
      { type: "text" as const, value: " and " },
      { type: "link" as const, href: "https://revisent.com/", label: "Revisent" },
      { type: "text" as const, value: ", winning " },
      {
        type: "link" as const,
        href: "https://www.linkedin.com/posts/dara-miao_startuplaunch-startupaccelerator-win-activity-7412530621924929536-3ROi",
        label: "Launch '25",
      },
      {
        type: "text" as const,
        value: " and driving 3 pilot deployments and a 35% accuracy improvement.",
      },
    ],
    [
      { type: "text" as const, value: "I'm exploring VC as a summer fellow at " },
      {
        type: "link" as const,
        href: "https://www.dormroomfund.com/",
        label: "Dorm Room Fund",
      },
      { type: "text" as const, value: "; sending rockets to space through " },
      {
        type: "link" as const,
        href: "https://www.uscrpl.com/",
        label: "USC Rocket Propulsion Laboratory",
      },
      { type: "text" as const, value: "; and running " },
      {
        type: "link" as const,
        href: "https://engage.usc.edu/clubgolf/home/",
        label: "USC Club Golf",
      },
      { type: "text" as const, value: " as VP." },
    ],
  ],
} as const;

export type WorkPart = (typeof site.paragraphs)[number][number];

const REVEAL_ROW_TOP = 100;
const REVEAL_ROW_MIDDLE = 450;
const REVEAL_STAGGER_STEP_MS = 70;

function getPhotoRevealRow(y: number): number {
  if (y < REVEAL_ROW_TOP) return 0;
  if (y < REVEAL_ROW_MIDDLE) return 1;
  return 2;
}

function computePhotoRevealStaggerMs(
  photos: ReadonlyArray<{ layout: { x: number; y: number } }>,
  stepMs: number,
): readonly number[] {
  const indexed = photos.map((photo, index) => ({ index, layout: photo.layout }));
  const sorted = [...indexed].sort((a, b) => {
    const rowDiff = getPhotoRevealRow(b.layout.y) - getPhotoRevealRow(a.layout.y);
    if (rowDiff !== 0) return rowDiff;
    return a.layout.x - b.layout.x;
  });

  const delays = new Array<number>(photos.length);
  sorted.forEach(({ index }, order) => {
    delays[index] = order * stepMs;
  });
  return delays;
}

/** Stagger delay (ms) per photo index, ordered bottom→top then left→right. */
export const photoRevealStaggerMs = computePhotoRevealStaggerMs(
  site.photos,
  REVEAL_STAGGER_STEP_MS,
);
