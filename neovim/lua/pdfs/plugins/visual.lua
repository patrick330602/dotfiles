local telescopeConfig = require("telescope.config")
local vimgrep_arguments = { unpack(telescopeConfig.values.vimgrep_arguments) }

table.insert(vimgrep_arguments, "--hidden")
table.insert(vimgrep_arguments, "--glob")
table.insert(vimgrep_arguments, "!**/.git/*")
return {
	{
		"f-person/auto-dark-mode.nvim",
		opts = {
			update_interval = 1000,
			set_dark_mode = function()
				vim.api.nvim_set_option_value("background", "dark", {})
				require("pdfs.colors").load()
			end,
			set_light_mode = function()
				vim.api.nvim_set_option_value("background", "light", {})
				require("pdfs.colors").load()
			end,
		},
	},
	{
		"Bekaboo/dropbar.nvim",
		dependencies = {
			"nvim-telescope/telescope-fzf-native.nvim",
		},
	},
	{
		"mbbill/undotree",
		keys = {
			{ "<leader>U", vim.cmd.UndotreeToggle, desc = "Toggle UndoTree" },
		},
	},
	{
		"stevearc/oil.nvim",
		dependencies = { "nvim-tree/nvim-web-devicons" },
		opts = { default_file_explorer = true, delete_to_trash = true, view_options = { show_hidden = true } },
	},
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
	{
		"nvim-telescope/telescope.nvim",
		dependencies = { "nvim-lua/plenary.nvim" },
		opts = {
			defaults = {
				vimgrep_arguments = vimgrep_arguments,
			},
			pickers = {
				find_files = {
					find_command = { "rg", "--files", "--hidden", "--glob", "!**/.git/*" },
				},
				buffers = {
					initial_mode = "normal",
					previewer = false,
					layout_strategy = "center",
					layout_config = {
						width = function(_, max_columns)
							local percentage = 0.5
							local max = 50
							return math.min(math.floor(percentage * max_columns), max)
						end,
						height = function(_, _, max_lines)
							local percentage = 0.5
							local max = 30
							return math.min(math.floor(percentage * max_lines), max)
						end,
					},
				},
			},
		},
	},
}
