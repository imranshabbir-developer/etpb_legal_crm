import { useEffect, useRef } from "react";

type LoginLottiePlayerProps = {
  animationData: object;
};

type LottieApi = {
  loadAnimation: (config: {
    container: Element;
    renderer: "svg";
    loop: boolean;
    autoplay: boolean;
    animationData: object;
  }) => { destroy: () => void };
};

function resolveLottieApi(mod: unknown): LottieApi | null {
  const record = mod as { default?: unknown; loadAnimation?: LottieApi["loadAnimation"] };
  const candidates = [record.loadAnimation && record, record.default, mod];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") continue;

    const nested = candidate as { default?: LottieApi; loadAnimation?: LottieApi["loadAnimation"] };
    if (typeof nested.loadAnimation === "function") {
      return nested as LottieApi;
    }
    if (nested.default && typeof nested.default.loadAnimation === "function") {
      return nested.default;
    }
  }

  return null;
}

export function LoginLottiePlayer({ animationData }: LoginLottiePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animation: { destroy: () => void } | undefined;
    let cancelled = false;

    import("lottie-web")
      .then((mod) => {
        if (cancelled) return;

        const lottie = resolveLottieApi(mod);
        if (!lottie) return;

        animation = lottie.loadAnimation({
          container,
          renderer: "svg",
          loop: true,
          autoplay: true,
          animationData,
        });
      })
      .catch(() => {
        // Keep SVG fallback visible in the parent if Lottie fails to load.
      });

    return () => {
      cancelled = true;
      animation?.destroy();
    };
  }, [animationData]);

  return <div ref={containerRef} className="login-hero-lottie" aria-hidden />;
}
