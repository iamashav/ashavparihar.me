import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Vector2 } from 'three';
import type { CanvasTexture } from 'three';
import { createTextTexture, waitForDisplayFont } from './textTexture';

const HEADLINE = 'ASHAV PARIHAR';

// Bypasses the projection matrix entirely: a 2x2 plane written straight to clip space is exactly
// the viewport, at any size, with no resize maths.
const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform sampler2D uTexture;
  uniform vec2 uMouse;
  uniform float uAspect;
  uniform float uRadius;
  uniform float uStrength;
  uniform float uAberration;

  varying vec2 vUv;

  void main() {
    vec2 mouse = uMouse * 0.5 + 0.5;

    // Aspect-correct the offset so the lens stays circular on wide viewports.
    vec2 toMouse = vUv - mouse;
    vec2 corrected = vec2(toMouse.x * uAspect, toMouse.y);
    float dist = length(corrected);

    // 1 at the centre of the lens, 0 at its rim.
    float lens = 1.0 - smoothstep(0.0, uRadius, dist);
    float falloff = lens * lens;

    vec2 dir = dist > 0.0001 ? normalize(toMouse) : vec2(0.0);
    vec2 displaced = vUv - dir * falloff * uStrength;

    float split = falloff * uAberration;

    // The headline is white on transparent, so per-channel coverage is the alpha channel sampled
    // at three offsets — that is what produces the RGB fringing rather than tinting a flat fill.
    float r = texture2D(uTexture, displaced + dir * split).a;
    float g = texture2D(uTexture, displaced).a;
    float b = texture2D(uTexture, displaced - dir * split).a;

    float alpha = max(max(r, g), b);
    if (alpha < 0.001) discard;

    gl_FragColor = vec4(r, g, b, alpha);
  }
`;

interface Uniforms {
  // three types the prop as an indexable record; the named fields below keep their real types.
  [key: string]: { value: unknown };
  uTexture: { value: CanvasTexture };
  uMouse: { value: Vector2 };
  uAspect: { value: number };
  uRadius: { value: number };
  uStrength: { value: number };
  uAberration: { value: number };
}

interface LensPlaneProps {
  texture: CanvasTexture;
  aspect: number;
}

function LensPlane({ texture, aspect }: LensPlaneProps) {
  const target = useRef(new Vector2(0, 0));
  const current = useRef(new Vector2(0, 0));
  const { gl } = useThree();

  // Built once and mutated in place: replacing the uniforms object would recompile the shader
  // on every pointer move.
  const uniformsRef = useRef<Uniforms | null>(null);
  if (!uniformsRef.current) {
    uniformsRef.current = {
      uTexture: { value: texture },
      uMouse: { value: new Vector2(0, 0) },
      uAspect: { value: aspect },
      // Tuned so the lens magnifies and fringes rather than shredding the letterforms:
      // strength past ~0.1 folds the UVs back on themselves and the type stops reading.
      uRadius: { value: 0.26 },
      uStrength: { value: 0.06 },
      uAberration: { value: 0.012 },
    };
  }
  const uniforms = uniformsRef.current;

  useEffect(() => {
    uniforms.uTexture.value = texture;
    uniforms.uAspect.value = aspect;
  }, [texture, aspect, uniforms]);

  useEffect(() => {
    const element = gl.domElement;
    const onMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      target.current.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1),
      );
    };
    // Listening on the window keeps the lens tracking while the pointer is over the overlay UI.
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [gl]);

  useFrame((_, delta) => {
    // Frame-rate independent easing, so the lag feels the same at 60 and 144Hz.
    const ease = 1 - Math.pow(0.0015, delta);
    current.current.lerp(target.current, ease);
    uniforms.uMouse.value.copy(current.current);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

export default function HeroCanvas() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [texture, setTexture] = useState<CanvasTexture | null>(null);
  const [aspect, setAspect] = useState(1);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    let cancelled = false;
    let currentTexture: CanvasTexture | null = null;
    let frame = 0;

    const build = () => {
      const rect = wrap.getBoundingClientRect();
      const width = Math.max(rect.width, 1);
      const height = Math.max(rect.height, 1);
      const next = createTextTexture({
        text: HEADLINE,
        width,
        height,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      });
      if (!next || cancelled) return;

      // The outgoing texture holds a GPU allocation; drop it before swapping in the new one.
      currentTexture?.dispose();
      currentTexture = next;
      setTexture(next);
      setAspect(width / height);
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(build);
    };

    waitForDisplayFont().then(() => {
      if (!cancelled) build();
    });

    const observer = new ResizeObserver(schedule);
    observer.observe(wrap);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      currentTexture?.dispose();
    };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0 z-0" aria-hidden="true">
      {texture && (
        <Canvas
          dpr={[1, 2]}
          gl={{ antialias: false, alpha: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <LensPlane texture={texture} aspect={aspect} />
        </Canvas>
      )}
    </div>
  );
}
