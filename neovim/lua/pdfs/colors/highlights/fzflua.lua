local M = {}

--- Get extension configuration
--- @param t DaydreamPalette
function M.get(t)
	local highlights = {
		FzfLuaNormal = { bg = t.winShadeLighter },
		FzfLuaPreviewNormal = { bg = t.winShadeDarker },
		FzfLuaBorder = { fg = t.winShadeLighter, bg = t.winShadeLighter },
		FzfLuaPreviewBorder = { fg = t.winShadeDarker, bg = t.winShadeDarker },
		FzfLuaTitle = { bg = t.blue, fg = t.winShadeLighter },

		FzfLuaFzfMatch = { fg = t.cyan },
		FzfLuaFzfQuery = { fg = t.blue },
		FzfLuaFzfPrompt = { fg = t.fg },
		FzfLuaFzfGutter = { bg = t.bgAlt },
		FzfLuaFzfPointer = { fg = t.pink },
		FzfLuaFzfHeader = { fg = t.purple },
		FzfLuaFzfInfo = { fg = t.cyan },

		-- custom Fzf sections
		FzfLuaTransparentNormal = { bg = "NONE" },
		FzfLuaTransparentBorder = { fg = t.fg, bg = "NONE" },
	}

	return highlights
end

return M
