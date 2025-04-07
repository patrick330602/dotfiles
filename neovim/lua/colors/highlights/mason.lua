local M = {}
local util = require("colors.util")

--- Get extension configuration
--- @param t DaydreamPalette
function M.get(t)
	local highlights = {
		MasonNormal = { bg = t.winShadeDarker },
		MasonHeader = { fg = t.blue, bold = true },
		MasonHeaderSecondary = { fg = t.fg, bold = true },
		Bold = { fg = t.grey, bold = true, italic = true },
	}
	return highlights
end

return M
