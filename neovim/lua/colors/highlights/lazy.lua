local M = {}
local util = require("colors.util")

--- Get extension configuration
--- @param t DaydreamPalette
function M.get(t)
	local highlights = {
		LazyNormal = { bg = t.winShadeDarker },
		LazyH1 = { fg = t.blue, bold = true },
		LazyH2 = { fg = t.fg, bold = true },
		LazyButton = { fg = t.fg, bg = t.bgHighlight },
		LazyButtonActive = { fg = t.fg, bg = t.bgHighlight, bold = true },

		LazyProgressDone = { bold = true, fg = t.magenta },
		LazyProgressTodo = { bold = true, fg = t.grey },

		LazyReasonCmd = { fg = t.yellow },
		LazyReasonEvent = { fg = t.magenta },
		LazyReasonKeys = { fg = t.cyan },
		LazyReasonPlugin = { fg = t.green },
		LazyReasonRequire = { fg = t.orange },
		LazyReasonRuntime = { fg = t.red },
		LazyReasonStart = { fg = t.blue },
		LazySpecial = { fg = t.cyan },

		Bold = { fg = t.grey, bold = true, italic = true },
	}
	return highlights
end

return M
