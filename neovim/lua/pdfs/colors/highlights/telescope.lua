local M = {}

--- Get extension configuration
--- @param t DaydreamPalette
function M.get(t)
	local highlights = {
		TelescopeBorder = { fg = t.bgHighlight },
		TelescopePromptTitle = { fg = t.blue },
		TelescopeResultsTitle = { fg = t.cyan },
		TelescopePromptPrefix = { fg = t.pink },
		TelescopePreviewTitle = { fg = t.magenta },
		TelescopeSelection = { bg = t.bgHighlight },
		TelescopePromptCounter = { fg = t.pink },
		TelescopeMatching = { fg = t.cyan },
	}

	return highlights
end

return M
