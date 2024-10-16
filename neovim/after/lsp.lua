local function set_keymap(mode, lhs, rhs, desc, opts)
	opts = opts or {}
	opts.desc = desc
	vim.keymap.set(mode, lhs, rhs, opts)
end

require("nvim-autopairs").setup()
require("crates").setup({
	completion = {
		cmp = {
			enabled = true,
		},
	},
})

local cmp = require("cmp")
local lspkind = require("lspkind")
local mason = require("mason")
local lspconfig = require("lspconfig")
local mason_lspconfig = require("mason-lspconfig")
local cmp_nvim_lsp = require("cmp_nvim_lsp")
local null_ls = require("null-ls")

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
local capabilities =
	vim.tbl_deep_extend("force", {}, vim.lsp.protocol.make_client_capabilities(), cmp_nvim_lsp.default_capabilities())

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
		"pyright",
		"clangd",
	},
	handlers = {
		function(server_name) -- default handler (optional)
			lspconfig[server_name].setup({
				capabilities = capabilities,
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
		null_ls.builtins.formatting.prettier,
		null_ls.builtins.diagnostics.pylint,
		null_ls.builtins.diagnostics.rpmspec,
	},
})

require("mason-null-ls").setup({
	ensure_installed = nil,
	automatic_installation = true,
})

cmp.setup({
	completion = {
		completeopt = "menu,menuone,preview,noselect",
	},
	mapping = cmp.mapping.preset.insert({
		["<C-k>"] = cmp.mapping.select_prev_item(), -- previous suggestion
		["<C-j>"] = cmp.mapping.select_next_item(), -- next suggestion
		["<C-b>"] = cmp.mapping.scroll_docs(-4),
		["<C-f>"] = cmp.mapping.scroll_docs(4),
		["<C-Space>"] = cmp.mapping.complete(), -- show completion suggestions
		["<C-e>"] = cmp.mapping.abort(), -- close completion window
		["<CR>"] = cmp.mapping.confirm({ select = false }),
	}),
	-- sources for autocompletion
	sources = cmp.config.sources({
		{ name = "nvim_lsp" },
		{ name = "buffer" }, -- text within current buffer
		{ name = "path" }, -- file system paths
		{ name = "crates" },
	}),

	-- configure lspkind for vs-code like pictograms in completion menu
	formatting = {
		format = lspkind.cmp_format({
			maxwidth = 50,
			ellipsis_char = "...",
			before = function(entry, item)
				return require("nvim-highlight-colors").format(entry, item)
			end,
		}),
	},
})
local cmp_autopairs = require("nvim-autopairs.completion.cmp")
cmp.event:on("confirm_done", cmp_autopairs.on_confirm_done())
