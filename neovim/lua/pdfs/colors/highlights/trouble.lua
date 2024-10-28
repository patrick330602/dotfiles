local M = {}
local util = require("pdfs.colors.util")

--- Get extension configuration
--- @param t DaydreamPalette
function M.get(t)
	local highlights = {
		TroubleCode = { fg = t.magenta },
		TroubleCount = { bg = t.bgHighlight, bold = true },
		TroubleDirectory = { fg = t.grey, bold = true },
		TroubleFilename = { fg = t.cyan },
		TroubleIconArray = { fg = t.pink },
		TroubleIconBoolean = { link = "Boolean" },
		TroubleIconConstant = { link = "Constant" },
		TroubleIconDirectory = { fg = t.blue },
		TroubleIconEvent = { link = "Special" },
		TroubleIconField = { link = "Boolean" },
		TroubleIconFile = { link = "Normal" },
		TroubleIconFunction = { link = "@function" },
		TroubleIndent = { link = "LineNr" },
		TroubleIndentFoldClosed = { link = "CursorLineNr" },
		TroublePos = { link = "LineNr" },
		TroublePreview = { link = "Visual" },
		TroubleSource = { link = "Comment" },
	}

	return highlights
end

return M
