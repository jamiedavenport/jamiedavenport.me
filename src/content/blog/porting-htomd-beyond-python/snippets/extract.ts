import { convert } from "@jamiedavenport/htomd";

const url =
  "https://tailwindcss.com/blog/" +
  "tailwind-is-joining-shopify";

const response = await fetch(url);
if (!response.ok) {
  throw new Error("HTTP " + response.status);
}

const html = await response.text();
const markdown = convert(html);

console.log(markdown);
