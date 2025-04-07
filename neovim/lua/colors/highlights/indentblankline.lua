local M = {}
local util = require("colors.util")

--- Get extension configuration
--- @param t DaydreamPalette
function M.get(t)
	local highlights = {
		IblIndent = { fg = util.blend(t.bgHighlight, t.bgAlt, 0.3) },
		IblScope = { fg = t.bgHighlight },
	}

	return highlights
end

return M
