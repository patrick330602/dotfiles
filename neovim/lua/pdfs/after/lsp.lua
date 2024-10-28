local function set_keymap(mode, lhs, rhs, desc, opts)
	opts = opts or {}
	opts.desc = desc
	vim.keymap.set(mode, lhs, rhs, opts)
end

local mason = require("mason")
local lspconfig = require("lspconfig")
local mason_lspconfig = require("mason-lspconfig")
local null_ls = require("null-ls")
require("fidget").setup({})

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
local capabilities = vim.lsp.protocol.make_client_capabilities()

local signs = { Error = " ", Warn = " ", Hint = "󰠠 ", Info = " " }
for type, icon in pairs(signs) do
	local hl = "DiagnosticSign" .. type
	vim.fn.sign_define(hl, { text = icon, texthl = hl, numhl = "" })
end

-- enable mason and configure icons
mason.setup({
	ui = {
		icons = {
			package_installed = "✓",
			package_pending = "➜",
			package_uninstalled = "✗",
		},
	},
})

mason_lspconfig.setup({
	ensure_installed = {
		"lua_ls",
		"rust_analyzer",
		"gopls",
		"basedpyright",
		"dockerls",
		"yamlls",
		"nim_langserver",
		"bashls",
		"clangd",
		"eslint",
		"jsonls",
	},
	handlers = {
		function(server_name) -- default handler (optional)
			lspconfig[server_name].setup({
				capabilities = capabilities,
			})
		end,
		["jsonls"] = function()
			lspconfig.jsonls.setup({
				capabilities = capabilities,
				settings = {
					json = {
						schemas = require("schemastore").json.schemas(),
						validate = { enable = true },
					},
				},
			})
		end,
		["yamlls"] = function()
			lspconfig.yamlls.setup({
				capabilities = capabilities,
				settings = {
					yaml = {
						schemaStore = {
							enable = false,
							url = "",
						},
						schemas = require("schemastore").yaml.schemas(),
					},
				},
			})
		end,
		["gopls"] = function()
			lspconfig.gopls.setup({
				capabilities = capabilities,
				settings = {
					gopls = {
						analyses = {
							unusedparams = true,
						},
						staticcheck = true,
						gofumpt = true,
					},
				},
			})
		end,
		["bashls"] = function()
			lspconfig.bashls.setup({
				capabilities = capabilities,
				filetypes = { "sh", "bash", "rc" },
			})
		end,
		["eslint"] = function()
			lspconfig.eslint.setup({
				capabilities = capabilities,
				on_attach = function(client, bufnr)
					vim.api.nvim_create_autocmd("BufWritePre", {
						buffer = bufnr,
						command = "EslintFixAll",
					})
				end,
			})
		end,
		["rust_analyzer"] = function()
			lspconfig.rust_analyzer.setup({
				capabilities = capabilities,
				settings = {
					["rust-analyzer"] = {
						diagnostics = {
							styleLints = {
								enable = true,
							},
						},
					},
				},
			})
		end,
		["lua_ls"] = function()
			lspconfig.lua_ls.setup({
				capabilities = capabilities,
				settings = {
					Lua = {
						diagnostics = {
							globals = { "bit", "vim", "it", "describe", "before_each", "after_each" },
						},
					},
				},
			})
		end,
	},
})

null_ls.setup({
	sources = {
		null_ls.builtins.formatting.stylua,
		null_ls.builtins.formatting.black,
		null_ls.builtins.formatting.clang_format,
		null_ls.builtins.formatting.gofmt,
		null_ls.builtins.formatting.goimports,
		null_ls.builtins.formatting.isort,
		null_ls.builtins.diagnostics.rpmspec,
		null_ls.builtins.completion.spell,
	},
})

require("mason-null-ls").setup({
	ensure_installed = nil,
	automatic_installation = true,
})

require("blink.cmp").setup({
	highlight = {
		use_nvim_cmp_as_default = false,
	},
	sources = {
		providers = {
			{ "blink.cmp.sources.lsp",      name = "LSP" },
			{ "blink.cmp.sources.path",     name = "Path",     score_offset = 3 },
			{ "blink.cmp.sources.snippets", name = "Snippets", score_offset = -3 },
			{ "blink.cmp.sources.buffer",   name = "Buffer",   fallback_for = { "LSP" } },
		},
	},
	nerd_font_variant = "mono",
	accept = { auto_brackets = { enabled = true } },
	trigger = { signature_help = { enabled = true } },
	windows = {
		autocomplete = {
			border = "rounded",
		},
		documentation = {
			border = "rounded",
		},
		signature_help = {
			border = "rounded",
		},
	},
})
