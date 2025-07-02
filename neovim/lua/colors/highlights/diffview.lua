local M = {}

function M.get(t)
	local highlights = {
		FilePanelFileName = { fg = t.fg },
	}

	return highlights
end

return M
