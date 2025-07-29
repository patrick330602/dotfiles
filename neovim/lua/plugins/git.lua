return {
	{
		"lewis6991/gitsigns.nvim",
		opts = {
			signs = {
				add = { text = "┃" },
				change = { text = "┃" },
				delete = { text = "_" },
				topdelete = { text = "‾" },
				changedelete = { text = "~" },
				untracked = { text = "┆" },
			},
			signs_staged = {
				add = { text = "┃" },
				change = { text = "┃" },
				delete = { text = "_" },
				topdelete = { text = "‾" },
				changedelete = { text = "~" },
				untracked = { text = "┆" },
			},
			signs_staged_enable = true,
			signcolumn = true,
			numhl = false,
			linehl = false,
			word_diff = true,
			watch_gitdir = {
				follow_files = true,
			},
			auto_attach = true,
			attach_to_untracked = false,
			current_line_blame = true,
			current_line_blame_opts = {
				virt_text = true,
				virt_text_pos = "eol",
				delay = 1000,
				ignore_whitespace = false,
				virt_text_priority = 100,
				use_focus = true,
			},
			current_line_blame_formatter = "<author>, <author_time:%R> - <summary>",
			sign_priority = 6,
			update_debounce = 100,
			status_formatter = nil,
			max_file_length = 40000,
			preview_config = {
				-- Options passed to nvim_open_win
				border = "single",
				style = "minimal",
				relative = "cursor",
				row = 0,
				col = 1,
			},
			on_attach = function(bufnr)
				local gitsigns = require("gitsigns")

				local function map(mode, l, r, opts)
					opts = opts or {}
					opts.buffer = bufnr
					vim.keymap.set(mode, l, r, opts)
				end

				-- Navigation
				map("n", "]c", function()
					if vim.wo.diff then
						vim.cmd.normal({ "]c", bang = true })
					else
						gitsigns.nav_hunk("next")
					end
				end)

				map("n", "[c", function()
					if vim.wo.diff then
						vim.cmd.normal({ "[c", bang = true })
					else
						gitsigns.nav_hunk("prev")
					end
				end)

				-- Actions
				map("n", "<leader>hs", gitsigns.stage_hunk, { desc = "Stage the current hunk" })
				map("n", "<leader>hr", gitsigns.reset_hunk, { desc = "Reset the current hunk" })
				map("v", "<leader>hs", function()
						gitsigns.stage_hunk({ vim.fn.line("."), vim.fn.line("v") })
					end,
					{ desc = "Stage selected lines" })
				map("v", "<leader>hr", function()
					gitsigns.reset_hunk({ vim.fn.line("."), vim.fn.line("v") })
				end, { desc = "Reset selected lines" })
				map("n", "<leader>hS", gitsigns.stage_buffer, { desc = "Stage the entire buffer" })
				map("n", "<leader>hR", gitsigns.reset_buffer, { desc = "Reset the entire buffer" })
				map("n", "<leader>hp", gitsigns.preview_hunk_inline, { desc = "Preview the current hunk inline" })
				map("n", "<leader>hP", gitsigns.preview_hunk, { desc = "Preview the current hunk" })
				map("n", "<leader>hb", function()
					gitsigns.blame_line({ full = true })
				end, { desc = "Blame the current line" })
				map("n", "<leader>hd", gitsigns.diffthis, { desc = "Diff between current and index" })
				map("n", "<leader>hD", function()
					gitsigns.diffthis("~")
				end, { desc = "Diff between current and HEAD" })

				-- Text object
				map({ "o", "x" }, "ih", ":<C-U>Gitsigns select_hunk<CR>")
			end,
		}
	},
	{
		"sindrets/diffview.nvim",
		lazy = true,
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
		lazy = true,
		dependencies = {
			"nvim-lua/plenary.nvim",
			"sindrets/diffview.nvim",
			"ibhagwan/fzf-lua",
		},
		opts = {
			graph_style = "kitty",
			process_spinner = true
		}
	}
}
