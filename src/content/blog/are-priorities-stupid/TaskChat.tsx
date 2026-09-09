import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { CheckIcon, WrenchScrewdriverIcon } from "@heroicons/react/16/solid";
import { MotionConfig, motion, useInView, useReducedMotion } from "motion/react";
import { nextWeekTasks } from "./exampleTasks";

const durations = [700, 1000, 900, 3600, 2200, 2600, 1600, 1000, 4500, 350, 450];
const complete = 8;
const fadeOut = 9;
const reset = 10;

function Message({ children, user = false }: { children: ReactNode; user?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={
        user
          ? "max-w-9/10 justify-self-end rounded-2xl rounded-br-md bg-zinc-950/4 px-3 py-2 text-zinc-700"
          : "grid min-w-0 gap-3 text-zinc-600"
      }
    >
      {children}
    </motion.div>
  );
}

function ToolCall({ label, done, result }: { label: string; done: boolean; result: string }) {
  const Icon = done ? CheckIcon : WrenchScrewdriverIcon;
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.6875rem]/4 font-medium">
      <div className="flex items-center gap-1.5 rounded bg-sky-500/5 py-1 pr-2 pl-1 text-sky-800/85">
        <Icon className={`size-4 shrink-0 ${done ? "fill-emerald-600" : "fill-sky-700/70"}`} />
        <p>{label}</p>
      </div>
      <p className="text-zinc-400">{done ? result : "Working…"}</p>
    </div>
  );
}

function TaskDate({ title, date, previous }: { title: string; date?: string; previous?: string }) {
  return (
    <div className="flex min-h-8 min-w-0 items-center justify-between gap-3">
      <p className="min-w-0 text-zinc-700">{title}</p>
      <div className="flex shrink-0 items-center gap-2 text-[0.6875rem]/4 font-medium">
        {previous && <p className="text-zinc-400 line-through">{previous}</p>}
        {date ? (
          <p className="rounded bg-sky-500/5 px-1.5 whitespace-nowrap text-sky-800/85">{date}</p>
        ) : (
          <p className="text-zinc-400">No date</p>
        )}
      </div>
    </div>
  );
}

export default function TaskChat() {
  const id = useId();
  const figureRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const inView = useInView(figureRef, { amount: 0.2 });
  const reducedMotion = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [frame, setFrame] = useState(0);
  const [pageVisible, setPageVisible] = useState(true);
  const [offset, setOffset] = useState(0);
  const step = ready && reducedMotion ? complete : frame % durations.length;
  const sceneStep = step === reset ? 0 : step;
  const cycle = Math.floor(frame / durations.length) + (step === reset ? 1 : 0);

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

  useEffect(() => {
    const viewport = viewportRef.current;
    const thread = threadRef.current;
    if (!viewport || !thread) {
      return undefined;
    }
    const measure = () => setOffset(Math.max(0, thread.scrollHeight - viewport.clientHeight));
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(thread);
    measure();
    return () => observer.disconnect();
  }, [cycle]);

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
      <figure
        ref={figureRef}
        id="task-chat"
        aria-label="An assistant reviews and replans work using tools"
        aria-describedby={`${id}-summary`}
        data-chat-step={step}
        className="not-prose relative left-1/2 isolate my-12 w-[min(68rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl bg-zinc-950/1 p-4 text-[0.8125rem]/5 antialiased sm:my-16 sm:p-8"
      >
        <p id={`${id}-summary`} className="sr-only">
          An illustrative chat continuing from the previous illustration, a week later. Asked what's
          top priority, an assistant fetches the three remaining tasks: a pricing review planned for
          today, an offline mode prototype also planned for today, and planning a walking holiday
          tomorrow. The user says the pricing review isn't important anymore. The assistant asks
          whether to reschedule it or delete it. The user chooses next week. The assistant updates
          two tasks: it moves the pricing review from today to next week and brings holiday planning
          forward from tomorrow to today. The offline prototype stays today. It translates a change
          in priorities into dates without a priority field.
        </p>
        <div className="@container" aria-hidden="true">
          <motion.div
            initial={false}
            animate={{ opacity: step >= fadeOut ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-136 rounded-xl bg-white p-4 ring-1 ring-zinc-950/6 @lg:p-6"
            data-chat-scene
          >
            <div
              ref={viewportRef}
              className={`h-112 overflow-hidden @lg:h-100 ${offset > 0 ? "[mask-image:linear-gradient(to_bottom,transparent,black_1rem)]" : ""}`}
              data-chat-viewport
            >
              <motion.div
                key={cycle}
                ref={threadRef}
                initial={false}
                animate={{ y: -offset }}
                transition={{ duration: reducedMotion || step === reset ? 0 : 0.4 }}
                className="grid content-start gap-5 p-1"
              >
                <Message user>
                  <p>What’s top priority?</p>
                </Message>
                {sceneStep >= 2 && (
                  <Message>
                    <ToolCall
                      label="Fetching tasks"
                      done={sceneStep >= 3}
                      result="3 tasks fetched"
                    />
                    {sceneStep >= 3 && (
                      <div className="grid gap-3">
                        <p>
                          The pricing review and offline prototype are up today. Holiday planning is
                          tomorrow.
                        </p>
                        <div className="grid gap-1">
                          <TaskDate {...nextWeekTasks.pricing} />
                          <TaskDate {...nextWeekTasks.offline} />
                          <TaskDate {...nextWeekTasks.holiday} />
                        </div>
                      </div>
                    )}
                  </Message>
                )}
                {sceneStep >= 4 && (
                  <Message user>
                    <p>The pricing review isn’t important anymore.</p>
                  </Message>
                )}
                {sceneStep >= 5 && (
                  <Message>
                    <p>Should I reschedule it or delete it?</p>
                  </Message>
                )}
                {sceneStep >= 6 && (
                  <Message user>
                    <p>Reschedule it for next week.</p>
                  </Message>
                )}
                {sceneStep >= 7 && (
                  <Message>
                    <ToolCall
                      label="Updating tasks"
                      done={sceneStep >= complete}
                      result="2 tasks updated"
                    />
                    {sceneStep >= complete && (
                      <div className="grid gap-3">
                        <p>
                          Moved the pricing review to next week and brought holiday planning forward
                          to fill the space today.
                        </p>
                        <div className="grid gap-1">
                          <TaskDate {...nextWeekTasks.offline} />
                          <TaskDate
                            title={nextWeekTasks.holiday.title}
                            previous={nextWeekTasks.holiday.date}
                            date="Today"
                          />
                          <TaskDate
                            title={nextWeekTasks.pricing.title}
                            previous={nextWeekTasks.pricing.date}
                            date="Next week"
                          />
                        </div>
                      </div>
                    )}
                  </Message>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </figure>
    </MotionConfig>
  );
}
