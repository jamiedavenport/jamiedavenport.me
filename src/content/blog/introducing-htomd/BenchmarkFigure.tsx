import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";

export default function BenchmarkFigure({
  id,
  label,
  caption,
  children,
}: {
  id: string;
  label: string;
  caption?: ReactNode;
  children: ReactNode;
}) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
      <figure
        id={id}
        aria-label={label}
        className="not-prose relative left-1/2 isolate my-12 w-[min(68rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl bg-zinc-950/1 p-4 text-base/7 antialiased sm:my-16 sm:p-8 sm:text-sm/6"
      >
        <div className="@container" data-benchmark-scene>
          {children}
        </div>
        {caption && (
          <figcaption className="mt-5 text-pretty text-zinc-500 tabular-nums">{caption}</figcaption>
        )}
      </figure>
    </MotionConfig>
  );
}
