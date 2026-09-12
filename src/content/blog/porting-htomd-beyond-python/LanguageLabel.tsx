import pythonLogo from "./assets/python.svg?url";
import typescriptLogo from "./assets/typescript.svg?url";
import goLogo from "./assets/go.svg?url";
import markdownLogo from "./assets/markdown.svg?url";
import rustLogo from "../introducing-htomd/assets/rust.svg?url";

// Devicon v2.17.0: https://github.com/devicons/devicon/tree/v2.17.0/icons
// MIT license in assets/LICENSE.devicon; Rust reuses the original post's asset.
const logos: Record<string, string> = {
  Python: pythonLogo,
  TypeScript: typescriptLogo,
  Go: goLogo,
  Rust: rustLogo,
  Markdown: markdownLogo,
};

export default function LanguageLabel({ language }: { language: string }) {
  return (
    <span className="not-prose inline-flex items-baseline gap-1.5 whitespace-nowrap">
      <img
        src={logos[language]}
        alt=""
        width="20"
        height="20"
        className="size-5 shrink-0 self-center object-contain sm:size-4"
      />
      <span>{language}</span>
    </span>
  );
}
