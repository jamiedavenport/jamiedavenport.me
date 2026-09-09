import { useEffect, useId, useRef, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  MotionConfig,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import {
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  CheckIcon,
  TrashIcon,
} from "@heroicons/react/16/solid";
import { exampleTasks, nextWeekTasks } from "./exampleTasks";

type Task = {
  id: string;
  title: string;
  quadrant: number;
  movesAt: number;
  date?: string;
  datedAt?: number;
  nextWeekDate?: string;
  destination?: "email" | "slack" | "bin";
};

const tasks: Task[] = [
  {
    id: "security",
    ...exampleTasks.security,
    quadrant: 0,
    movesAt: 1,
    datedAt: 2,
  },
  {
    id: "proposal",
    ...exampleTasks.proposal,
    quadrant: 0,
    movesAt: 3,
    datedAt: 4,
  },
  {
    id: "insurance",
    ...exampleTasks.insurance,
    quadrant: 0,
    movesAt: 5,
    datedAt: 6,
  },
  {
    id: "pricing",
    ...exampleTasks.pricing,
    quadrant: 1,
    movesAt: 7,
    date: "Next week",
    datedAt: 8,
    nextWeekDate: nextWeekTasks.pricing.date,
  },
  {
    id: "offline",
    ...exampleTasks.offline,
    quadrant: 1,
    movesAt: 9,
    nextWeekDate: nextWeekTasks.offline.date,
  },
  {
    id: "holiday",
    ...exampleTasks.holiday,
    quadrant: 1,
    movesAt: 10,
    nextWeekDate: nextWeekTasks.holiday.date,
  },
  { id: "room", ...exampleTasks.room, quadrant: 2, movesAt: 11, destination: "slack" },
  { id: "travel", ...exampleTasks.travel, quadrant: 2, movesAt: 12, destination: "email" },
  { id: "charts", ...exampleTasks.charts, quadrant: 3, movesAt: 13, destination: "bin" },
  { id: "photos", ...exampleTasks.photos, quadrant: 3, movesAt: 15, destination: "bin" },
];

const quadrants = [
  {
    label: "Do",
    dot: "bg-rose-400",
    tone: "bg-rose-500/3 text-rose-800/80",
    position: "col-start-2 row-start-2",
  },
  {
    label: "Schedule",
    dot: "bg-sky-400",
    tone: "bg-sky-500/3 text-sky-800/80",
    position: "col-start-3 row-start-2",
  },
  {
    label: "Delegate",
    dot: "bg-amber-400",
    tone: "bg-amber-500/4 text-amber-800/80",
    position: "col-start-2 row-start-3",
  },
  {
    label: "Eliminate",
    dot: "bg-zinc-400",
    tone: "bg-zinc-950/2 text-zinc-500",
    position: "col-start-3 row-start-3",
  },
];

// Movement and date assignment are separate beats; the next week's plan closes the scene.
const durations = [
  1000, 500, 650, 500, 650, 500, 650, 500, 850, 500, 500, 650, 650, 650, 450, 650, 1800, 2000, 350,
  450,
];
const focusList = 16;
const weekLater = 17;
const fadeOut = 18;
const reset = 19;
const listTasks = tasks.filter((task) => task.quadrant < 2);
const destinations = [
  { id: "email", label: "Email", icon: EnvelopeIcon },
  { id: "slack", label: "Slack", icon: ChatBubbleLeftRightIcon },
  { id: "bin", label: "Bin", icon: TrashIcon },
];

function TaskRow({
  task,
  date,
  completed = false,
}: {
  task: Task;
  date?: string;
  completed?: boolean;
}) {
  return (
    <motion.div
      layoutId={task.id}
      data-task={task.id}
      className="relative z-10 flex h-full min-w-0 items-center gap-2 rounded-md bg-white px-2.5 ring-1 ring-zinc-950/6"
    >
      <span
        aria-hidden="true"
        className={`size-1.25 shrink-0 rounded-full ${quadrants[task.quadrant].dot}`}
      />
      <motion.p
        layout="position"
        className={`min-w-0 flex-1 ${completed ? "text-zinc-400" : "text-zinc-700"}`}
      >
        {task.title}
      </motion.p>
      <AnimatePresence initial={false} mode="popLayout">
        {completed ? (
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="shrink-0"
          >
            <CheckIcon aria-label="Completed" role="img" className="size-4 fill-emerald-600" />
          </motion.div>
        ) : date ? (
          <motion.p
            key={date}
            data-task-date
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="shrink-0 rounded bg-sky-500/5 px-1.5 text-[0.6875rem]/4 font-medium whitespace-nowrap text-sky-800/85 tabular-nums"
          >
            {date}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export default function PriorityMapping() {
  const id = useId();
  const figureRef = useRef<HTMLElement>(null);
  const inView = useInView(figureRef, { amount: 0.2 });
  const reducedMotion = useReducedMotion();
  const [frame, setFrame] = useState(0);
  const [ready, setReady] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const step = ready && reducedMotion ? weekLater : frame % durations.length;
  const cycle = Math.floor(frame / durations.length);
  // Rebuild a fresh matrix behind the fade, then reveal it on the next beat.
  const sceneStep = step === reset ? 0 : step;
  const layoutCycle = cycle + (step === reset ? 1 : 0);
  const showListOnly = sceneStep >= focusList;

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
    <MotionConfig reducedMotion="user" transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
      <figure
        ref={figureRef}
        id="priority-mapping"
        aria-label="From the Eisenhower matrix to a task list"
        aria-describedby={`${id}-summary`}
        data-mapping-step={step}
        data-mapping-cycle={cycle}
        className="not-prose relative left-1/2 isolate my-12 w-[min(68rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl bg-zinc-950/1 p-4 text-[0.8125rem]/5 antialiased sm:my-16 sm:p-8"
      >
        <p id={`${id}-summary`} className="sr-only">
          The same personal task list, with four more tasks, moves out of the Eisenhower matrix. The
          SOC 2 security review keeps its date of today, the client proposal tomorrow and car
          insurance Friday. Reviewing pricing gets a date next week. Prototyping offline mode and
          planning a walking holiday initially remain undated. Booking a meeting room goes to a
          teammate via Slack; booking team travel goes to the office manager via email. Rebuilding a
          revenue chart and reorganising old photos are dropped. A week later, the first three tasks
          are complete. The pricing review and offline prototype are now planned for today, and
          holiday planning for tomorrow. The animation loops while visible.
        </p>
        <motion.div
          initial={false}
          animate={{ opacity: step >= fadeOut ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          className="@container relative"
          data-animation-scene
        >
          <LayoutGroup key={layoutCycle} id={`${id}-${layoutCycle}`}>
            <div className="grid items-start gap-7 @3xl:grid-cols-[6fr_5fr] @3xl:gap-10">
              <motion.section
                className="col-start-1 row-start-1 grid min-w-0 gap-4"
                aria-label="Eisenhower matrix"
                aria-hidden={showListOnly}
                animate={{ opacity: showListOnly ? 0 : 1 }}
                transition={{ duration: 0.25 }}
                data-zone="matrix"
              >
                <div className="grid grid-cols-[1rem_minmax(0,1fr)_minmax(0,1fr)] grid-rows-[auto_1fr_1fr] gap-x-2 gap-y-2.5">
                  <p className="col-start-2 text-center text-zinc-400">Urgent</p>
                  <p className="text-center text-zinc-400">Not urgent</p>
                  <p className="row-start-2 rotate-180 self-center justify-self-center whitespace-nowrap text-zinc-400 [writing-mode:vertical-rl]">
                    Important
                  </p>
                  <p className="col-start-1 row-start-3 rotate-180 self-center justify-self-center whitespace-nowrap text-zinc-400 [writing-mode:vertical-rl]">
                    Less important
                  </p>
                  {quadrants.map((quadrant, index) => (
                    <div
                      key={quadrant.label}
                      className={`grid min-w-0 content-start gap-2 rounded-[calc(var(--radius-md)+--spacing(2))] p-2 ${quadrant.tone} ${quadrant.position}`}
                    >
                      <div className="grid auto-rows-18 gap-1.5 @lg:auto-rows-12 @5xl:auto-rows-9">
                        {tasks
                          .filter((task) => task.quadrant === index)
                          .map((task) => (
                            <div key={task.id}>
                              {sceneStep < task.movesAt && <TaskRow task={task} />}
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>

              {/* Keep the well steady while the list moves into its centre. */}
              <div
                aria-hidden="true"
                className="col-start-1 row-start-2 h-75.5 @3xl:col-start-2 @3xl:row-start-1"
              />
              <motion.section
                layout
                className={`grid w-full min-w-0 gap-4 ${showListOnly ? "col-span-full col-start-1 row-span-2 row-start-1 self-center justify-self-center @3xl:row-span-1 @3xl:row-start-1 @3xl:max-w-md" : "col-start-1 row-start-2 @3xl:col-start-2 @3xl:row-start-1"}`}
                aria-label="My task list"
                data-zone="task-panel"
              >
                <div className="grid auto-rows-9 gap-1.5" data-zone="list">
                  {listTasks.map((task) => (
                    <div key={task.id} className="relative">
                      {sceneStep >= task.movesAt && (
                        <TaskRow
                          task={task}
                          date={
                            sceneStep >= weekLater
                              ? task.nextWeekDate
                              : task.datedAt !== undefined && sceneStep >= task.datedAt
                                ? task.date
                                : undefined
                          }
                          completed={task.quadrant === 0 && sceneStep >= weekLater}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </motion.section>
            </div>
            <motion.div
              className="absolute right-0 bottom-0 flex gap-4"
              animate={{ opacity: showListOnly ? 0 : 1 }}
              transition={{ duration: 0.25 }}
              aria-hidden={showListOnly}
              aria-label="Delegation and removal destinations"
            >
              {destinations.map(({ id: destinationId, label, icon: Icon }) => {
                const arriving = tasks.find(
                  (task) => task.destination === destinationId && sceneStep === task.movesAt,
                );
                return (
                  <motion.div
                    key={destinationId}
                    data-zone={destinationId}
                    animate={{
                      backgroundColor: arriving ? "var(--color-zinc-100)" : "#00000000",
                    }}
                    className="relative flex items-center gap-1.5 rounded-md px-2 py-1.5 text-zinc-400"
                  >
                    <Icon aria-hidden="true" className="size-4 shrink-0 fill-zinc-400" />
                    <p>{label}</p>
                    <AnimatePresence>
                      {arriving && (
                        <motion.div
                          key={arriving.id}
                          className="absolute right-0 bottom-1 z-20 h-9 w-48"
                          exit={{ opacity: 0, scale: 0.1, y: 10 }}
                          transition={{ duration: 0.4 }}
                        >
                          <TaskRow task={arriving} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          </LayoutGroup>
        </motion.div>
      </figure>
    </MotionConfig>
  );
}
