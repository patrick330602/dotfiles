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
		"stevearc/oil.nvim",
		dependencies = { "nvim-tree/nvim-web-devicons" },
		config = function()
			local oil = require("oil")
			oil.setup({
				default_file_explorer = true,
				delete_to_trash = true,
				view_options = { show_hidden = true },
				keymaps = {
					gs = {
						callback = function()
							local prefills = { paths = oil.get_current_dir() }

							local grug_far = require("grug-far")
							if not grug_far.has_instance("explorer") then
								grug_far.open({
									instanceName = "explorer",
									prefills = prefills,
									staticTitle = "Find and Replace from Explorer",
								})
							else
								grug_far.open_instance("explorer")
								grug_far.update_instance_prefills("explorer", prefills, false)
							end
						end,
						desc = "oil: Search in directory",
					},
				},
			})
		end,
	},
	{
		"folke/trouble.nvim",
		dependencies = { "nvim-tree/nvim-web-devicons" },
		opts = {
			-- your configuration comes here
			-- or leave it empty to use the default settings
		},
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
	{
		"wurli/visimatch.nvim",
		config = true,
	},
	{
		"jake-stewart/multicursor.nvim",
		branch = "1.0",
		config = true,
	},
}
