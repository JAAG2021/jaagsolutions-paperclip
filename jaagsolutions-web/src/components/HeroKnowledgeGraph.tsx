import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Reemplaza el diagrama de lista (`HeroFlowVisual`) por una esfera de red en
 * WebGL real — inspirada en el grafo animado de graphify.net, pero con los
 * automatismos reales de JAAGSOLUTIONS como nodos, no conceptos genéricos de
 * "código/docs/papers". Cada nodo grande es un caso de uso de `UseCasesSection`
 * (mismo color); los nodos chicos son piezas del stack o del flujo que ya
 * aparecen en el resto del sitio (`TECH_BADGES`, los flujos de Cobranza).
 *
 * Interactivo: pasar el mouse sobre un nodo lo resalta y muestra su nombre;
 * clickearlo baja a la sección relacionada (casos de uso o servicios).
 */

type AutomationNode = { label: string; color: number };

const AUTOMATION_NODES: AutomationNode[] = [
  { label: "Captación de Leads", color: 0x2563eb },
  { label: "Cotización a Cierre", color: 0x059669 },
  { label: "Cobranza Automatizada", color: 0xea580c },
  { label: "Mesa de Ayuda", color: 0x9333ea },
];

const TOOL_LABELS = [
  "Make",
  "n8n",
  "OpenAI",
  "Google Workspace",
  "Zapier",
  "WhatsApp API",
  "CRM",
  "Slack",
  "Stripe",
];

/** Mismo ritmo que el resto de los ciclos automáticos del sitio. */
const CYCLE_MS = 1800;
const SPHERE_RADIUS = 2.1;

const GRAPH_ALT =
  "Grafo 3D interactivo de automatizaciones: cuatro nodos principales (Captación de Leads, Cotización a Cierre, Cobranza Automatizada, Mesa de Ayuda) conectados a las herramientas del stack. Pasar el mouse sobre un nodo muestra su nombre; al hacer clic baja a la sección relacionada.";

/** Distribuye N puntos de forma pareja sobre una esfera (espiral de Fibonacci) — determinista, sin aleatoriedad, para que el grafo no "salte" entre recargas. */
function fibonacciSphere(samples: number, radius: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const offset = 2 / samples;
  const increment = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < samples; i++) {
    const y = i * offset - 1 + offset / 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const phi = i * increment;
    points.push(new THREE.Vector3(Math.cos(phi) * r * radius, y * radius, Math.sin(phi) * r * radius));
  }
  return points;
}

