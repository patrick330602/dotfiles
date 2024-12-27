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
		"SmiteshP/nvim-navic",
		event = "VeryLazy",
		opts = {
			highlight = true,
			click = true,
			icons = {
				File = " ",
				Module = " ",
				Namespace = " ",
				Package = " ",
				Class = " ",
				Method = " ",
				Property = " ",
				Field = " ",
				Constructor = " ",
				Enum = " ",
				Interface = " ",
				Function = " ",
				Variable = " ",
				Constant = " ",
				String = " ",
				Number = " ",
				Boolean = " ",
				Array = " ",
				Object = " ",
				Key = " ",
				Null = " ",
				EnumMember = " ",
				Struct = " ",
				Event = " ",
				Operator = " ",
				TypeParameter = " ",
			},
		},
	},
	{
		"mbbill/undotree",
		keys = {
			{ "<leader>U", vim.cmd.UndotreeToggle, desc = "Toggle UndoTree" },
		},
	},
	{
		"kevinhwang91/nvim-hlslens",
		config = function()
			require("hlslens").setup()

			local kopts = { noremap = true, silent = true }

			local maps = {
				{ "n", "n", [[<Cmd>execute('normal! ' . v:count1 . 'n')<CR><Cmd>lua require('hlslens').start()<CR>]] },
				{ "n", "N", [[<Cmd>execute('normal! ' . v:count1 . 'N')<CR><Cmd>lua require('hlslens').start()<CR>]] },
				{ "n", "*", [[*<Cmd>lua require('hlslens').start()<CR>]] },
				{ "n", "#", [[#<Cmd>lua require('hlslens').start()<CR>]] },
				{ "n", "g*", [[g*<Cmd>lua require('hlslens').start()<CR>]] },
				{ "n", "g#", [[g#<Cmd>lua require('hlslens').start()<CR>]] },
				{ "n", "<Leader>l", "<Cmd>noh<CR>" },
			}

			for _, map in ipairs(maps) do
				vim.keymap.set(map[1], map[2], map[3], kopts)
			end
		end,
	},
	{
		"stevearc/oil.nvim",
		dependencies = { "nvim-tree/nvim-web-devicons" },
		opts = { default_file_explorer = true, delete_to_trash = true, view_options = { show_hidden = true } },
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
			},
		},
	},
	{
		"rachartier/tiny-inline-diagnostic.nvim",
		event = "VeryLazy",
		priority = 1000,
		opts = {
			preset = "nonerdfont",
		},
	},
}
