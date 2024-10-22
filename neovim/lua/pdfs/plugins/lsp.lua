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
			dependencies = "rafamadriz/friendly-snippets",

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