function nearestIndices(from: THREE.Vector3, candidates: THREE.Vector3[], count: number): number[] {
  return candidates
    .map((p, i) => ({ i, d: p.distanceTo(from) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, count)
    .map((e) => e.i);
}

type GraphNode = {
  label: string;
  mesh: THREE.Mesh;
  mat: THREE.MeshStandardMaterial;
  baseIntensity: number;
  baseScale: number;
  isMain: boolean;
};

type Props = { className?: string };

export default function HeroKnowledgeGraph({ className = "" }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    const label = labelRef.current;
    if (!mount || !label) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return; // Sin WebGL disponible: se deja el contenedor vacío, App.tsx no depende de este visual para funcionar.
    }
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    // FOV/distancia dan ~22% de margen alrededor de la esfera dentro del
    // encuadre cuadrado, para que no toque los bordes ni quede descuadrada.
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 7.4);
    camera.lookAt(0, 0, 0);

    const group = new THREE.Group();
    scene.add(group);

    // Globo de referencia (líneas translúcidas), mismo espíritu que el
    // wireframe de fondo del grafo original.
    const wireGeo = new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(SPHERE_RADIUS, 1));
    const wireMat = new THREE.LineBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.18 });
    group.add(new THREE.LineSegments(wireGeo, wireMat));

    // Posiciones: nodos de automatización + de herramientas, repartidos
    // parejo sobre la esfera.
    const positions = fibonacciSphere(AUTOMATION_NODES.length + TOOL_LABELS.length, SPHERE_RADIUS);
    const automationPositions = positions.slice(0, AUTOMATION_NODES.length);
    const toolPositions = positions.slice(AUTOMATION_NODES.length);

    const nodes: GraphNode[] = [];

    AUTOMATION_NODES.forEach((node, i) => {
      const geo = new THREE.SphereGeometry(0.17, 20, 20);
      const mat = new THREE.MeshStandardMaterial({
        color: node.color,
        emissive: node.color,
        emissiveIntensity: 0.35,
        roughness: 0.35,
        metalness: 0.1,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(automationPositions[i]);
      group.add(mesh);
      nodes.push({ label: node.label, mesh, mat, baseIntensity: 0.35, baseScale: 1, isMain: true });
    });

    TOOL_LABELS.forEach((toolLabel, i) => {
      const geo = new THREE.SphereGeometry(0.08, 14, 14);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xdbeafe,
        emissive: 0x60a5fa,
        emissiveIntensity: 0.25,
        roughness: 0.5,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(toolPositions[i]);
      group.add(mesh);
      nodes.push({ label: toolLabel, mesh, mat, baseIntensity: 0.25, baseScale: 1, isMain: false });
    });

    // Conexiones: cada automatización con sus 2 herramientas más cercanas —
    // red dispersa, no una malla completa.
    const lineMat = new THREE.LineBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.45 });
    automationPositions.forEach((pos) => {
      for (const idx of nearestIndices(pos, toolPositions, 2)) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([pos, toolPositions[idx]]);
        group.add(new THREE.Line(lineGeo, lineMat));
      }
    });

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xbfdbfe, 1.1);
    key.position.set(3, 2, 4);
    scene.add(key);
    const rim = new THREE.PointLight(0x60a5fa, 0.6);
    rim.position.set(-4, -2, -3);
    scene.add(rim);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = mount;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // ── Ciclo automático (nodos principales) + hover interactivo (todos) ──
    let raf = 0;
    let cycleTimer: ReturnType<typeof setInterval> | undefined;
    let activeIndex = 0;
    let hoverIndex: number | null = null;
    const targetIntensity = nodes.map((n) => n.baseIntensity);
    targetIntensity[0] = 1.1;

    const applyAutoCycleTargets = () => {
      for (let i = 0; i < AUTOMATION_NODES.length; i++) {
        targetIntensity[i] = i === activeIndex ? 1.1 : nodes[i].baseIntensity;
      }
    };

    const runCycle = () => {
      activeIndex = (activeIndex + 1) % AUTOMATION_NODES.length;
      applyAutoCycleTargets();
    };

    const startCycle = () => {
      if (reduce || cycleTimer) return;
      cycleTimer = setInterval(runCycle, CYCLE_MS);
    };
    const stopCycle = () => {
      if (cycleTimer) {
        clearInterval(cycleTimer);
        cycleTimer = undefined;
      }
    };

    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    const meshes = nodes.map((n) => n.mesh);
    const worldPos = new THREE.Vector3();

    const setHover = (index: number | null) => {
      if (hoverIndex === index) return;
      hoverIndex = index;
      renderer.domElement.style.cursor = index !== null ? "pointer" : "default";
      if (index !== null) {
        stopCycle();
        targetIntensity[index] = 1.3;
        label.textContent = nodes[index].label;
        label.style.opacity = "1";
      } else {
        label.style.opacity = "0";
        applyAutoCycleTargets();
        for (let i = AUTOMATION_NODES.length; i < nodes.length; i++) targetIntensity[i] = nodes[i].baseIntensity;
        startCycle();
      }
    };

    const updatePointer = (clientX: number, clientY: number) => {
      const rect = mount.getBoundingClientRect();
      pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerNdc, camera);
      const hit = raycaster.intersectObjects(meshes, false)[0];
      setHover(hit ? meshes.indexOf(hit.object as THREE.Mesh) : null);
    };

    const onPointerMove = (e: PointerEvent) => updatePointer(e.clientX, e.clientY);
    const onPointerLeave = () => setHover(null);
    const onClick = () => {
      if (hoverIndex === null) return;
      const target = nodes[hoverIndex].isMain ? "casos" : "servicios";
      document.getElementById(target)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    };
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerleave", onPointerLeave);
    renderer.domElement.addEventListener("click", onClick);

    const render = () => {
      if (!reduce) group.rotation.y += 0.0016;
      nodes.forEach((n, i) => {
        n.mat.emissiveIntensity += (targetIntensity[i] - n.mat.emissiveIntensity) * 0.08;
        const boost = (n.mat.emissiveIntensity - n.baseIntensity) / Math.max(1.3 - n.baseIntensity, 0.01);
        n.mesh.scale.setScalar(n.baseScale + boost * 0.4);
      });
      if (hoverIndex !== null) {
        nodes[hoverIndex].mesh.getWorldPosition(worldPos);
        const proj = worldPos.clone().project(camera);
        const rect = mount.getBoundingClientRect();
        const x = (proj.x * 0.5 + 0.5) * rect.width;
        const y = (-proj.y * 0.5 + 0.5) * rect.height;
        label.style.transform = `translate(${x}px, ${y}px) translate(-50%, -140%)`;
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };

    if (reduce) {
      renderer.render(scene, camera);
    } else {
      render();
      startCycle();
    }

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        stopCycle();
      } else if (!reduce) {
        render();
        if (hoverIndex === null) startCycle();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(raf);
      stopCycle();
      document.removeEventListener("visibilitychange", handleVisibility);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
      renderer.domElement.removeEventListener("click", onClick);
      ro.disconnect();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.LineSegments) {
          obj.geometry.dispose();
          const mat = obj.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat.dispose();
        }
      });
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div role="img" aria-label={GRAPH_ALT} className={`relative ${className}`}>
      <div ref={mountRef} className="h-full w-full" />
      <div
        ref={labelRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded-md border border-white/15 bg-brand-900/95 px-2.5 py-1 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150"
        style={{ willChange: "transform" }}
      />
    </div>
  );
}
