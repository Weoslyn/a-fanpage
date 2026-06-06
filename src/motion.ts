type PermissionAwareDeviceOrientationEvent = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

export const requestMotionPermission = async () => {
  if (typeof DeviceOrientationEvent === "undefined") return false;
  const orientationEvent =
    DeviceOrientationEvent as PermissionAwareDeviceOrientationEvent;

  if (typeof orientationEvent.requestPermission !== "function") return true;

  try {
    return (await orientationEvent.requestPermission()) === "granted";
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

  const handleOrientation = (event: DeviceOrientationEvent) => {
    if (!isActive() || event.beta === null || event.gamma === null) return;
    baselineBeta ??= event.beta;
    baselineGamma ??= event.gamma;
    const x = Math.max(-1, Math.min(1, (event.beta - baselineBeta) / 24));
    const y = Math.max(-1, Math.min(1, (event.gamma - baselineGamma) / 24));
    onTilt(x, y);
  };

  window.addEventListener("deviceorientation", handleOrientation, true);
  return () => window.removeEventListener("deviceorientation", handleOrientation, true);
};
