type Caption = {
  start: number;
  end: number;
  primary: string;
  secondary: string;
};

type MusicTrack = {
  src: string;
  captions: Caption[];
};

const TRACKS: MusicTrack[] = [
  {
    src: "audio/prelude-soft.m4a",
    captions: [],
  },
  {
    src: "audio/so-high-soft.m4a",
    captions: [],
  },
];

const TARGET_VOLUME = 0.12;
const DUCKED_VOLUME = 0.006;
const FADE_DURATION = 900;

export const setupMusicExperience = () => {
  const toggle = document.querySelector<HTMLButtonElement>("#music-toggle");
  const subtitles = document.querySelector<HTMLElement>("#music-subtitles");
  const primary = document.querySelector<HTMLElement>("#music-subtitle-primary");
  const secondary = document.querySelector<HTMLElement>("#music-subtitle-secondary");

  if (!toggle || !subtitles || !primary || !secondary) return;

  const audio = TRACKS.map((track) => {
    const element = new Audio(`${import.meta.env.BASE_URL}${track.src}`);
    element.preload = "metadata";
    element.volume = 0;
    return element;
  });

  let activeIndex = 0;
  let started = false;
  let muted = false;
  let fadeFrame = 0;
  let activeCaption = -1;
  let resetTimer: number | null = null;
  let ducked = false;

  const currentAudio = () => audio[activeIndex];
  const playbackVolume = () => (ducked ? DUCKED_VOLUME : TARGET_VOLUME);

  const updateToggle = () => {
    toggle.classList.toggle("is-muted", muted);
    toggle.setAttribute("aria-pressed", String(!muted));
    toggle.setAttribute("aria-label", muted ? "播放背景音乐" : "暂停背景音乐");
  };

  const fade = (
    element: HTMLAudioElement,
    from: number,
    to: number,
    pauseWhenDone = false,
    onComplete?: () => void,
  ) => {
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / FADE_DURATION, 1);
      element.volume = from + (to - from) * progress;
      if (progress < 1) {
        fadeFrame = requestAnimationFrame(step);
      } else {
        if (pauseWhenDone) element.pause();
        onComplete?.();
      }
    };
    fadeFrame = requestAnimationFrame(step);
  };

  const showCaption = () => {
    const current = currentAudio();
    const captions = TRACKS[activeIndex].captions;
    const index = captions.findIndex(
      (caption) => current.currentTime >= caption.start && current.currentTime < caption.end,
    );
    if (index === activeCaption) return;
    activeCaption = index;
    const caption = captions[index];
    subtitles.hidden = !caption;
    primary.textContent = caption?.primary ?? "";
    secondary.textContent = caption?.secondary ?? "";
  };

  const playActive = async (fadeIn = true) => {
    if (muted) return;
    const current = currentAudio();
    current.volume = fadeIn ? 0 : playbackVolume();
    try {
      await current.play();
      started = true;
      if (fadeIn) fade(current, 0, playbackVolume());
    } catch {
      started = false;
    }
  };

  const advance = () => {
    activeIndex = (activeIndex + 1) % audio.length;
    activeCaption = -1;
    currentAudio().currentTime = 0;
    void playActive(true);
  };

  audio.forEach((element) => {
    element.addEventListener("ended", advance);
  });

  const start = () => {
    if (started || muted) return;
    void playActive(true);
  };

  const unlock = () => start();
  window.addEventListener("pointerdown", unlock, { once: true, passive: true });
  window.addEventListener("keydown", unlock, { once: true });

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    muted = !muted;
    cancelAnimationFrame(fadeFrame);
    updateToggle();
    if (muted) {
      const current = currentAudio();
      fade(current, current.volume, 0, true);
      subtitles.hidden = true;
      return;
    }
    started = false;
    start();
  });

  window.addEventListener("fanpage:reset-music", () => {
    if (resetTimer !== null) window.clearTimeout(resetTimer);
    cancelAnimationFrame(fadeFrame);
    const current = currentAudio();
    fade(current, current.volume, 0, true);
    resetTimer = window.setTimeout(() => {
      audio.forEach((element) => {
        element.pause();
        element.currentTime = 0;
        element.volume = 0;
      });
      activeIndex = 0;
      activeCaption = -1;
      started = false;
      if (!muted) void playActive(true);
    }, FADE_DURATION);
  });

  window.addEventListener("fanpage:media-audio", (event) => {
    const detail = (event as CustomEvent<{ active?: boolean }>).detail;
    ducked = Boolean(detail?.active);
    if (!started || muted) return;
    cancelAnimationFrame(fadeFrame);
    const current = currentAudio();
    fade(current, current.volume, playbackVolume());
  });

  const render = () => {
    showCaption();
    requestAnimationFrame(render);
  };

  updateToggle();
  requestAnimationFrame(render);
};
