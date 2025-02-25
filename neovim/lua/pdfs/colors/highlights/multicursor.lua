local M = {}

--- Get extension configuration
--- @param t DaydreamPalette
function M.get(t)
	local highlights = {
		MultiCursorCursor = { link = "Cursor" },
		MultiCursorVisual = { link = "Visual" },
		MultiCursorSign = { link = "SignColumn" },
		MultiCursorDisabledCursor = { link = "Visual" },
		MultiCursorDisabledVisual = { link = "Visual" },
		MultiCursorDisabledSign = { link = "SignColumn" },
	}

	return highlights
end

return M
