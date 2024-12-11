local M = {}
local util = require("pdfs.colors.util")

--- Get extension configuration
--- @param t DaydreamPalette
function M.get(t)
	local highlights = {

		StNormalMode = { fg = t.white, bg = t.blue },
		StNTerminalMode = { fg = t.white, bg = util.blend(t.blue, t.orange, 0.8) },
		StInsertMode = { fg = t.white, bg = t.green },
		StVisualMode = { fg = t.white, bg = t.magenta },
		StTerminalMode = { fg = t.white, bg = t.orange },
		StReplaceMode = { fg = t.white, bg = t.red },
		StSelectMode = { fg = t.white, bg = t.cyan },
		StCommandMode = { fg = t.white, bg = t.black },
		StConfirmMode = { fg = t.black, bg = t.white },

		StOil = { fg = t.bgAlt, bg = "#ebb403" },
		StGit = { fg = t.white, bg = "#F1502F" },
		StTelescope = { fg = t.white, bg = "#2b2f77" },
		StCopilotChat = { fg = t.white, bg = "#a371f7" },
		StMason = { fg = t.white, bg = "#C1944A" },
		StUndoTree = { fg = t.green, bg = t.black },
		StLazy = { fg = t.white, bg = "#2875E1" },
		StTrouble = { fg = t.bgAlt, bg = t.fg },
		StTerm = { link = "StTerminalMode" },
		StTermNum = { fg = t.bgAlt, bg = t.fg },
		StDiffFile = { link = "StGit" },

		StLspError = { fg = t.red },
		StLspWarning = { fg = t.orange },
		StLspHints = { fg = t.cyan },
		StLspInfo = { fg = t.blue },

		StGitBranch = { fg = t.cyan },
		StGitAdd = { fg = t.green },
		StGitChange = { fg = t.orange },
		StGitRemove = { fg = t.red },

		StPos = { fg = t.black, bg = "#d3d3d3" },

		StTabs = { fg = t.white, bg = t.orange },
		StTabActive = { fg = t.orange, bg = t.white, bold = true },
	}

	return highlights
end

return M
