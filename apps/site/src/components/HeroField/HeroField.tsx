import { useEffect, useRef } from 'react';
import type { BufferGeometry, Group } from 'three';
import { gsap } from '../../lib/gsap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

/* Smaller first: the opening model is fetched before anything shows and the second streams in behind
   it while the first is on screen, so nothing waits on the pair.

   The fit is per-model because a single figure cannot serve both. It caps how much of the frame the
   model may fill, but only along whichever axis binds first — which is width for both of these. The
   spaceship is a flat saucer and uses 9% of the frame's height at that width; the tower is close to
   cubic and uses 27%, so at an equal setting it reads three times the object. The number is what
   evens out how large they appear, not how large they measure. */
const MODELS = [
  { url: '/models/spaceship.glb', fit: 0.92 },
  { url: '/models/stone-tower.glb', fit: 0.75 },
];

const HOLD_SECONDS = 12;

/* Seconds per full turn. Driven from elapsed time rather than incremented per frame, so the object
   turns at the same rate on a 60Hz panel as on a 144Hz one. */
const TURN_SECONDS = 24;

/* The lean: a slow sway to either side that never approaches vertical, so the object always reads
   upright and never rolls over. Amplitude is in radians — about 9 degrees each way. */
const LEAN = 0.16;
const LEAN_SECONDS = 13;

/* A fixed downward tilt, so the turntable is seen slightly from above rather than dead level. */
const TILT = 0.2;

const TAU = Math.PI * 2;

/* Only creases sharper than this are drawn. Low enough to keep the structural lines that give the
   object its form, high enough that a flat panel does not show the diagonals of its own triangles. */
const CREASE_ANGLE = 18;

/* How far the fill sits off the ground colour. Enough to read as a surface, not so much that the
   object becomes a solid block competing with the type. */
const FILL_SHADE = 0.26;

/* Radians of spin per pixel dragged. */
const DRAG_SPEED = 0.008;

/* How much of the throw survives each second after release — a flick coasts and settles rather than
   stopping dead under the finger. */
const DRAG_FRICTION = 0.12;

/* Below this the throw is spent and the idle turntable takes the object back. */
const DRAG_FLOOR = 0.0004;

