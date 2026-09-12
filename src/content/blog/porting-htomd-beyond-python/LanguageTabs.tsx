import { type KeyboardEvent, type ReactNode, useId, useRef, useState } from "react";
import { MotionConfig, motion } from "motion/react";
import LanguageLabel from "./LanguageLabel";

const names = {
  python: "Python",
  typescript: "TypeScript",
  go: "Go",
  rust: "Rust",
} as const;

type Language = keyof typeof names;
type Props = {
  languages: Language[];
  label: string;
  class?: string;
} & Partial<Record<Language | "children", ReactNode>>;

export default function LanguageTabs({ languages, label, class: className, ...panels }: Props) {
  const [selected, setSelected] = useState(languages[0]);
  const id = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    switch (event.key) {
      case "ArrowRight":
        next = (index + 1) % languages.length;
        break;
      case "ArrowLeft":
        next = (index + languages.length - 1) % languages.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = languages.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    setSelected(languages[next]);
    tabs.current[next]?.focus({ preventScroll: true });
    tabs.current[next]?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  return (
    <MotionConfig reducedMotion="user">
      <section
        aria-label={label}
        className={["grid min-w-0 content-start gap-4", className].filter(Boolean).join(" ")}
      >
        <div
          role="tablist"
          aria-label={label}
          className="flex h-12 w-fit max-w-full min-w-0 items-center gap-1 overflow-x-auto"
        >
          {languages.map((language, index) => (
            <button
              key={language}
              ref={(node) => {
                tabs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${language}`}
              aria-controls={`${id}-panel-${language}`}
              aria-selected={selected === language}
              tabIndex={selected === language ? 0 : -1}
              onClick={() => setSelected(language)}
              onKeyDown={(event) => navigate(event, index)}
              className="relative flex h-8 shrink-0 cursor-pointer items-center rounded-md px-3 text-sm font-medium text-zinc-500 transition-colors duration-150 hover:bg-zinc-950/8 hover:text-zinc-950 aria-selected:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-800 motion-reduce:transition-none"
            >
              {selected === language && (
                <motion.span
                  layoutId={`${id}-active-tab`}
                  aria-hidden="true"
                  className="absolute inset-0 rounded-md bg-white ring-1 ring-zinc-950/5"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
              <span className="relative">
                <LanguageLabel language={names[language]} />
              </span>
            </button>
          ))}
        </div>
        <div className="grid min-w-0">
          {languages.map((language) => (
            <div
              key={language}
              id={`${id}-panel-${language}`}
              role="tabpanel"
              aria-labelledby={`${id}-tab-${language}`}
              aria-hidden={selected !== language}
              inert={selected !== language}
              className="col-start-1 row-start-1 min-w-0 opacity-100 transition-opacity duration-200 ease-in-out aria-hidden:pointer-events-none aria-hidden:opacity-0 motion-reduce:transition-none"
            >
              {panels[language]}
            </div>
          ))}
        </div>
      </section>
    </MotionConfig>
  );
}
