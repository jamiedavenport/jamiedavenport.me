fn clutter(tree: &Tree, id: Id, s: Stats) -> bool {
    let n = &tree.nodes[id];
    if has("#document html body main article", &n.tag) {
        return false;
    }
    let tokens = hints(n);
    if intersects(&tokens, REFERENCES) || n.attr("role") == "note" {
        return false;
    }
    if !intersects(&tokens, NEGATIVE) || has(EVIDENCE, &n.tag) || has(HEADINGS, &n.tag) {
        return false;
    }
    if s.density() > 0.35
        || s.controls > 0
        || tokens.contains("footer") && s.density() > 0.15
        || n.tag == "aside" && s.code == 0 && s.cells == 0
        || s.blocks == 0 && s.characters < 180
    {
        return true;
    }
    if intersects(&tokens, "comments comment") {
        return tree
            .elements(id)
            .iter()
            .filter(|&&c| intersects(&hints(&tree.nodes[c]), "comment reply"))
            .count()
            >= 2;
    }
    false
}
