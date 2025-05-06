return {
	--notifications
	"j-hui/fidget.nvim",
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
