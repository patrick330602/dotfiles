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
		opts = {
			graph_style = "kitty",
			disable_hint = true,
			kind = "floating",
			commit_editor = {
				kind = "floating",
				staged_diff_split_kind = "split",
			},
			commit_select_view = {
				kind = "floating",
			},
			commit_view = {
				kind = "vsplit",
			},
			log_view = {
				kind = "floating",
			},
			rebase_editor = {
				kind = "auto",
			},
			reflog_view = {
				kind = "floating",
			},
			merge_editor = {
				kind = "auto",
			},
			description_editor = {
				kind = "auto",
			},
			tag_editor = {
				kind = "auto",
			},
			preview_buffer = {
				kind = "floating_console",
			},
			popup = {
				kind = "floating",
			},
			stash = {
				kind = "floating",
			},
			refs_view = {
				kind = "floating",
			},
			signs = {
				-- { CLOSED, OPENED }
				hunk = { "", "" },
				item = { ">", "v" },
				section = { ">", "v" },
			},
		},
		dependencies = {
			"nvim-lua/plenary.nvim",
			"sindrets/diffview.nvim",
			"nvim-telescope/telescope.nvim",
		},
	},
}