export function HeroField() {
  const reducedMotion = usePrefersReducedMotion();
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let teardown = () => {};
    let cancelled = false;

    /* three is a third of the page's JavaScript and nothing above the fold needs it, so it is
       fetched as its own chunk after the hero has painted rather than ahead of it. The grid and the
       mount point are plain DOM and ship in the main bundle, which is what lets the build sequence
       find them at first paint whether or not this has resolved. */
    void (async () => {
      const [three, { GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
        import('three'),
        import('three/examples/jsm/loaders/GLTFLoader.js'),
        import('three/examples/jsm/libs/meshopt_decoder.module.js'),
      ]);
      if (cancelled) return;

      const {
        Box3,
        BufferAttribute,
        Color,
        DoubleSide,
        EdgesGeometry,
        Group: ThreeGroup,
        LineBasicMaterial,
        LineSegments,
        Matrix4,
        Mesh,
        MeshBasicMaterial,
        PerspectiveCamera,
        Scene,
        Vector3,
        WebGLRenderer,
      } = three;

      /* No WebGL means no object, but the grid stays and the hero is untouched. Creating the context
         throws rather than returning null, and an unguarded throw here would take the whole layer
         down over a decoration. */
      let renderer;
      try {
        renderer = new WebGLRenderer({ alpha: true, antialias: true });
      } catch {
        return;
      }

      const scene = new Scene();
      const camera = new PerspectiveCamera(35, 1, 0.1, 100);
      camera.position.set(0, 0, 2.9);

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mount.appendChild(renderer.domElement);

      /* Read from the tokens rather than hard-coding, so the object stays in the palette. */
      const token = (name: string) =>
        getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      const ink = token('--color-ink');

      /* The fill is a step off the ground rather than a match for it. Painted in the exact ground
         colour the surface is invisible and the object reads as a bare wireframe however well the
         hidden lines are removed — it is the tonal separation that makes it a solid. Nudged toward
         ink rather than a fixed tint so it works on the green ground and the bone one alike. */
      const groundToFill = () =>
        new Color(token('--color-flood') || '#00e87a').lerp(new Color(ink || '#070f0a'), FILL_SHADE);

      const edges = new LineBasicMaterial({ color: ink || '#070f0a' });

      /* A solid copy of the model drawn first and writing depth, so the far side of the object is
         hidden. The polygon offset pushes it back just far enough that the lines on the near surface
         still win the depth test. Double-sided because the models are hollow shells: culling back
         faces would let the camera see through the near wall into the inside. */
      const fill = new MeshBasicMaterial({
        color: groundToFill(),
        side: DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      });

      /* These models are compressed with KHR_mesh_quantization, so positions arrive as normalised
         16-bit integers. Transforming that attribute in place writes the results straight back into
         the integer array, and any vertex the node transform pushes outside the normalised range
         wraps to the far end of it — parts of the model end up on the wrong side of the object.
         Widening to float first is what makes the transform safe. */
      const dequantise = (geometry: BufferGeometry) => {
        const source = geometry.getAttribute('position');
        if (!source.normalized) return;

        const widened = new Float32Array(source.count * 3);
        for (let i = 0; i < source.count; i += 1) {
          widened[i * 3] = source.getX(i);
          widened[i * 3 + 1] = source.getY(i);
          widened[i * 3 + 2] = source.getZ(i);
        }
        geometry.setAttribute('position', new BufferAttribute(widened, 3));
      };

      /* Declared up here because the fit reads it and the first resize runs before anything has
         loaded. */
      let current: Group | null = null;

      /* Scaled to whichever of the two axes runs out first, measured against what the camera can
         actually see at this aspect rather than fixed in world units — a world-space clamp knows
         nothing about the canvas aspect, so a value that sits comfortably in a wide desktop column
         fills the frame edge to edge in a narrow portrait one. The horizontal extent is the diagonal
         of the footprint rather than the width, because the object turns: at 45° it presents both x
         and z at once, and fitting only the width would let it swing past the edges mid-rotation. */
      const fit = () => {
        if (!current) return;
        const { footprint, height, margin } = current.userData as {
          footprint: number;
          height: number;
          margin: number;
        };
        const visibleHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
        const visibleWidth = visibleHeight * camera.aspect;
        current.scale.setScalar(
          Math.min((visibleWidth * margin) / footprint, (visibleHeight * margin) / height),
        );
      };

      const resize = () => {
        const { clientWidth: w, clientHeight: h } = mount;
        if (!w || !h) return;
        /* Letting three set the canvas's CSS size too. Suppressing it leaves the element sized by
           its drawing buffer, which is the box multiplied by the pixel ratio — invisible at dpr 1
           and a canvas two or three times too large, overflowing its box, on a phone. */
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        fit();
      };
      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(mount);

      const pivot = new ThreeGroup();
      pivot.rotation.x = TILT;
      scene.add(pivot);

      const render = () => renderer.render(scene, camera);

      /* Mono mode swaps the ground out from under the object, and the fill is derived from it. */
      const modeWatcher = new MutationObserver(() => {
        fill.color.copy(groundToFill());
        render();
      });
      modeWatcher.observe(document.documentElement, { attributeFilter: ['data-mode'] });

      /* What the hand has added to the idle turntable. The turntable itself stays a pure function of
         elapsed time — the drag is an offset on top, so releasing never snaps the object back. */
      let offset = 0;
      let throwSpeed = 0;
      let dragging = false;
      let lastX = 0;
      let lastMove = 0;

      const spin = (time: number, delta: number) => {
        if (!dragging && throwSpeed) {
          offset += throwSpeed * delta;
          throwSpeed *= DRAG_FRICTION ** (delta / 1000);
          if (Math.abs(throwSpeed) < DRAG_FLOOR) throwSpeed = 0;
        }
        pivot.rotation.y = (time / TURN_SECONDS) * TAU + offset;
        pivot.rotation.z = Math.sin((time / LEAN_SECONDS) * TAU) * LEAN;
        render();
      };

      /* Lenis already drives gsap's ticker, so rendering from it keeps the whole page on one rAF
         loop rather than opening a second one. */
      if (reducedMotion) render();
      else gsap.ticker.add(spin);

      const canvas = renderer.domElement;

      const onPointerDown = (event: PointerEvent) => {
        dragging = true;
        throwSpeed = 0;
        lastX = event.clientX;
        lastMove = event.timeStamp;
        canvas.style.cursor = 'grabbing';
        canvas.setPointerCapture(event.pointerId);
      };

      const onPointerMove = (event: PointerEvent) => {
        if (!dragging) return;
        const dx = event.clientX - lastX;
        /* Guarded against a zero interval, which a coalesced move can produce and which would make
           the release velocity infinite. */
        const dt = Math.max(8, event.timeStamp - lastMove);
        offset += dx * DRAG_SPEED;
        throwSpeed = (dx * DRAG_SPEED) / dt;
        lastX = event.clientX;
        lastMove = event.timeStamp;
        if (reducedMotion) render();
      };

      const onPointerUp = (event: PointerEvent) => {
        if (!dragging) return;
        dragging = false;
        canvas.style.cursor = 'grab';
        /* A throw only counts while the pointer is still moving; a drag that stopped before release
           should let go of the object rather than fling it. */
        if (event.timeStamp - lastMove > 100) throwSpeed = 0;
        if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      };

      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);
      canvas.addEventListener('pointercancel', onPointerUp);
      /* Horizontal drags turn the object, vertical ones are left to the page. Without this a touch
         drag over the field would swallow the scroll and strand the reader in the hero. */
      canvas.style.touchAction = 'pan-y';
      canvas.style.cursor = 'grab';

      const built = new Map<string, Group>();

      const show = (key: string) => {
        const next = built.get(key);
        if (!next || next === current) return;
        if (current) pivot.remove(current);
        current = next;
        pivot.add(next);
        /* Models differ in proportion, so the fit is per-model, not per-resize. */
        fit();
        /* The canvas fades rather than the materials: the occlusion only holds while the fill is
           opaque and depth-sorted against the lines. */
        if (!reducedMotion) {
          gsap.fromTo(
            canvas,
            { opacity: 0 },
            { opacity: 1, duration: 0.6, ease: 'power2.out', overwrite: true },
          );
        }
      };

      const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);

      const load = (model: (typeof MODELS)[number]) =>
        loader.loadAsync(model.url).then((gltf) => {
          if (cancelled) return;

          gltf.scene.updateWorldMatrix(true, true);
          const geometries: BufferGeometry[] = [];
          gltf.scene.traverse((child) => {
            if (!(child instanceof Mesh)) return;
            const geometry: BufferGeometry = child.geometry.clone();
            dequantise(geometry);
            geometry.applyMatrix4(child.matrixWorld);
            geometries.push(geometry);
          });

          const box = new Box3();
          geometries.forEach((geometry) => {
            geometry.computeBoundingBox();
            if (geometry.boundingBox) box.union(geometry.boundingBox);
          });
          const size = box.getSize(new Vector3());
          const centre = box.getCenter(new Vector3());
          /* Only the centring is baked in. The scale stays on the holder because it depends on the
             canvas aspect, which changes with the viewport — baked into the vertices it could not be
             recomputed without rebuilding every geometry. */
          const centreOnOrigin = new Matrix4().makeTranslation(-centre.x, -centre.y, -centre.z);

          const holder = new ThreeGroup();
          geometries.forEach((geometry) => {
            geometry.applyMatrix4(centreOnOrigin);
            holder.add(new Mesh(geometry, fill));
            holder.add(new LineSegments(new EdgesGeometry(geometry, CREASE_ANGLE), edges));
          });
          holder.userData = {
            /* The widest the footprint can ever present as it turns on Y. */
            footprint: Math.hypot(size.x, size.z) || 1,
            height: size.y || 1,
            margin: model.fit,
          };

          built.set(model.url, holder);
          if (!current) show(model.url);
        });

      load(MODELS[0])
        .then(() => load(MODELS[1]))
        .catch(() => {
          /* A failed fetch leaves the grid on its own rather than an error state — the field is
             decorative and must never be load-bearing. */
        });

      let index = 0;
      const cycle = window.setInterval(() => {
        if (built.size < MODELS.length) return;
        index = (index + 1) % MODELS.length;
        show(MODELS[index].url);
      }, HOLD_SECONDS * 1000);

      teardown = () => {
        window.clearInterval(cycle);
        modeWatcher.disconnect();
        gsap.ticker.remove(spin);
        observer.disconnect();
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        canvas.removeEventListener('pointercancel', onPointerUp);
        built.forEach((holder) =>
          holder.traverse((child) => {
            if (child instanceof Mesh || child instanceof LineSegments) child.geometry.dispose();
          }),
        );
        edges.dispose();
        fill.dispose();
        renderer.dispose();
        canvas.remove();
      };
    })();

    return () => {
      cancelled = true;
      teardown();
    };
  }, [reducedMotion]);

  /* Siblings rather than nested: a CSS mask applies to descendants too, so with the canvas inside
     the grid the object dissolved at its own edges along with the graph paper. Only the grid should
     fade. */
  return (
    <div aria-hidden className="relative h-full w-full">
      <div data-grid className="fade-grid absolute inset-0" />
      <div data-object ref={mountRef} className="absolute inset-0" />
    </div>
  );
}
