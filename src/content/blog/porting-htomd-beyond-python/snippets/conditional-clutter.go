func clutter(n *node, s stats) bool {
	if set("#document html body main article")[n.tag] {
		return false
	}
	tokens := hints(n)
	if intersects(tokens, references) || n.attrs["role"] == "note" {
		return false
	}
	if !intersects(tokens, negative) || evidence[n.tag] || headings[n.tag] {
		return false
	}
	if s.density() > 0.35 || s.controls > 0 {
		return true
	}
	if tokens["footer"] && s.density() > 0.15 {
		return true
	}
	if n.tag == "aside" && s.code == 0 && s.cells == 0 {
		return true
	}
	if s.blocks == 0 && s.characters < 180 {
		return true
	}
	if tokens["comments"] || tokens["comment"] {
		count := 0
		for _, c := range elements(n) {
			t := hints(c)
			if t["comment"] || t["reply"] {
				count++
			}
		}
		return count >= 2
	}
	return false
}
