return {
	--notifications
	"j-hui/fidget.nvim",
	--definitions
	"neovim/nvim-lspconfig",
	--
	{
		"mason-org/mason.nvim",
		opts = {
			ui = {
				icons = {
					package_installed = "✓",
					package_pending = "➜",
					package_uninstalled = "✗"
				}
			}
		}
	},
	{
		"mason-org/mason-lspconfig.nvim",
		opts = {
			ensure_installed = {
				'basedpyright',
				'bashls',
				'dockerls',
				'eslint',
				'gopls',
				'jsonls',
				'lua_ls',
				'ts_ls',
				'lemminx',
				'yamlls',
				'rust_analyzer'
			}
		},
	},
	--cmp
	{
		"saghen/blink.cmp",
		version = "1.*",
		dependencies = {
			"rafamadriz/friendly-snippets",
			"onsails/lspkind.nvim",
		},
		opts_extend = { "sources.default" },
	},
	{
		"saghen/blink.compat",
		version = "*",
		lazy = true,
		opts = {}
	},
	-- extensions
	---langauges
	{
		"Jezda1337/nvim-html-css",
		dependencies = { "saghen/blink.cmp", "nvim-treesitter/nvim-treesitter" },
		opts = {
			enable_on = {
				"html",
				"htmldjango",
				"tsx",
				"jsx",
				"erb",
				"svelte",
				"vue",
				"blade",
				"php",
				"templ",
				"astro",
			},
			handlers = {
				definition = {
					bind = "gd"
				},
				hover = {
					bind = "K",
					wrap = true,
					border = "none",
					position = "cursor",
				},
			},
			documentation = {
				auto_show = true,
			},
			style_sheets = {
			},
		},
	},
	{
		'nvim-java/nvim-java',
		commit = 'd25bc1c55b4cea53f6174b2e2171ed8519113bc5',
		opt = {
			jdk = {
				version = "21.0.2",
			}
		},
	},
	{
		"folke/lazydev.nvim",
		ft = "lua",
		opts = {
			library = {
				{ path = "${3rd}/luv/library", words = { "vim%.uv" } },
			},
		},
	},
	{
		"mrcjkb/rustaceanvim",
		version = "^6",
		lazy = false,
	},
	--- others
	{
		"kevinhwang91/nvim-ufo",
		dependencies = "kevinhwang91/promise-async",
		event = "BufRead",
	},
	"b0o/schemastore.nvim",
	{
		"saecki/crates.nvim",
		event = { "BufRead Cargo.toml" },
		tag = "stable",
		opts = {
			completion = {
				cmp = {
					enabled = true,
				},
			},
			lsp = {
				enabled = true,
				actions = true,
				completion = true,
				hover = true,
			},
		},
	},
	{ "soulis-1256/eagle.nvim", config = true },
}
