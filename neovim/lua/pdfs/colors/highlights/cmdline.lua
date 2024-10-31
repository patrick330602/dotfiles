local M = {}
local util = require("pdfs.colors.util")

--- Get extension configuration
--- @param t DaydreamPalette
function M.get(t)
	local highlights = {
		CmdBlue = { fg = t.blue },
		CmdViolet = { fg = t.purple },
		CmdBlueBg = { fg = t.white, bg = t.blue },
		CmdVioletBg = { fg = t.white, bg = t.purple },
	}

	return highlights
end

return M
