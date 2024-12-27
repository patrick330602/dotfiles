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
		--- vscode cmp extension
		"onsails/lspkind.nvim",
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
		{ "brenoprata10/nvim-highlight-colors", opts = { render = "virtual" } },
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
	},
}
