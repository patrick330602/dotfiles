local M = {}

local navic = require("nvim-navic")
local devicons = require("nvim-web-devicons")
local utils = require("pdfs.visual.utils")
local constants = require("pdfs.visual.constants")

local function get_buf_name()
	local bufnr = vim.api.nvim_get_current_buf()
	local name = vim.fn.bufname(bufnr)
	if name == "" then
		return " No Name"
	end

	local filename = vim.fn.fnamemodify(name, ":t")
	local extension = vim.fn.fnamemodify(filename, ":e")
	local icon, icon_highlight = devicons.get_icon(filename, extension, { default = true })

	-- Set up highlight groups for the icon
	if icon_highlight and icon_highlight ~= "" then
		local fg = vim.fn.synIDattr(vim.fn.synIDtrans(vim.fn.hlID(icon_highlight)), "fg")
		local normal_hl = icon_highlight .. "WinBar"

		vim.api.nvim_set_hl(0, normal_hl, {
			fg = fg,
			bg = vim.fn.synIDattr(vim.fn.synIDtrans(vim.fn.hlID("WinBar")), "bg"),
		})

		return string.format("%%#%s#%s%%#WinBar# %s", normal_hl, icon, filename)
	end

	return string.format("%s %s", icon, filename)
end

M.info = function()
	local location = navic.get_location()
	if location and location ~= "" then
		return " %#WbLocation#" .. get_buf_name() .. " %#NavicSeparator#> " .. location .. " %#None#"
	end
	return " %#WbLocation#" .. get_buf_name() .. "%#None#"
end

M.generate_winbar = function()
	local bufnr = vim.api.nvim_get_current_buf()
	local clients = vim.lsp.get_clients({ bufnr = bufnr })

	-- Check if there are any active LSP clients except Copilot and null-ls
	local has_lsp = false
	for _, client in ipairs(clients) do
		if client.name ~= "copilot" and client.name ~= "null-ls" then
			has_lsp = true
			break
		end
	end

	-- Return empty string if no valid LSP client or navic not available
	if not has_lsp or not navic.is_available() then
		return " %#WbLocation#" .. get_buf_name() .. "%#None#"
	end

	local winbar = {
		M.info(),
		"%=",
	}
	return table.concat(winbar)
end

-- Set up autocommands to update winbar
vim.api.nvim_create_autocmd("BufEnter", {
	callback = function()
		local bufnr = vim.api.nvim_get_current_buf()
		local ft = vim.bo[bufnr].ft
		if utils.findValueByPrefix(constants.extensions, ft) then
			vim.opt_local.winbar = nil
		else
			local value = "%{%v:lua.require('pdfs.visual.winbar').generate_winbar()%}"
			vim.opt_local.winbar = value
		end
	end,
})

return M
