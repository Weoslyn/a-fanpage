type PermissionAwareDeviceOrientationEvent = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

type PermissionAwareDeviceMotionEvent = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

export const requestMotionPermission = async () => {
  const requests: Array<Promise<"granted" | "denied">> = [];

  if (typeof DeviceOrientationEvent !== "undefined") {
    const orientationEvent =
      DeviceOrientationEvent as PermissionAwareDeviceOrientationEvent;
    if (typeof orientationEvent.requestPermission === "function") {
      requests.push(orientationEvent.requestPermission());
    }
  }

  if (typeof DeviceMotionEvent !== "undefined") {
    const motionEvent = DeviceMotionEvent as PermissionAwareDeviceMotionEvent;
    if (typeof motionEvent.requestPermission === "function") {
      requests.push(motionEvent.requestPermission());
    }
  }

  if (requests.length === 0) return true;

  try {
    const results = await Promise.all(requests);
    return results.every((result) => result === "granted");
  } catch {
    return false;
  }
};

export const subscribeToDeviceTilt = (
  isActive: () => boolean,
  onTilt: (x: number, y: number) => void,
) => {
  let baselineBeta: number | null = null;
  let baselineGamma: number | null = null;
  let lastOrientationTime = 0;

  const handleOrientation = (event: DeviceOrientationEvent) => {
    if (!isActive() || event.beta === null || event.gamma === null) return;
    baselineBeta ??= event.beta;
    baselineGamma ??= event.gamma;
    const x = Math.max(-1, Math.min(1, (event.beta - baselineBeta) / 24));
    const y = Math.max(-1, Math.min(1, (event.gamma - baselineGamma) / 24));
    lastOrientationTime = Date.now();
    onTilt(x, y);
  };

  const handleMotion = (event: DeviceMotionEvent) => {
    if (!isActive() || Date.now() - lastOrientationTime < 250) return;
    const gravity = event.accelerationIncludingGravity;
    if (!gravity || gravity.x === null || gravity.y === null) return;
    const x = Math.max(-1, Math.min(1, gravity.y / 7));
    const y = Math.max(-1, Math.min(1, gravity.x / 7));
    onTilt(x, y);
  };

  window.addEventListener("deviceorientation", handleOrientation, true);
  window.addEventListener("devicemotion", handleMotion, true);
  return () => {
    window.removeEventListener("deviceorientation", handleOrientation, true);
    window.removeEventListener("devicemotion", handleMotion, true);
  };
};
