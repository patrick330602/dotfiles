return {
	"neovim/nvim-lspconfig",
	dependencies = {
		"hrsh7th/cmp-nvim-lsp",
		{ "antosha417/nvim-lsp-file-operations", config = true },
		"stevearc/dressing.nvim",
		--mason
		"williamboman/mason.nvim",
		"williamboman/mason-lspconfig.nvim",
		"jay-babu/mason-null-ls.nvim",
		--cmp
		"hrsh7th/cmp-nvim-lsp",
		"hrsh7th/cmp-buffer",
		"hrsh7th/cmp-path",
		"hrsh7th/cmp-cmdline",
		"hrsh7th/nvim-cmp",
		--cmp extensions
		"onsails/lspkind.nvim", -- vs-code like pictograms
		"brenoprata10/nvim-highlight-colors",
		"windwp/nvim-autopairs",
		{ "saecki/crates.nvim", tag = "stable" },
	},
}
