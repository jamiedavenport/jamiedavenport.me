import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import BenchmarkFigure from "./BenchmarkFigure";
import { extractionResults, otherExtractions } from "./extractionResults";
import { toolUrls } from "./toolUrls";
import tailwindLogo from "./assets/tailwindcss.svg?url";

const characterCount = new Intl.NumberFormat("en-GB");

export default function ExtractionComparison(outputs: Record<string, ReactNode>) {
  const reducedMotion = useReducedMotion();

  return (
    <BenchmarkFigure
      id="extraction-comparison"
      label="Three Markdown extractions of Tailwind Labs is joining Shopify"
      caption={
        <>
          Other outputs:{" "}
          {otherExtractions.map((result, index) => (
            <span key={result.tool}>
              {index > 0 && " · "}
              <a
                href={toolUrls[result.tool]}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline underline-offset-4"
              >
                {result.tool}
              </a>
              {` ${characterCount.format(result.characters)} characters`}
            </span>
          ))}
          .
        </>
      }
    >
      <div className="mb-5">
        <a
          href="https://tailwindcss.com/blog/tailwind-is-joining-shopify"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-zinc-700 underline-offset-4 hover:underline font-medium"
        >
          <img src={tailwindLogo} alt="" width="20" height="20" className="size-5 shrink-0" />
          Tailwind Labs is joining Shopify
        </a>
      </div>
      <div className="grid gap-3 @3xl:grid-cols-3">
        {extractionResults.map((result) => (
          <section
            key={result.tool}
            aria-label={`${result.tool} output`}
            className="grid min-w-0 content-start gap-5 rounded-lg bg-white p-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h3
                title={`${result.tool} ${result.version}`}
                className={`font-medium text-balance ${result.tool === "htomd" ? "text-sky-800" : "text-zinc-700"}`}
              >
                <a
                  href={toolUrls[result.tool]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline underline-offset-4"
                >
                  {result.tool}
                </a>
              </h3>
              <span className="text-xs text-zinc-500 tabular-nums">
                {characterCount.format(result.characters)} characters
              </span>
            </div>
            <motion.div
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={reducedMotion ? { opacity: 1 } : undefined}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: reducedMotion ? 0 : 0.15 }}
            >
              {outputs[result.tool]}
            </motion.div>
          </section>
        ))}
      </div>
    </BenchmarkFigure>
  );
}
