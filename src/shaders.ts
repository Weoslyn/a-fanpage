export const fullscreenVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const compositeFragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D uForeground;
  uniform sampler2D uBackground;
  uniform vec2 uViewport;
  uniform vec2 uForegroundSize;
  uniform vec2 uBackgroundSize;
  uniform vec2 uDirection;
  uniform float uEdgePosition;
  uniform float uEdgeCrossPosition;
  uniform float uEdgeSoftness;
  uniform float uEdgeCurve;
  uniform float uEdgeWave;
  uniform float uParallax;
  uniform float uComplete;
  uniform float uPortraitScale;

  varying vec2 vUv;

  vec2 coverUv(vec2 uv, vec2 imageSize) {
    float screenAspect = uViewport.x / uViewport.y;
    float imageAspect = imageSize.x / imageSize.y;
    vec2 scale = vec2(1.0);

    if (screenAspect > imageAspect) {
      scale.y = imageAspect / screenAspect;
    } else {
      scale.x = screenAspect / imageAspect;
    }

    return (uv - 0.5) * scale + 0.5;
  }

  vec4 portraitLayer(vec2 uv) {
    float squareSize = min(uViewport.x, uViewport.y) * 0.72 * uPortraitScale;
    vec2 squarePixels = vec2(squareSize);
    vec2 local = (uv - 0.5) * uViewport / squarePixels + 0.5;
    float inside =
      step(0.0, local.x) * step(local.x, 1.0) *
      step(0.0, local.y) * step(local.y, 1.0);
    vec3 portrait = texture2D(uBackground, local).rgb;
    vec3 charcoal = vec3(0.105, 0.11, 0.108);
    return vec4(mix(charcoal, portrait, inside), 1.0);
  }

  void main() {
    vec2 centered = vUv - 0.5;
    vec2 direction = normalize(uDirection);
    float extent = 0.5 * (abs(direction.x) + abs(direction.y));
    float projection = dot(centered, direction);
    vec2 tangent = vec2(-direction.y, direction.x);
    float crossPosition =
      (dot(centered, tangent) - uEdgeCrossPosition) / max(extent, 0.001);
    float curvePosition = clamp(crossPosition, -1.0, 1.0);
    float trailingCurve = curvePosition * curvePosition * uEdgeCurve;
    float trailingWave = abs(sin(curvePosition * 3.14159265)) * uEdgeWave;
    float curvedEdge = uEdgePosition - trailingCurve - trailingWave;
    float revealMask = 1.0 - smoothstep(
      curvedEdge - uEdgeSoftness,
      curvedEdge + uEdgeSoftness,
      projection
    );

    float revealProgress = clamp(
      (uEdgePosition + extent + uEdgeSoftness) /
      (2.0 * (extent + uEdgeSoftness)),
      0.0,
      1.0
    );
    vec2 foregroundUv = vUv - direction * revealProgress * uParallax;
    vec4 foreground = texture2D(
      uForeground,
      coverUv(foregroundUv, uForegroundSize)
    );
    vec4 background = portraitLayer(
      vUv + direction * (1.0 - revealProgress) * uParallax * 0.18
    );

    float edgeShadow = smoothstep(
      uEdgeSoftness * 2.6,
      0.0,
      abs(projection - curvedEdge)
    ) * (1.0 - revealMask) * 0.36;
    vec3 color = mix(foreground.rgb, background.rgb, revealMask);
    color *= 1.0 - edgeShadow;

    gl_FragColor = mix(vec4(color, 1.0), portraitLayer(vUv), uComplete);
  }
`;
