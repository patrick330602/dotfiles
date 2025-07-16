local M = {}

function M.get(t)
	local highlights = {
		TabLine = {
			bg = t.bgAlt,
			fg = t.fg,
		},
		TabLineSel = {
			bg = t.bg,
			fg = t.fg,
			bold = true,
		},
		TabLineGraph = {
			fg = t.bgHighlight,
			bg = t.bgAlt,
		},
		TabLineGraphSel = {
			fg = t.bgHighlight,
			bg = t.bg,
		},
		TabLineFill = {
			bg = t.bgHighlight,
		},
		TabLineTab = {
			fg = t.white,
			bg = t.orange,
		},
		TabLineTabSel = {
			fg = t.white,
			bg = t.orange,
			bold = true,
		},
	}

	return highlights
end

return M
