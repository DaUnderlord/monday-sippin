"use client";

import { useEffect, useMemo, useState } from "react";
import Lottie from "lottie-react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import HotCoffee from "@/../assets/images/HotSmilingCoffee_GoodMorning.json";

interface SplashScreenProps {
  minDurationMs?: number; // minimum display duration
}

export function SplashScreen({ minDurationMs = 1400 }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);
  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Show splash on every page load for demo purposes
    const timer = setTimeout(() => {
      setVisible(false);
    }, minDurationMs);

    return () => clearTimeout(timer);
  }, [minDurationMs]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-white dark:bg-slate-950">
      <div className="w-[220px] sm:w-[260px] md:w-[300px] aspect-square">
        <Lottie
          animationData={HotCoffee}
          loop={false}
          autoplay={!prefersReducedMotion}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}
