local function set_keymap(mode, lhs, rhs, desc, opts)
	opts = opts or {}
	opts.desc = desc
	vim.keymap.set(mode, lhs, rhs, opts)
end

return {
	"neovim/nvim-lspconfig",
	event = { "BufReadPre", "BufNewFile" },
	dependencies = {
		"hrsh7th/cmp-nvim-lsp",
		{ "antosha417/nvim-lsp-file-operations", config = true },
		{ "folke/neodev.nvim", opts = {} },
	},
	config = function()
		local lspconfig = require("lspconfig")
		local mason_lspconfig = require("mason-lspconfig")
		local cmp_nvim_lsp = require("cmp_nvim_lsp")

		vim.api.nvim_create_autocmd("LspAttach", {
			group = vim.api.nvim_create_augroup("UserLspConfig", {}),
			callback = function(ev)
				local opts = { buffer = ev.buf, silent = true }
				set_keymap("n", "gR", "<cmd>Telescope lsp_references<CR>", "Show LSP references", opts)
				set_keymap("n", "gD", vim.lsp.buf.declaration, "Go to declaration", opts)
				set_keymap("n", "gd", "<cmd>Telescope lsp_definitions<CR>", "Show LSP definitions", opts)
				set_keymap("n", "gi", "<cmd>Telescope lsp_implementations<CR>", "Show LSP implementations", opts)
				set_keymap("n", "gt", "<cmd>Telescope lsp_type_definitions<CR>", "Show LSP type definitions", opts)
				set_keymap({ "n", "v" }, "<leader>ca", vim.lsp.buf.code_action, "See available code actions", opts)
				set_keymap("n", "<leader>rn", vim.lsp.buf.rename, "Smart rename", opts)
				set_keymap("n", "<leader>D", "<cmd>Telescope diagnostics bufnr=0<CR>", "Show buffer diagnostics", opts)
				set_keymap("n", "<leader>d", vim.diagnostic.open_float, "Show line diagnostics", opts)
				set_keymap("n", "[d", vim.diagnostic.goto_prev, "Go to previous diagnostic", opts)
				set_keymap("n", "]d", vim.diagnostic.goto_next, "Go to next diagnostic", opts)
				set_keymap("n", "K", vim.lsp.buf.hover, "Show documentation for what is under cursor", opts)
				set_keymap("n", "<leader>rs", ":LspRestart<CR>", "Restart LSP", opts)
			end,
		})

		-- used to enable autocompletion (assign to every lsp server config)
		local capabilities = cmp_nvim_lsp.default_capabilities()

		local signs = { Error = " ", Warn = " ", Hint = "󰠠 ", Info = " " }
		for type, icon in pairs(signs) do
			local hl = "DiagnosticSign" .. type
			vim.fn.sign_define(hl, { text = icon, texthl = hl, numhl = "" })
		end

		lspconfig.sourcekit.setup({
			capabilities = {
				workspace = {
					didChangeWatchedFiles = {
						dynamicRegistration = true,
					},
				},
			},
		})

		lspconfig.gopls.setup({})

		mason_lspconfig.setup_handlers({
			-- default handler for installed servers
			function(server_name)
				lspconfig[server_name].setup({
					capabilities = capabilities,
				})
			end,
			["rust_analyzer"] = function()
				-- configure rust language server
				lspconfig["rust_analyzer"].setup({
					capabilities = capabilities,
					settings = {
						["rust-analyzer"] = {
							checkOnSave = {
								command = "clippy",
							},
						},
					},
				})
			end,
			["tailwindcss"] = function()
				-- configure tailwindcss language server
				lspconfig["tailwindcss"].setup({
					capabilities = capabilities,
				})
			end,
			["svelte"] = function()
				-- configure svelte server
				lspconfig["svelte"].setup({
					capabilities = capabilities,
					on_attach = function(client, bufnr)
						vim.api.nvim_create_autocmd("BufWritePost", {
							pattern = { "*.js", "*.ts" },
							callback = function(ctx)
								-- Here use ctx.match instead of ctx.file
								client.notify("$/onDidChangeTsOrJsFile", { uri = ctx.match })
							end,
						})
					end,
				})
			end,
			["graphql"] = function()
				-- configure graphql language server
				lspconfig["graphql"].setup({
					capabilities = capabilities,
					filetypes = { "graphql", "gql", "svelte", "typescriptreact", "javascriptreact" },
				})
			end,
			["emmet_ls"] = function()
				-- configure emmet language server
				lspconfig["emmet_ls"].setup({
					capabilities = capabilities,
					filetypes = {
						"html",
						"typescriptreact",
						"javascriptreact",
						"css",
						"sass",
						"scss",
						"less",
						"svelte",
					},
				})
			end,
			["lua_ls"] = function()
				-- configure lua server (with special settings)
				lspconfig["lua_ls"].setup({
					capabilities = capabilities,
					settings = {
						Lua = {
							-- make the language server recognize "vim" global
							diagnostics = {
								globals = { "vim" },
							},
							completion = {
								callSnippet = "Replace",
							},
						},
					},
				})
			end,
		})
	end,
}
