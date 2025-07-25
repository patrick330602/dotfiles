local M = {}
local util = require("colors.util")

--- Get extension configuration
function M.get(t)
	local highlights = {
		BlinkCmpMenu = { link = "Pmenu" },
		BlinkCmpMenuBorder = { fg = util.blend(t.bgHighlight, t.grey, 0.7) },
		BlinkCmpMenuSelection = { bg = t.bgHighlight },
		BlinkCmpLabel = { link = "Normal" },
		BlinkCmpLabelDeprecated = { fg = t.grey, strikethrough = true },
		BlinkCmpLabelMatch = { fg = t.cyan },
		BlinkCmpDoc = { link = "NormalFloat" },
		BlinkCmpDocBorder = { link = "BlinkCmpMenuBorder" },
		BlinkCmpDocCursorLine = { link = "Visual" },
		BlinkCmpSignatureHelp = { link = "NormalFloat" },
		BlinkCmpSignatureHelpBorder = { link = "BlinkCmpMenuBorder" },
		BlinkCmpSignatureHelpActiveParameter = { fg = t.cyan },

		-- Kinds
		BlinkCmpKindText = { fg = t.green },
		BlinkCmpKindMethod = { fg = t.blue },
		BlinkCmpKindFunction = { fg = t.blue },
		BlinkCmpKindConstructor = { fg = t.purple },

		BlinkCmpKindField = { fg = t.green },
		BlinkCmpKindVariable = { fg = t.orange },
		BlinkCmpKindProperty = { fg = t.red },

		BlinkCmpKindClass = { fg = t.blue },
		BlinkCmpKindInterface = { fg = t.blue },
		BlinkCmpKindStruct = { fg = t.blue },
		BlinkCmpKindModule = { fg = t.blue },

		BlinkCmpKindUnit = { fg = t.orange },
		BlinkCmpKindValue = { fg = t.orange },
		BlinkCmpKindEnum = { fg = t.orange },
		BlinkCmpKindEnumMember = { fg = t.orange },

		BlinkCmpKindKeyword = { fg = t.magenta },
		BlinkCmpKindConstant = { fg = t.pink },

		BlinkCmpKindSnippet = { fg = t.green },
		BlinkCmpKindColor = { fg = t.green },
		BlinkCmpKindFile = { fg = t.green },
		BlinkCmpKindReference = { fg = t.green },
		BlinkCmpKindFolder = { fg = t.green },
		BlinkCmpKindEvent = { fg = t.green },
		BlinkCmpKindOperator = { fg = t.magenta },
		BlinkCmpKindTypeParameter = { fg = t.pink },
	}

	return highlights
end

return M
