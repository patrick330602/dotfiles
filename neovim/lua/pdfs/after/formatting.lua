-- Table to store LSP servers that should format on save
local format_on_save_servers = {
	rust_analyzer = true,
	gopls = true,
	lua_ls = true,
	-- Add more servers here as needed
	-- example:
	-- tsserver = true,
	-- lua_ls = true,
}

-- Function to format current buffer
local function format_buffer(bufnr)
	bufnr = bufnr or vim.api.nvim_get_current_buf()
	vim.lsp.buf.format({
		bufnr = bufnr,
		timeout_ms = 3000, -- Adjust timeout as needed
	})
end

-- Function to format buffer on save
local function format_on_save(client, bufnr)
	if client.server_capabilities.documentFormattingProvider then
		vim.api.nvim_create_autocmd("BufWritePre", {
			group = vim.api.nvim_create_augroup("LspFormat." .. client.name, { clear = true }),
			buffer = bufnr,
			callback = function()
				vim.lsp.buf.format({
					bufnr = bufnr,
					timeout_ms = 3000, -- Adjust timeout as needed
				})
			end,
		})
	end
end

-- Set up format on save for specific LSP servers
vim.api.nvim_create_autocmd("LspAttach", {
	group = vim.api.nvim_create_augroup("UserLspConfig", { clear = true }),
	callback = function(args)
		local client = vim.lsp.get_client_by_id(args.data.client_id)
		local bufnr = args.buf

		-- Check if the attached server should format on save
		if format_on_save_servers[client.name] then
			format_on_save(client, bufnr)
		end
	end,
})

-- Create Format command
vim.api.nvim_create_user_command("Format", function()
	format_buffer()
end, {})

-- Create keymap for format
vim.keymap.set("n", "<leader>f", ":Format<CR>", {
	noremap = true,
	silent = true,
	desc = "Format current buffer",
})
