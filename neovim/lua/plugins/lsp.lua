return {
	"neovim/nvim-lspconfig",
	dependencies = {
		"stevearc/dressing.nvim",
		--mason
		"williamboman/mason.nvim",
		"williamboman/mason-lspconfig.nvim",
		"WhoIsSethDaniel/mason-tool-installer.nvim",
		--notifications
		"j-hui/fidget.nvim",
		--cmp
		"hrsh7th/cmp-nvim-lsp",
		"hrsh7th/cmp-buffer",
		"hrsh7th/cmp-path",
		"hrsh7th/nvim-cmp",
		-- extensions
		--- luasnip cmp extension
		"saadparwaiz1/cmp_luasnip",
		"L3MON4D3/LuaSnip",
		"rafamadriz/friendly-snippets",
		---langauges
		{
			"folke/lazydev.nvim",
			ft = "lua", -- only load on lua files
			opts = {
				library = {
					{ path = "${3rd}/luv/library", words = { "vim%.uv" } },
				},
			},
		},
		{
			"ray-x/go.nvim",
			dependencies = {
				"ray-x/guihua.lua",
			},
			config = true,
			event = { "CmdlineEnter" },
			ft = { "go", "gomod" },
			build = ':lua require("go.install").update_all_sync()',
		},
		{
			"mrcjkb/rustaceanvim",
			version = "^5",
			lazy = false,
		},
		--- cmp theming
		{
			"xzbdmw/colorful-menu.nvim",
			opts = {
				ls = {
					gopls = {
						add_colon_before_type = true,
					},
				},
			},
		},
		--- others
		{
			"kevinhwang91/nvim-ufo",
			dependencies = "kevinhwang91/promise-async",
			event = "BufRead",
		},
		"b0o/schemastore.nvim",
		{
			"windwp/nvim-autopairs",
			event = "InsertEnter",
			config = true,
		},
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
	},
}
