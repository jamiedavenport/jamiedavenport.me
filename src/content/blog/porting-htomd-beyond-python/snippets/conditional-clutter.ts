function conditionalClutter(node: Node, stat: Stats): boolean {
  if (["#document", "html", "body", "main", "article"].includes(node.tag)) {
    return false;
  }
  const tokens = hints(node);
  if (intersects(tokens, REFERENCES) || node.attrs.get("role") === "note") {
    return false;
  }
  if (!intersects(tokens, NEGATIVE) || EVIDENCE.has(node.tag) || HEADINGS.has(node.tag)) {
    return false;
  }
  if (stat.density > 0.35 || stat.controls) {
    return true;
  }
  if (tokens.has("footer") && stat.density > 0.15) {
    return true;
  }
  if (node.tag === "aside" && !stat.code && !stat.cells) {
    return true;
  }
  if (!stat.blocks && stat.characters < 180) {
    return true;
  }
  if (tokens.has("comments") || tokens.has("comment")) {
    return (
      elements(node).filter((child) => {
        const childHints = hints(child);
        return childHints.has("comment") || childHints.has("reply");
      }).length >= 2
    );
  }
  return false;
}
