import { getCollection } from "astro:content";

export async function getPosts({ includeDrafts = false } = {}) {
  const posts = await getCollection("blog", ({ data }) => includeDrafts || !data.draft);

  return posts.toSorted(
    (a, b) =>
      b.data.publishedAt.getTime() - a.data.publishedAt.getTime() || a.id.localeCompare(b.id),
  );
}

export function postURL(id: string) {
  return `/blog/${id.split("/").map(encodeURIComponent).join("/")}/`;
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
