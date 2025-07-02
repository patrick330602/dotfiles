local theme = require("colors.themes")
local util = require("colors.util")

local M = {}

function M.load()
	util.load(theme.setup())
end

return M
