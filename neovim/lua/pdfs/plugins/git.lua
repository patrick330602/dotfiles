return {
	{ "lewis6991/gitsigns.nvim" },
	{
		"sindrets/diffview.nvim",
		dependencies = { "nvim-tree/nvim-web-devicons" },
		opts = { enhanced_diff_hl = true },
		cmd = {
			"DiffviewFileHistory",
			"DiffviewOpen",
			"DiffviewToggleFiles",
			"DiffviewFocusFiles",
			"DiffviewRefresh",
		},
	},
	{
		"NeogitOrg/neogit",
		keys = {
			{ "<leader>G", "<cmd>Neogit<cr>", desc = "Open Neogit" },
		},
		opts = { graph_style = "kitty", disable_hint = true },
		dependencies = {
			"nvim-lua/plenary.nvim",
			"sindrets/diffview.nvim",
			"nvim-telescope/telescope.nvim",
		},
	},
}
