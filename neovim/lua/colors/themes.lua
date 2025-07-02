local colors = require("colors.colors")

local M = {}
function M.setup()
	local theme = {}
	---@type DaydreamPalette
	local t = colors.default

	vim.g.terminal_color_0 = t.bg
	vim.g.terminal_color_8 = t.bgAlt

	vim.g.terminal_color_7 = t.fg
	vim.g.terminal_color_15 = t.grey

	vim.g.terminal_color_1 = t.red
	vim.g.terminal_color_9 = t.red

	vim.g.terminal_color_2 = t.green
	vim.g.terminal_color_10 = t.green

	vim.g.terminal_color_3 = t.yellow
	vim.g.terminal_color_11 = t.yellow

	vim.g.terminal_color_4 = t.blue
	vim.g.terminal_color_12 = t.blue

	vim.g.terminal_color_5 = t.purple
	vim.g.terminal_color_13 = t.purple

	vim.g.terminal_color_6 = t.cyan
	vim.g.terminal_color_14 = t.cyan

	-- Load base theme
	theme.highlights = require("colors.highlights.base").get(t)

	-- Load extensions dynamically from the colors.highlights folder
	local highlights_path = vim.fn.stdpath("config") .. "/lua/colors/highlights"
	local files = vim.fn.readdir(highlights_path)
	for _, file in ipairs(files) do
		if file ~= "." and file ~= ".." and file ~= "base.lua" then
			local extension = file:match("(.+)%..+$")
			if extension then
				local ext = require("colors.highlights." .. extension)
				theme.highlights = vim.tbl_deep_extend("force", theme.highlights, ext.get(t))
			end
		end
	end

	return theme
end

return M
