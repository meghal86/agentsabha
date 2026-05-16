"use client";

import { useEffect, useState } from "react";

/**
 * Counts from 0 to `target` over `duration` ms using cubic ease-out.
 * Initialises to `target` for SSR so there is no hydration mismatch,
 * then resets and runs the animation on the client after mount.
 */
export function CountUpHero({
  target = 543,
  duration = 1400,
}: {
  target?: number;
  duration?: number;
}) {
  const [value, setValue] = useState(target);

  useEffect(() => {
    let frame: number;
    const start = performance.now();

    setValue(0);

    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      // Cubic ease-out: fast start, dramatic deceleration at the end
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * target));
      if (p < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return <>{value}</>;
}
