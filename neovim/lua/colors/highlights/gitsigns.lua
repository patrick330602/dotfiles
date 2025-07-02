local M = {}
local util = require("colors.util")

--- Get extension configuration
--- @param t DaydreamPalette
function M.get(t)
	local highlights = {
		GitSignsAdd = { fg = t.green },
		GitSignsChange = { fg = t.orange },
		GitSignsDelete = { fg = t.red },

		GitSignsAddLn = { link = "DiffAdd" },
		GitSignsChangeLn = { link = "DiffChange" },
		GitSignsDeleteLn = { link = "DiffDelete" },

		GitSignsAddInline = { bg = util.blend(t.bg, t.green, 0.9) },
		GitSignsChangeInline = { bg = util.blend(t.bg, t.blue, 0.9) },
		GitSignsDeleteInline = { bg = util.blend(t.bg, t.red, 0.9) },

		GitSignsCurrentLineBlame = { link = "LineNr" },
	}

	return highlights
end

return M
