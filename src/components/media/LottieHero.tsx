"use client";

import { useMemo } from "react";
import Lottie from "lottie-react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import CoffeeTime from "../../../assets/images/CoffeTime.json";

interface LottieHeroProps {
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
  jsonData?: any;
}

export function LottieHero({ className = "", loop = true, autoplay = true, speed = 1, jsonData }: LottieHeroProps) {
  const prefersReducedMotion = useMemo(() =>
    typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  , []);

  // If reduced motion is requested, disable autoplay
  const shouldAutoplay = autoplay && !prefersReducedMotion;
  const animationData = jsonData ?? CoffeeTime;

  return (
    <div className={className} aria-hidden={true}>
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={shouldAutoplay}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
