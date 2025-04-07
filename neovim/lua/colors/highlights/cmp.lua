local M = {}

--- Get extension configuration
--- @param t DaydreamPalette
function M.get(t)
	local highlights = {
		CmpDocumentation = { fg = t.grey, bg = t.bg },
		CmpDocumentationBorder = { fg = t.grey, bg = t.bg },
		CmpGhostText = { fg = t.grey, bg = t.bg },

		CmpItemAbbr = { fg = t.fg, bg = t.bg },

		CmpItemAbbrDeprecated = { fg = t.grey, bg = t.bg, strikethrough = true },
		CmpItemAbbrMatch = { fg = t.purple, bg = t.bg },
		CmpItemAbbrMatchFuzzy = { link = "CmpIntemAbbrMatch" },

		CmpItemKindVariable = { fg = t.cyan, bg = t.bg },
		CmpItemKindInterface = { link = "CmpItemKindVariable" },
		CmpItemKindText = { link = "CmpItemKindVariable" },
		CmpItemKindFunction = { fg = t.pink, bg = t.bg },
		CmpItemKindMethod = { link = "CmpItemKindFunction" },
		CmpItemKindKeyword = { fg = t.fg, bg = t.bg },
		CmpItemKindProperty = { link = "CmpItemKindKeyword" },
		CmpItemKindUnit = { link = "CmpItemKindKeyword" },
		CmpItemMenu = { fg = t.grey, bg = t.bgAlt },
		CmpItemKindDefault = { fg = t.grey, bg = t.bgAlt },
	}

	return highlights
end
return M
