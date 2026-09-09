// One task list, followed from priority labels through scheduling to replanning.
export const exampleTasks = {
  pricing: { title: "Review pricing", priority: "High", date: undefined, effort: "2 hours" },
  proposal: {
    title: "Send client proposal",
    priority: "High",
    date: "Tomorrow",
    effort: "1 hour",
  },
  security: {
    title: "Finish SOC 2 security review",
    priority: "Medium",
    date: "Today",
    effort: "2 hours",
  },
  insurance: {
    title: "Renew car insurance",
    priority: "Medium",
    date: "Friday",
    effort: "30 min",
  },
  charts: {
    title: "Rebuild revenue chart",
    priority: "Low",
    date: undefined,
    effort: "1 week",
  },
  photos: {
    title: "Reorganise old photos",
    priority: "Low",
    date: undefined,
    effort: "2 days",
  },
  offline: { title: "Prototype offline mode" },
  holiday: { title: "Plan walking holiday" },
  room: { title: "Book meeting room" },
  travel: { title: "Book team travel" },
};

// The next week's plan, shared by the end of the matrix and the start of the chat.
export const nextWeekTasks = {
  pricing: { ...exampleTasks.pricing, date: "Today" },
  offline: { ...exampleTasks.offline, date: "Today" },
  holiday: { ...exampleTasks.holiday, date: "Tomorrow" },
};
