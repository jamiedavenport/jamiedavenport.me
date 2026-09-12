def conditional_clutter(node: Node, stat: Stats) -> bool:
    if node.tag in {"#document", "html", "body", "main", "article"}:
        return False
    tokens = hints(node)
    if tokens & REFERENCES or node.attrs.get("role") == "note":
        return False
    if not tokens & NEGATIVE or node.tag in EVIDENCE | HEADINGS:
        return False
    # Class hints alone never delete a node: require structural corroboration.
    if stat.density > 0.35 or stat.controls:
        return True
    if "footer" in tokens and stat.density > 0.15:
        return True
    if node.tag == "aside" and not stat.code and not stat.cells:
        return True
    if stat.blocks == 0 and stat.characters < 180:
        return True
    if tokens & {"comments", "comment"}:
        children = elements(node)
        return sum(bool(hints(child) & {"comment", "reply"}) for child in children) >= 2
    return False
