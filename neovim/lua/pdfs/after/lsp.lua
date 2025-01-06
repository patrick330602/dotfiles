local function set_keymap(mode, lhs, rhs, desc, opts)
	opts = opts or {}
	opts.desc = desc
	vim.keymap.set(mode, lhs, rhs, opts)
end

local cmp = require("cmp")
local mason = require("mason")
local lspconfig = require("lspconfig")
local mason_lspconfig = require("mason-lspconfig")
local mason_tool_installer = require("mason-tool-installer")
local cmp_nvim_lsp = require("cmp_nvim_lsp")
local navic = require("nvim-navic")
local cmp_autopairs = require("nvim-autopairs.completion.cmp")

require("fidget").setup({
	notification = {
		window = {
			winblend = 0,
		},
	},
})

-- I like hint inlay
vim.lsp.inlay_hint.enable()

vim.api.nvim_create_autocmd("LspAttach", {
	group = vim.api.nvim_create_augroup("UserLspConfig", {}),
	callback = function(ev)
		local opts = { buffer = ev.buf, silent = true }
		set_keymap("n", "gR", "<cmd>FzfLua lsp_references<CR>", "Show LSP references", opts)
		set_keymap("n", "gD", vim.lsp.buf.declaration, "Go to declaration", opts)
		set_keymap("n", "gd", "<cmd>FzfLua lsp_definitions<CR>", "Show LSP definitions", opts)
		set_keymap("n", "gi", "<cmd>FzfLua lsp_implementations<CR>", "Show LSP implementations", opts)
		set_keymap("n", "gt", "<cmd>FzfLua lsp_typedefs<CR>", "Show LSP type definitions", opts)
		set_keymap({ "n", "v" }, "<leader>ca", "<cmd>FzfLua lsp_code_actions<CR>", "See available code actions", opts)
		set_keymap("n", "<leader>rn", vim.lsp.buf.rename, "Smart rename", opts)
		set_keymap("n", "<leader>D", "<cmd>FzfLua diagnostics_document<CR>", "Show buffer diagnostics", opts)
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

local on_attach = function(client, bufnr)
	if client.server_capabilities.documentSymbolProvider then
		navic.attach(client, bufnr)
	end
end

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

mason_tool_installer.setup({
	ensure_installed = {
		-- lsp
		"lua_ls",
		"rust_analyzer",
		-- "gopls",
		"basedpyright",
		"dockerls",
		"yamlls",
		"nim_langserver",
		"bashls",
		"clangd",
		"ts_ls",
		"eslint",
		"jsonls",
		-- formatting
		"beautysh",
		"prettier",
		"stylua",
		"isort",
		"black",
		"clang-format",
		"goimports",
		"gofumpt",
	},
	auto_update = true,
})

vim.g.rustaceanvim = {
	server = {
		capabilities = capabilities,
		on_attach = on_attach,
		settings = {
			["rust-analyzer"] = {
				diagnostics = {
					styleLints = {
						enable = true,
					},
				},
			},
		},
	},
}

mason_lspconfig.setup({
	handlers = {
		function(server_name)
			lspconfig[server_name].setup({
				capabilities = capabilities,
				on_attach = on_attach,
			})
		end,
		["rust_analyzer"] = function() end,
		["jsonls"] = function()
			lspconfig.jsonls.setup({
				capabilities = capabilities,
				on_attach = on_attach,
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
				on_attach = on_attach,
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
				on_attach = on_attach,
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
				on_attach = on_attach,
				filetypes = { "sh", "bash", "rc" },
			})
		end,
		["eslint"] = function()
			lspconfig.eslint.setup({
				capabilities = capabilities,
				on_attach = function(client, bufnr)
					if client.server_capabilities.documentSymbolProvider then
						navic.attach(client, bufnr)
					end
					vim.api.nvim_create_autocmd("BufWritePre", {
						buffer = bufnr,
						command = "EslintFixAll",
					})
				end,
			})
		end,
		["lua_ls"] = function()
			lspconfig.lua_ls.setup({
				capabilities = capabilities,
				on_attach = on_attach,
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

cmp.setup({
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
		{ name = "lazydev", group_index = 0 },
		{ name = "nvim_lsp" },
		{ name = "luasnip" },
		{ name = "buffer" },
		{ name = "path" },
		{ name = "crates" },
	}),
	snippet = {
		expand = function(args)
			require("luasnip").lsp_expand(args.body)
		end,
	},

	formatting = {
		fields = { "kind", "abbr", "menu" },
		expandable_indicator = "...",
		format = function(entry, vim_item)
			local highlights_info = require("colorful-menu").cmp_highlights(entry)

			if highlights_info ~= nil then
				vim_item.abbr_hl_group = highlights_info.highlights
				vim_item.abbr = highlights_info.text
			end

			return vim_item
		end,
	},
})

cmp.event:on("confirm_done", cmp_autopairs.on_confirm_done())

cmp.event:on("menu_opened", function()
	vim.b.copilot_suggestion_hidden = true
end)

cmp.event:on("menu_closed", function()
	vim.b.copilot_suggestion_hidden = false
end)
