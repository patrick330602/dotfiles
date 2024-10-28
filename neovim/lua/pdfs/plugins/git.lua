return {
	{ "lewis6991/gitsigns.nvim" },
	{
		"sindrets/diffview.nvim",
		dependencies = { "nvim-tree/nvim-web-devicons" },
		-- lazy, only load diffview by these commands
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
		dependencies = {
			"nvim-lua/plenary.nvim",
			"sindrets/diffview.nvim",
			"nvim-telescope/telescope.nvim",
		},
	},
}
