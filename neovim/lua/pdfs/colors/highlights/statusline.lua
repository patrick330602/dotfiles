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

		StFileName = { fg = t.fg },
		StFileNameCurrent = { fg = t.fg, bold = true },
		StFileNameFloating = { fg = t.white, bg = t.cyan },

		StExtInactive = { fg = "#bbbbbb", bg = "#d3d3d3" },
		StOil = { fg = "#ebb403", bg = "#d3d3d3" },
		StGit = { fg = "#F1502F", bg = "#d3d3d3" },
		StTelescope = { fg = "#2b2f77", bg = "#d3d3d3" },
		StMason = { fg = "#C1944A", bg = "#d3d3d3" },
		StUndoTree = { fg = t.black, bg = "#d3d3d3" },
		StLazy = { fg = "#2875E1", bg = "#d3d3d3" },
		StTrouble = { fg = t.black, bg = "#d3d3d3" },
		StTerm = { fg = t.orange, bg = "#d3d3d3" },
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
	}

	return highlights
end

return M
