local theme = require("pdfs.colors.themes")
local util = require("pdfs.colors.util")

local M = {}

function M.load()
	util.load(theme.setup())
end

M.colorscheme = M.load

return M
