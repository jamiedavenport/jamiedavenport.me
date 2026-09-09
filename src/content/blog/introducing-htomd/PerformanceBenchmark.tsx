import { type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import BenchmarkFigure from "./BenchmarkFigure";
import { performanceResults } from "./benchmarkResults";
import { toolUrls } from "./toolUrls";
import cLogo from "./assets/c.svg?url";
import rustLogo from "./assets/rust.svg?url";

// Logos: https://github.com/devicons/devicon (license in assets/LICENSE.devicon).
const nativeLogos = { C: cLogo, Rust: rustLogo };
const sortedResults = performanceResults.toSorted((a, b) => a.seconds - b.seconds);
const axisMax = Math.ceil(Math.max(...performanceResults.map((result) => result.seconds)) * 2) / 2;

function barStyle(seconds: number): CSSProperties & { "--bar-width": string } {
  return { "--bar-width": `${(seconds / axisMax) * 100}%` };
}

export default function PerformanceBenchmark() {
  const reducedMotion = useReducedMotion();

  return (
    <BenchmarkFigure
      id="performance-benchmark"
      label="Conversion times for 115 offline pages on an Apple M5 Max, in seconds, fastest first"
    >
      <ul role="list" className="grid gap-5">
        {sortedResults.map((result) => (
          <li
            key={result.name}
            className="grid items-center gap-x-6 gap-y-2 @2xl:grid-cols-[16rem_minmax(0,1fr)]"
          >
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <p
                title={`${result.name} ${result.version}`}
                className={`font-medium ${result.name === "htomd" ? "text-sky-800" : "text-zinc-700"}`}
              >
                <a
                  href={toolUrls[result.name]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline underline-offset-4"
                >
                  {result.name}
                </a>
              </p>
              <p className="text-[0.6875rem]/4 text-zinc-500 tabular-nums">
                {result.dependencies} dependencies
              </p>
              {result.native ? (
                <img
                  src={nativeLogos[result.native]}
                  alt={`${result.native} native binary`}
                  width="12"
                  height="12"
                  className="size-3 shrink-0"
                />
              ) : (
                <p className="sr-only">No native binary</p>
              )}
            </div>
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative h-3 min-w-0 flex-1">
                <motion.div
                  data-benchmark-bar={result.name}
                  aria-hidden="true"
                  initial={reducedMotion ? false : { scaleX: 0 }}
                  animate={reducedMotion ? { scaleX: 1 } : undefined}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{
                    duration: reducedMotion ? 0 : (result.seconds / axisMax) * 0.5,
                    ease: "linear",
                  }}
                  style={barStyle(result.seconds)}
                  className={`absolute inset-y-0 left-0 w-(--bar-width) origin-left rounded-full ${result.name === "htomd" ? "bg-sky-600/65" : "bg-zinc-400/40"}`}
                />
              </div>
              <p className="w-16 shrink-0 text-right whitespace-nowrap text-zinc-600 tabular-nums">
                {result.seconds.toFixed(3)}
                <span aria-hidden="true"> s</span>
                <span className="sr-only"> seconds</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </BenchmarkFigure>
  );
}
