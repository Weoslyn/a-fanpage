type RainDrop = {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  width: number;
};

const createDrops = (count: number, width: number, height: number, front: boolean) =>
  Array.from({ length: count }, (): RainDrop => ({
    x: Math.random() * width,
    y: Math.random() * height,
    length: (front ? 20 : 10) + Math.random() * (front ? 34 : 24),
    speed: (front ? 8 : 3.5) + Math.random() * (front ? 7 : 4),
    opacity: (front ? 0.2 : 0.08) + Math.random() * (front ? 0.26 : 0.15),
    width: front ? 0.8 + Math.random() * 0.8 : 0.5 + Math.random() * 0.5,
  }));

export const setupRain = (
  stage: HTMLElement,
  backCanvas: HTMLCanvasElement,
  frontCanvas: HTMLCanvasElement,
  isVisible: () => boolean,
) => {
  const backContext = backCanvas.getContext("2d");
  const frontContext = frontCanvas.getContext("2d");
  if (!backContext || !frontContext) return;

  let width = 1;
  let height = 1;
  let backDrops: RainDrop[] = [];
  let frontDrops: RainDrop[] = [];
  const isMobile = window.matchMedia("(max-width: 640px), (pointer: coarse)").matches;

  const resize = () => {
    width = Math.max(stage.clientWidth, 1);
    height = Math.max(stage.clientHeight, 1);
    const dpr = Math.min(window.devicePixelRatio, isMobile ? 1 : 1.35);

    [backCanvas, frontCanvas].forEach((canvas) => {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    });
    backContext.setTransform(dpr, 0, 0, dpr, 0, 0);
    frontContext.setTransform(dpr, 0, 0, dpr, 0, 0);
    backDrops = createDrops(isMobile ? 42 : 72, width, height, false);
    frontDrops = createDrops(isMobile ? 26 : 48, width, height, true);
  };

  const drawLayer = (
    context: CanvasRenderingContext2D,
    drops: RainDrop[],
    front: boolean,
  ) => {
    context.clearRect(0, 0, width, height);
    context.lineCap = "round";

    drops.forEach((drop) => {
      drop.y += drop.speed;
      drop.x -= drop.speed * 0.16;
      if (drop.y - drop.length > height || drop.x < -drop.length) {
        drop.x = Math.random() * (width + 80);
        drop.y = -drop.length - Math.random() * height * 0.25;
      }

      const gradient = context.createLinearGradient(
        drop.x,
        drop.y - drop.length,
        drop.x - drop.length * 0.16,
        drop.y,
      );
      gradient.addColorStop(0, "rgba(245, 248, 248, 0)");
      gradient.addColorStop(
        0.65,
        `rgba(226, 232, 232, ${drop.opacity * (front ? 0.78 : 0.55)})`,
      );
      gradient.addColorStop(
        1,
        `rgba(66, 76, 76, ${drop.opacity * 1.08})`,
      );
      context.strokeStyle = gradient;
      context.lineWidth = drop.width;
      context.beginPath();
      context.moveTo(drop.x, drop.y - drop.length);
      context.lineTo(drop.x - drop.length * 0.16, drop.y);
      context.stroke();
    });
  };

  const render = () => {
    if (isVisible()) {
      drawLayer(backContext, backDrops, false);
      drawLayer(frontContext, frontDrops, true);
    } else {
      backContext.clearRect(0, 0, width, height);
      frontContext.clearRect(0, 0, width, height);
    }
    requestAnimationFrame(render);
  };

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(render);
};
