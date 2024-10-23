local M = {}

--- Get extension configuration
--- @param t DaydreamPalette
function M.get(t)
	local highlights = {

		StNormalMode = { fg = t.white, bg = t.blue },
		StInsertMode = { fg = t.white, bg = t.green },
		StVisualMode = { fg = t.white, bg = t.magenta },
		StTerminalMode = { fg = t.white, bg = t.orange },
		StReplaceMode = { fg = t.white, bg = t.red },
		StSelectMode = { fg = t.white, bg = t.cyan },
		StCommandMode = { fg = t.white, bg = t.black },
		StConfirmMode = { fg = t.black, bg = t.white },

		StFileName = { fg = t.white, bg = t.grey },
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
