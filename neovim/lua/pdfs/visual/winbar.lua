local M = {}

local navic = require("nvim-navic")

M.info = function()
	return " %#WbLocation# " .. navic.get_location() .. " %#None#"
end

M.generate_winbar = function()
	local bufnr = vim.api.nvim_get_current_buf()
	local clients = vim.lsp.get_active_clients({ bufnr = bufnr })

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
		return ""
	end

	local winbar = {
		M.info(),
		"%=",
	}
	return table.concat(winbar)
end

-- Set up autocommands to update winbar
vim.api.nvim_create_autocmd({ "LspAttach" }, {
	callback = function()
		local value = "%{%v:lua.require('pdfs.visual.winbar').generate_winbar()%}"
		vim.opt_local.winbar = value
	end,
})

return M
