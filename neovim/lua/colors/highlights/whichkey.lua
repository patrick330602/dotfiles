local M = {}

function M.get(t)
	local highlights = {
		WhichKey = { fg = t.cyan },
		WhichKeyGroup = { fg = t.blue },
		WhichKeyDesc = { fg = t.pink },
		WhichKeySeperator = { fg = t.bg },
		WhichKeyFloat = { bg = t.bg },
		WhichKeyValue = { fg = t.blue },
	}

	return highlights
end

return M
