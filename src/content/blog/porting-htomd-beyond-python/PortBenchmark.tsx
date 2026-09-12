import { type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import BenchmarkFigure from "../introducing-htomd/BenchmarkFigure";
import { results, pages, cpu } from "./benchmark/results.json";
import LanguageLabel from "./LanguageLabel";

const sortedResults = results.toSorted((a, b) => a.seconds - b.seconds);
const axisMax = Math.ceil(Math.max(...results.map((result) => result.seconds)) * 2) / 2;

function barStyle(seconds: number): CSSProperties & { "--bar-width": string } {
  return { "--bar-width": `${(seconds / axisMax) * 100}%` };
}

export default function PortBenchmark() {
  const reducedMotion = useReducedMotion();

  return (
    <BenchmarkFigure
      id="port-benchmark"
      label={`htomd conversion times for ${pages} offline pages on an ${cpu}, in seconds, fastest first`}
    >
      <ul role="list" className="grid gap-5">
        {sortedResults.map((result) => (
          <li
            key={result.language}
            className="grid items-center gap-x-6 gap-y-2 @2xl:grid-cols-[10rem_minmax(0,1fr)]"
          >
            <p title={result.runtime} className="font-medium text-zinc-700">
              <LanguageLabel language={result.language} />
            </p>
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative h-3 min-w-0 flex-1">
                <motion.div
                  data-benchmark-bar={result.language}
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
                  className="absolute inset-y-0 left-0 w-(--bar-width) origin-left rounded-full bg-sky-600/65"
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
