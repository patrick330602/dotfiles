local M = {}
function M.setup()
	local theme = {}
local t = {
		none = "NONE",
		bg = "#0f1419",
		bgAlt = "#111823",
		bgHighlight = "#1a2332",
		fg = "#d4dce6",
		grey = "#6b7d8f",
		blue = "#7fb3d3",
		green = "#5d8a72",
		cyan = "#4a9b9b",
		red = "#c17a6b",
		yellow = "#d4a574",
		magenta = "#8b7ca6",
		pink = "#a67c9a",
		orange = "#d49c6b",
		purple = "#8b7ca6",
		white = "#d4dce6",
		black = "#0f1419",
		error = "#b85c4a",
		warning = "#c4965a",
		info = "#6b8fa3",
		hint = "#5a7a8f",
		todo = "#4a7a5f",
		signAdd = "#4a6b3a",
		signChange = "#4a6b8f",
		signDelete = "#b85c4a",
		cursorFg = "#0f1419",
		cursorBg = "#c4d1dc",
		accentBlue = "#141a26",
		accentGreen = "#16201a",
		accentRed = "#1f1a16",
		winShadeLighter = "#1e252e",
		winShadeDarker = "#0d1116",
	}

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
