local M = {}
local util = require("colors.util")

--- Get extension configuration
--- @param t DaydreamPalette
function M.get(t)
	local highlights = {
		CmdBlue = { fg = t.blue },
		CmdViolet = { fg = t.purple },
		CmdBlueBg = { fg = t.white, bg = t.blue },
		CmdVioletBg = { fg = t.white, bg = t.purple },
		CmdYellow = { fg = t.yellow },
		CmdOrange = { fg = t.orange },
		CmdOrangeBg = { fg = t.black, bg = t.orange },
		CmdYellowBg = { fg = t.black, bg = t.yellow },
		CmdGreenBg = { fg = t.white, bg = t.green },
	}

	return highlights
end

return M
