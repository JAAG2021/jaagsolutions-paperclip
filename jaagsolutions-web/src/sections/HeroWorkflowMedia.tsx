import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { HeroPipelineStepsMock } from "./HeroPipelineStepsMock";

const HeroLottiePlayer = lazy(() => import("./HeroLottiePlayer"));

function publicAssetUrl(relPath: string): string {
  const base = import.meta.env.BASE_URL;
  const withSlash = base.endsWith("/") ? base : `${base}/`;
  const rel = relPath.startsWith("/") ? relPath.slice(1) : relPath;
  return `${withSlash}${rel}`;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

type Resolved = "video" | "lottie" | "mock" | null;

function lottieFetchUrl(): string {
  const raw = (import.meta.env.VITE_HERO_LOTTIE_PATH ?? "lottie/workflow-demo.json").trim();
  if (/^https?:\/\//i.test(raw)) return raw;
  return publicAssetUrl(raw);
}

/**
 * Panel del hero: intenta vídeo (env o `/media/hero-automation.webm|mp4`),
 * luego JSON Lottie en `public` (ruta configurable), y cae al mock CSS.
 */
export default function HeroWorkflowMedia() {
  const prefersReduced = usePrefersReducedMotion();
  const [resolved, setResolved] = useState<Resolved>(prefersReduced ? "mock" : null);
  const [videoIdx, setVideoIdx] = useState(0);
  const [winnerVideoSrc, setWinnerVideoSrc] = useState<string | null>(null);
  const [lottieData, setLottieData] = useState<object | null>(null);

  const videoCandidates = useMemo(() => {
    const list: string[] = [];
    const env = import.meta.env.VITE_HERO_VIDEO_URL?.trim();
    if (env) list.push(env);
    list.push(publicAssetUrl("media/hero-automation.webm"));
    list.push(publicAssetUrl("media/hero-automation.mp4"));
    return list;
  }, []);

  useEffect(() => {
    if (prefersReduced) setResolved("mock");
  }, [prefersReduced]);

  useEffect(() => {
    if (prefersReduced || resolved !== null) return;
    if (videoIdx >= videoCandidates.length) return;

    let cancelled = false;
    const src = videoCandidates[videoIdx];
    const v = document.createElement("video");
    v.muted = true;
    v.playsInline = true;
    v.preload = "auto";

    const onLoaded = () => {
      if (cancelled) return;
      setWinnerVideoSrc(src);
      setResolved("video");
    };

    const onErr = () => {
      if (cancelled) return;
      setVideoIdx((i) => i + 1);
    };

    v.addEventListener("loadeddata", onLoaded);
    v.addEventListener("error", onErr);
    v.src = src;

    try {
      v.load();
    } catch {
      onErr();
    }

    return () => {
      cancelled = true;
      v.removeEventListener("loadeddata", onLoaded);
      v.removeEventListener("error", onErr);
      v.removeAttribute("src");
      v.load();
    };
  }, [prefersReduced, resolved, videoIdx, videoCandidates]);

  useEffect(() => {
    if (prefersReduced || resolved !== null) return;
    if (videoIdx < videoCandidates.length) return;

    let cancelled = false;

    async function fetchLottie() {
      try {
        const res = await fetch(lottieFetchUrl());
        if (cancelled) return;
        if (!res.ok) {
          setResolved("mock");
          return;
        }
        const json: unknown = await res.json();
        if (cancelled) return;
        if (json && typeof json === "object" && "v" in json) {
          setLottieData(json as object);
          setResolved("lottie");
        } else {
          setResolved("mock");
        }
      } catch {
        if (!cancelled) setResolved("mock");
      }
    }

    void fetchLottie();
    return () => {
      cancelled = true;
    };
  }, [prefersReduced, resolved, videoIdx, videoCandidates.length]);

  const mediaLabel =
    resolved === "video" || resolved === "lottie"
      ? "Flujo animado (ejemplo Make / n8n)"
      : "Pipeline activo";

  const showLoading = !prefersReduced && resolved === null;

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <p className="text-xs text-blue-100/80 mb-3 font-semibold tracking-wide uppercase">{mediaLabel}</p>

      {showLoading && (
        <div
          className="mb-3 min-h-[200px] rounded-lg bg-white/5 animate-pulse border border-white/10"
          aria-hidden
        />
      )}

      {resolved === "video" && winnerVideoSrc && (
        <div className="overflow-hidden rounded-lg border border-white/10 bg-black/20">
          <video
            className="w-full max-h-[240px] object-contain"
            muted
            playsInline
            autoPlay
            loop
            controls={false}
            src={winnerVideoSrc}
          />
        </div>
      )}

      {resolved === "lottie" && lottieData && (
        <Suspense
          fallback={
            <div className="min-h-[200px] rounded-lg bg-white/5 animate-pulse border border-white/10" />
          }
        >
          <HeroLottiePlayer
            animationData={lottieData}
            onRuntimeError={() => {
              setLottieData(null);
              setResolved("mock");
            }}
          />
        </Suspense>
      )}

      {resolved === "mock" && <HeroPipelineStepsMock />}
    </div>
  );
}
