return {
	{
		"rebelot/kanagawa.nvim",
		lazy = false,
		priority = 1000,
		opts = {
			theme = "wave",
			overrides = function(colors)
				local t = colors.theme
				return {
					NormalFloat = { bg = "none" },
					FloatBorder = { bg = "none" },
					FloatTitle = { bg = "none" },

					NormalDark = { fg = t.ui.fg_dim, bg = t.ui.bg_m3 },

					LazyNormal = { bg = t.ui.bg_m3, fg = t.ui.fg_dim },
					MasonNormal = { bg = t.ui.bg_m3, fg = t.ui.fg_dim },

					CmdBlue = { fg = t.term[5] },
					CmdViolet = { fg = t.term[6] },
					CmdBlueBg = { fg = t.term[8], bg = t.term[5] },
					CmdVioletBg = { fg = t.term[8], bg = t.term[6] },
					CmdYellow = { fg = t.term[12] },
					CmdOrange = { fg = t.term[4] },
					CmdOrangeBg = { fg = t.term[1], bg = t.term[4] },
					CmdYellowBg = { fg = t.term[1], bg = t.term[12] },
					CmdGreenBg = { fg = t.term[8], bg = t.term[3] },

					StNormalMode = { fg = t.term[8], bg = t.term[5] },
					StNTerminalMode = { fg = t.term[8], bg = t.term[4] },
					StInsertMode = { fg = t.term[8], bg = t.term[3] },
					StVisualMode = { fg = t.term[8], bg = t.term[6] },
					StTerminalMode = { fg = t.term[8], bg = t.term[4] },
					StReplaceMode = { fg = t.term[8], bg = t.term[2] },
					StSelectMode = { fg = t.term[8], bg = t.term[7] },
					StCommandMode = { fg = t.term[8], bg = t.term[1] },
					StConfirmMode = { fg = t.term[1], bg = t.term[8] },

					StFileName = { fg = t.ui.fg },
					StFileNameCurrent = { fg = t.ui.fg, bold = true },
					StFileNameFloating = { fg = t.term[8], bg = t.term[7] },

					StExtInactive = { fg = "#bbbbbb", bg = t.ui.bg_p2 },
					StOil = { fg = "#ebb403", bg = t.ui.bg_p2 },
					StGit = { fg = "#F1502F", bg = t.ui.bg_p2 },
					StFzfLua = { fg = "#2b2f77", bg = t.ui.bg_p2 },
					StMason = { fg = "#C1944A", bg = t.ui.bg_p2 },
					StUndoTree = { fg = t.ui.fg, bg = t.ui.bg_p2 },
					StLazy = { fg = "#2875E1", bg = t.ui.bg_p2 },
					StTrouble = { fg = t.ui.fg, bg = t.ui.bg_p2 },
					StTerm = { fg = t.term[4], bg = t.ui.bg_p2 },
					StDiffFile = { link = "StGit" },

					StLspError = { fg = t.diag.error },
					StLspWarning = { fg = t.diag.warning },
					StLspHints = { fg = t.diag.hint },
					StLspInfo = { fg = t.diag.info },

					StGitBranch = { fg = t.untracked },
					StGitAdd = { fg = t.vcs.added },
					StGitChange = { fg = t.vcs.changed },
					StGitRemove = { fg = t.vcs.removed },

					StPos = { fg = t.ui.fg, bg = t.ui.bg_p2 },

					TabLine = {
						bg = t.ui.bg_p1,
						fg = t.ui.fg,
					},
					TabLineLogo = {
						bg = "#69A33E",
						fg = t.term[8],
					},
					TabLineSel = {
						bg = t.ui.bg,
						fg = t.ui.fg,
						bold = true,
					},
					TabLineGraph = {
						fg = t.ui.bg_p2,
						bg = t.ui.bg_p1,
					},
					TabLineGraphSel = {
						fg = t.ui.bg_p2,
						bg = t.ui.bg,
					},
					TabLineFill = {
						bg = t.ui.bg_p2,
					},
					TabLineTab = {
						fg = t.term[8],
						bg = "#ebb403",
					},
					TabLineTabSel = {
						fg = t.term[8],
						bg = "#ebb403",
						bold = true,
					},
				}
			end,
		}
	},
	{
		"stevearc/stickybuf.nvim",
		opts = {},
	},
	{
		"mbbill/undotree",
		keys = {
			{ "<leader>U", vim.cmd.UndotreeToggle, desc = "Toggle UndoTree" },
		},
	},
	{
		"kevinhwang91/nvim-hlslens",
		config = true,
	},
	{
		"benomahony/oil-git.nvim",
		dependencies = { "stevearc/oil.nvim" },
		-- No opts or config needed! Works automatically
	},
	{
		"stevearc/oil.nvim",
		dependencies = { "nvim-tree/nvim-web-devicons" },
		config = function()
			local oil = require("oil")
			oil.setup({
				default_file_explorer = true,
				delete_to_trash = true,
				view_options = { show_hidden = true },
			})
		end,
	},
	{ "brenoprata10/nvim-highlight-colors", opts = { render = "virtual" } },
	{
		"folke/which-key.nvim",
		event = "VeryLazy",
		opts = {
			preset = "helix",
		},
		keys = {
			{
				"<leader>?",
				function()
					require("which-key").show({ global = false })
				end,
				desc = "Buffer Local Keymaps (which-key)",
			},
		},
	},

}
