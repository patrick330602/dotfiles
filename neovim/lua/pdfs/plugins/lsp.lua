return {
	"neovim/nvim-lspconfig",
	dependencies = {
		"stevearc/dressing.nvim",
		--mason
		"williamboman/mason.nvim",
		"williamboman/mason-lspconfig.nvim",
		"jay-babu/mason-null-ls.nvim",
		--notifications
		"j-hui/fidget.nvim",
		--cmp
		"b0o/schemastore.nvim",
		{
			"saghen/blink.cmp",
			lazy = false,
			dependencies = {
				"L3MON4D3/LuaSnip",
				"saadparwaiz1/cmp_luasnip",
				{ "saghen/blink.compat", version = "*", opts = { impersonate_nvim_cmp = true } },
			},
			version = "v0.*",
		},
		{ "brenoprata10/nvim-highlight-colors", opts = { render = "virtual" } },
		{
			"saecki/crates.nvim",
			tag = "stable",
			opts = {
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
