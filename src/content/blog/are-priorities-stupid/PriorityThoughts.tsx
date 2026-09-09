import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useInView, useReducedMotion } from "motion/react";
import { exampleTasks } from "./exampleTasks";

const tasks = [
  exampleTasks.pricing,
  exampleTasks.proposal,
  exampleTasks.security,
  exampleTasks.insurance,
  exampleTasks.charts,
  exampleTasks.photos,
];

const priorityTones: Record<string, string> = {
  High: "bg-rose-500/6 text-rose-700/85",
  Medium: "bg-amber-500/7 text-amber-800/85",
  Low: "bg-zinc-950/4 text-zinc-500",
};

const thoughts = [
  { task: 0, text: "What does this mean? Right now or is tomorrow okay?", side: "right" },
  { task: 2, text: "Should I do this first?", side: "left" },
  { task: 4, text: "Why am I even bothering with this?", side: "right" },
] as const;

const durations = [1000, 2800, 2800, 2800, 600];
const columns = "@lg:grid-cols-[minmax(0,1fr)_4rem_5rem_3.5rem]";

function ThoughtBubble({ text, side }: { text: string; side: "left" | "right" | "below" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -3, scale: 0.98 }}
      className="relative rounded-2xl bg-white px-4 py-3 text-zinc-600 shadow-xs ring-1 ring-violet-950/8"
    >
      <p className="text-pretty">{text}</p>
      <div
        className={`absolute flex items-center gap-1 ${side === "below" ? "bottom-full left-6 flex-col-reverse pb-1" : side === "left" ? "top-1/2 left-full pl-1" : "top-1/2 right-full flex-row-reverse pr-1"}`}
      >
        <span className="size-1.5 shrink-0 rounded-full bg-violet-300/60" />
        <span className="size-1 shrink-0 rounded-full bg-violet-300/40" />
      </div>
    </motion.div>
  );
}

export default function PriorityThoughts() {
  const id = useId();
  const figureRef = useRef<HTMLElement>(null);
  const inView = useInView(figureRef, { amount: 0.2 });
  const reducedMotion = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [frame, setFrame] = useState(0);
  const [pageVisible, setPageVisible] = useState(true);
  const step = ready && reducedMotion ? 1 : frame % durations.length;
  const thought = thoughts[step - 1];

  useEffect(() => {
    setReady(true);
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    if (!ready || !inView || !pageVisible || reducedMotion) {
      return undefined;
    }
    const timer = window.setTimeout(() => setFrame((current) => current + 1), durations[step]);
    return () => window.clearTimeout(timer);
  }, [ready, inView, pageVisible, reducedMotion, step]);

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
      <figure
        ref={figureRef}
        id="priority-thoughts"
        aria-label="The decisions behind a traditional task list"
        aria-describedby={`${id}-summary`}
        data-thought-step={step}
        className="not-prose relative left-1/2 isolate my-12 w-[min(68rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl bg-zinc-950/1 p-4 text-[0.8125rem]/5 antialiased sm:my-16 sm:p-8"
      >
        <p id={`${id}-summary`} className="sr-only">
          A personal task list spanning work, business and life, with priorities, dates and effort
          estimates. Reviewing pricing is high priority but undated: what does this mean? Right now
          or is tomorrow okay? Finishing a SOC 2 security review is medium priority and due today:
          should I do this first? Rebuilding a revenue chart is low priority and takes a week: why
          am I even bothering with this? The list also includes sending a client proposal tomorrow,
          renewing car insurance on Friday and reorganising old photos without a date. Thoughts
          appear in turn while the list stays still.
        </p>
        <div className="@container" aria-hidden="true">
          <div className="relative mx-auto grid w-full max-w-136 gap-6 @4xl:my-8">
            <div className="rounded-xl bg-white p-2 ring-1 ring-zinc-950/6 @lg:p-3">
              <div
                className={`grid items-center gap-2 px-2.5 pb-2 text-[0.6875rem]/4 font-medium text-zinc-400 @max-lg:hidden ${columns}`}
              >
                <p>Task</p>
                <p>Priority</p>
                <p>Date</p>
                <p>Effort</p>
              </div>
              <ul role="list" className="grid gap-1">
                {tasks.map((task, index) => (
                  <li key={task.title} className="relative" data-traditional-task={index}>
                    <motion.div
                      animate={{
                        backgroundColor: thought?.task === index ? "#8b5cf60a" : "#8b5cf600",
                      }}
                      className={`grid min-h-17 grid-cols-[4rem_minmax(0,1fr)_3.5rem] items-center gap-x-2 gap-y-1 rounded-md px-2.5 py-2 @lg:min-h-10 @lg:py-1 ${columns}`}
                    >
                      <div className="col-span-full flex min-w-0 items-center gap-2 text-zinc-700 @lg:col-span-1">
                        <span className="size-3 shrink-0 rounded-sm ring-1 ring-zinc-950/15" />
                        <p>{task.title}</p>
                      </div>
                      <div className="text-[0.6875rem]/4 font-medium">
                        <p className={`w-fit rounded px-1.5 ${priorityTones[task.priority]}`}>
                          {task.priority}
                        </p>
                      </div>
                      <div className="text-[0.6875rem]/4 font-medium">
                        {task.date ? (
                          <p className="w-fit rounded bg-sky-500/5 px-1.5 whitespace-nowrap text-sky-800/85">
                            {task.date}
                          </p>
                        ) : (
                          <p className="px-1.5 text-zinc-300">—</p>
                        )}
                      </div>
                      <p className="text-[0.6875rem]/4 whitespace-nowrap text-zinc-400 tabular-nums">
                        {task.effort}
                      </p>
                    </motion.div>
                    <div
                      className={`absolute top-1/2 z-10 w-40 -translate-y-1/2 @max-4xl:hidden ${thoughts.find((item) => item.task === index)?.side === "left" ? "right-[calc(100%+--spacing(8))]" : "left-[calc(100%+--spacing(8))]"}`}
                    >
                      <AnimatePresence>
                        {thought?.task === index && (
                          <ThoughtBubble key={index} text={thought.text} side={thought.side} />
                        )}
                      </AnimatePresence>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-20 @4xl:hidden">
              <div className="absolute inset-x-0 top-0 mx-auto max-w-64">
                <AnimatePresence mode="wait">
                  {thought && <ThoughtBubble key={thought.task} text={thought.text} side="below" />}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </figure>
    </MotionConfig>
  );
}
