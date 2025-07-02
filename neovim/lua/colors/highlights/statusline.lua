local M = {}
local util = require("colors.util")

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

		StExtInactive = { fg = "#bbbbbb", bg = t.bgHighlight },
		StOil = { fg = "#ebb403", bg = t.bgHighlight },
		StGit = { fg = "#F1502F", bg = t.bgHighlight },
		StFzfLua = { fg = "#2b2f77", bg = t.bgHighlight },
		StMason = { fg = "#C1944A", bg = t.bgHighlight },
		StUndoTree = { fg = t.fg, bg = t.bgHighlight },
		StLazy = { fg = "#2875E1", bg = t.bgHighlight },
		StTrouble = { fg = t.fg, bg = t.bgHighlight },
		StTerm = { fg = t.orange, bg = t.bgHighlight },
		StDiffFile = { link = "StGit" },

		StLspError = { fg = t.red },
		StLspWarning = { fg = t.orange },
		StLspHints = { fg = t.cyan },
		StLspInfo = { fg = t.blue },

		StGitBranch = { fg = t.cyan },
		StGitAdd = { fg = t.green },
		StGitChange = { fg = t.orange },
		StGitRemove = { fg = t.red },

		StPos = { fg = t.fg, bg = t.bgHighlight },
	}

	return highlights
end

return M
