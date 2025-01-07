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
		"ibhagwan/fzf-lua",
		dependencies = { "nvim-tree/nvim-web-devicons" },
		opts = {
			winopts = {
				backdrop = 100,
			},
			files = {
				prompt = "󰱼 ",
			},
			git = {
				files = {
					prompt = " ",
				},
				status = {
					prompt = " ",
				},
				commits = {
					prompt = " ",
				},
				bcommits = {
					prompt = " ",
				},
				blame = {
					prompt = " ",
				},
			},
			grep = {
				prompt = "󰱼 ",
				input_prompt = "󰱼 ",
				no_header = true,
				no_header_i = true,
			},
			oldfiles = {
				prompt = " ",
				include_current_session = true,
				previewer = false,
				fzf_opts = {
					-- Show full file paths
					["--with-nth"] = "-1",
					-- No line wrapping
					["--no-wrap"] = "",
				},
				hls = {
					normal = "FzfLuaTransparentNormal",
					border = "FzfLuaTransparentBorder",
				},
				winopts = {
					height = 0.4,
					width = 0.6,
					border = "rounded",
				},
			},
			diagnostics = {
				prompt = "",
				hls = {
					normal = "FzfLuaTransparentNormal",
					border = "FzfLuaTransparentBorder",
				},
				winopts = {
					split = "belowright new",
					backdrop = 0,
					height = 0.3,
					width = 1,
					preview = {
						hidden = "hidden",
					},
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
	{ "dmmulroy/ts-error-translator.nvim", config = true },
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
