export const GESTURE_CONFIG = {
  /** Drag distance in CSS pixels that represents a full commit gesture. */
  triggerDistance: 220,
  /** Release after this preview progress to complete the reveal. */
  commitProgress: 0.42,
  /** A short fast flick also commits, measured in CSS pixels per millisecond. */
  flickVelocity: 0.75,
  /** Fast flicks must still travel this far to avoid accidental taps. */
  minimumFlickDistance: 80,
  /** Entering this fraction of either horizontal edge commits the reveal. */
  horizontalEdgeZone: 0.16,
  /** Minimum horizontal travel before the edge zone can commit. */
  minimumEdgeTravel: 36,
  /** Ignore tiny movements when determining the reveal direction. */
  directionLockDistance: 12,
  /** Maximum reveal shown while the pointer is still held down. */
  dragPreviewMax: 0.68,
  /** Width of the soft moving edge in UV space. */
  edgeSoftness: 0.055,
  /** Large bow applied to the moving edge. */
  edgeCurve: 0.19,
  /** Small secondary ripple that keeps the edge from feeling mechanical. */
  edgeWave: 0.025,
  /** Foreground movement along the gesture direction. */
  parallax: 0.075,
  completeDuration: 760,
  returnDuration: 380,
  archiveHoldDuration: 3000,
  nameFocusDuration: 1300,
  lineGrowDelay: 480,
  fallDelay: 1850,
  fallDuration: 1100,
} as const;

export const APP_CONFIG = {
  foregroundUrl: `${import.meta.env.BASE_URL}images/foreground.svg`,
  backgroundUrl: `${import.meta.env.BASE_URL}images/a-portrait.jpg`,
  maxDevicePixelRatio: 2,
} as const;

export type ArchiveCategory = "x-video" | "voice" | "recording" | "qa";

export type ArchiveItem = {
  title: string;
  meta: string;
  url?: string;
  poster?: string;
};

export const ARCHIVE_CONTENT: Record<
  ArchiveCategory,
  {
    eyebrow: string;
    title: string;
    description: string;
    items: ArchiveItem[];
  }
> = {
  "x-video": {
    eyebrow: "HEAD / X ARCHIVE",
    title: "X 上的视频",
    description: "卷轴会收录发布在 X 上的片段。替换配置中的链接后即可直接打开。",
    items: [
      { title: "X VIDEO / 01", meta: "等待视频链接" },
      { title: "X VIDEO / 02", meta: "等待视频链接" },
      { title: "X VIDEO / 03", meta: "等待视频链接" },
    ],
  },
  voice: {
    eyebrow: "LIPS / VOICE",
    title: "声音作品",
    description: "声音、配音或音频作品会在这里形成一条可播放的声纹档案。",
    items: [
      { title: "VOICE / 01", meta: "等待音频文件" },
      { title: "VOICE / 02", meta: "等待音频文件" },
      { title: "VOICE / 03", meta: "等待音频文件" },
    ],
  },
  recording: {
    eyebrow: "HAND / LIVE RECORD",
    title: "实录",
    description: "访谈、活动和现场记录。这里预留封面、日期和外部播放地址。",
    items: [
      { title: "RECORD / 01", meta: "等待实录链接" },
      { title: "RECORD / 02", meta: "等待实录链接" },
      { title: "RECORD / 03", meta: "等待实录链接" },
    ],
  },
  qa: {
    eyebrow: "SMOKE / Q&A",
    title: "问答视频",
    description: "沿着烟雾找到问答内容，让信息像烟一样在人物周围浮现。",
    items: [
      { title: "Q&A / 01", meta: "等待问答视频" },
      { title: "Q&A / 02", meta: "等待问答视频" },
      { title: "Q&A / 03", meta: "等待问答视频" },
    ],
  },
};
