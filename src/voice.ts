import { requestMotionPermission, subscribeToDeviceTilt } from "./motion";
import { setupRain } from "./rain";
import { setupFluidCursor } from "./fluid";

type VoiceTrack = {
  title: string;
  caption: string;
  src?: string;
};

const VOICE_TRACKS: VoiceTrack[] = Array.from({ length: 10 }, (_, index) => ({
  title: `VOICE NOTE / ${String(index + 1).padStart(2, "0")}`,
  caption: "等待语音标题与音频文件",
}));

export const setupVoiceExperience = () => {
  const app = document.querySelector<HTMLElement>("#app");
  const stage = document.querySelector<HTMLElement>("#voice-stage");
  const figure = document.querySelector<HTMLElement>(".voice-figure");
  const trackList = document.querySelector<HTMLElement>("#voice-track-list");
  const continueButton =
    document.querySelector<HTMLButtonElement>("#voice-continue-button");
  const status = document.querySelector<HTMLElement>("#voice-status");
  const rainBack = document.querySelector<HTMLCanvasElement>("#rain-canvas-back");
  const rainFront = document.querySelector<HTMLCanvasElement>("#rain-canvas-front");
  const smokeBack = document.querySelector<HTMLCanvasElement>("#voice-smoke-back");

  if (
    !app ||
    !stage ||
    !figure ||
    !trackList ||
    !continueButton ||
    !status ||
    !rainBack ||
    !rainFront ||
    !smokeBack
  ) return;

  figure.style.setProperty(
    "--voice-image",
    `url("${import.meta.env.BASE_URL}images/a-voice-original.jpg")`,
  );
  const audio = new Audio();
  let activeButton: HTMLButtonElement | null = null;
  const tilt = { x: 0, y: 0, targetX: 0, targetY: 0 };

  const stopAudio = () => {
    audio.pause();
    audio.currentTime = 0;
    activeButton?.classList.remove("is-playing");
    activeButton = null;
  };

  trackList.replaceChildren(
    ...VOICE_TRACKS.map((track, index) => {
      const item = document.createElement("article");
      item.className = "voice-track";
      item.dataset.position = String(index + 1);

      const copy = document.createElement("div");
      copy.className = "voice-track-copy";
      const title = document.createElement("strong");
      title.textContent = track.title;
      const caption = document.createElement("span");
      caption.textContent = track.caption;
      copy.append(title, caption);

      const button = document.createElement("button");
      button.className = "voice-play";
      button.type = "button";
      button.setAttribute("aria-label", `播放 ${track.title}`);
      button.innerHTML =
        '<i aria-hidden="true"></i><span class="voice-wave" aria-hidden="true"><b></b><b></b><b></b><b></b><b></b></span>';
      button.addEventListener("click", async () => {
        if (!track.src) {
          status.textContent = `${track.title} · 音频待接入`;
          return;
        }

        if (activeButton === button && !audio.paused) {
          audio.pause();
          button.classList.remove("is-playing");
          status.textContent = `${track.title} · 已暂停`;
          return;
        }

        stopAudio();
        activeButton = button;
        button.classList.add("is-playing");
        audio.src = `${import.meta.env.BASE_URL}${track.src}`;
        try {
          await audio.play();
          status.textContent = `${track.title} · 正在播放`;
        } catch {
          button.classList.remove("is-playing");
          activeButton = null;
          status.textContent = `${track.title} · 无法播放`;
        }
      });

      item.append(copy, button);
      return item;
    }),
  );

  audio.addEventListener("ended", () => {
    activeButton?.classList.remove("is-playing");
    activeButton = null;
    status.textContent = "SELECT A VOICE NOTE";
  });

  stage.addEventListener("pointermove", (event) => {
    const x = event.clientX / Math.max(window.innerWidth, 1) - 0.5;
    const y = event.clientY / Math.max(window.innerHeight, 1) - 0.5;
    tilt.targetX = -y * 10;
    tilt.targetY = x * 13;
  });
  stage.addEventListener("pointerleave", () => {
    tilt.targetX = 0;
    tilt.targetY = 0;
  });

  subscribeToDeviceTilt(
    () =>
      app.classList.contains("is-voice-page") &&
      !app.classList.contains("is-third-page"),
    (x, y) => {
      tilt.targetX = x * -8;
      tilt.targetY = y * 10;
    },
  );

  setupRain(
    stage,
    rainBack,
    rainFront,
    () =>
      app.classList.contains("is-voice-page") &&
      !app.classList.contains("is-third-page"),
  );

  setupFluidCursor(
    stage,
    smokeBack,
    () =>
      app.classList.contains("is-voice-page") &&
      !app.classList.contains("is-third-page"),
    "water",
  );

  continueButton.addEventListener("click", async () => {
    await requestMotionPermission();
    stopAudio();
    app.classList.add("is-third-page");
  });

  const render = () => {
    tilt.x += (tilt.targetX - tilt.x) * 0.09;
    tilt.y += (tilt.targetY - tilt.y) * 0.09;
    figure.style.setProperty("--voice-tilt-x", `${tilt.x.toFixed(2)}deg`);
    figure.style.setProperty("--voice-tilt-y", `${tilt.y.toFixed(2)}deg`);
    figure.style.setProperty("--voice-shift-x", `${(-tilt.y * 0.7).toFixed(2)}px`);
    figure.style.setProperty("--voice-shift-y", `${(tilt.x * 0.55).toFixed(2)}px`);
    trackList.style.setProperty("--orbit-x", `${(tilt.y * 0.6).toFixed(2)}px`);
    trackList.style.setProperty("--orbit-y", `${(-tilt.x * 0.5).toFixed(2)}px`);
    stage.style.setProperty("--voice-page-x", `${(tilt.y * 1.35).toFixed(2)}px`);
    stage.style.setProperty("--voice-page-y", `${(-tilt.x * 1.05).toFixed(2)}px`);
    stage.style.setProperty("--voice-grid-x", `${(tilt.y * -2.1).toFixed(2)}px`);
    stage.style.setProperty("--voice-grid-y", `${(tilt.x * 1.8).toFixed(2)}px`);
    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);
};
