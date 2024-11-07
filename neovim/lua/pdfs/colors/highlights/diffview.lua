local M = {}

--- Get extension configuration
--- @param t DaydreamPalette
function M.get(t)
	local highlights = {
		FilePanelFileName = { fg = t.fg },
	}

	return highlights
end

return M
