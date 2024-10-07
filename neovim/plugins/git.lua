return {
	{ "tpope/vim-fugitive" },
	{
		"NeogitOrg/neogit",
		dependencies = {
			"nvim-lua/plenary.nvim", -- required
			"sindrets/diffview.nvim", -- optional - Diff integration

			-- Only one of these is needed.
			"nvim-telescope/telescope.nvim", -- optional
		},
		config = true,
	},
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
		"isakbm/gitgraph.nvim",
		opts = {
			symbols = {
				merge_commit = "",
				commit = "",
				merge_commit_end = "",
				commit_end = "",

				-- Advanced symbols
				GVER = "",
				GHOR = "",
				GCLD = "",
				GCRD = "╭",
				GCLU = "",
				GCRU = "",
				GLRU = "",
				GLRD = "",
				GLUD = "",
				GRUD = "",
				GFORKU = "",
				GFORKD = "",
				GRUDCD = "",
				GRUDCU = "",
				GLUDCD = "",
				GLUDCU = "",
				GLRDCL = "",
				GLRDCR = "",
				GLRUCL = "",
				GLRUCR = "",
			},
			format = {
				timestamp = "%H:%M:%S %d-%m-%Y",
				fields = { "hash", "timestamp", "author", "branch_name", "tag" },
			},
			hooks = {
				-- Check diff of a commit
				on_select_commit = function(commit)
					vim.notify("DiffviewOpen " .. commit.hash .. "^!")
					vim.cmd(":DiffviewOpen " .. commit.hash .. "^!")
				end,
				-- Check diff from commit a -> commit b
				on_select_range_commit = function(from, to)
					vim.notify("DiffviewOpen " .. from.hash .. "~1.." .. to.hash)
					vim.cmd(":DiffviewOpen " .. from.hash .. "~1.." .. to.hash)
				end,
			},
		},
		keys = {
			{
				"<leader>gl",
				function()
					require("gitgraph").draw({}, { all = true, max_count = 5000 })
				end,
				desc = "GitGraph - Draw",
			},
		},
	},
}
