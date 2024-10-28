return {
	{
		"rebelot/kanagawa.nvim",
		config = function()
			require("kanagawa").setup({
				-- Enable transparent background
				-- transparent = true,
			})
		end,
	},
	{
		"f-person/auto-dark-mode.nvim",
		opts = {
			update_interval = 1000,
			set_dark_mode = function()
				vim.api.nvim_set_option_value("background", "dark", {})
				vim.cmd("colorscheme kanagawa")
			end,
			set_light_mode = function()
				vim.api.nvim_set_option_value("background", "dark", {})
				vim.cmd("colorscheme kanagawa")
			end,
		},
	},
	{
		"nvim-lualine/lualine.nvim",
		dependencies = { "nvim-tree/nvim-web-devicons" },
		config = function()
			require("lualine").setup({
				option = {
					theme = "auto",
				},
			})
		end,
	},
	{
		"romgrk/barbar.nvim",
		dependencies = {
			"lewis6991/gitsigns.nvim", -- OPTIONAL: for git status
			"nvim-tree/nvim-web-devicons", -- OPTIONAL: for file icons
		},
		init = function()
			vim.g.barbar_auto_setup = false
		end,
		opts = {
			sidebar_filetypes = {
				NvimTree = { event = "BufWinLeave", text = "Files", align = "center" },
				undotree = {
					text = "undotree",
					align = "center", -- *optionally* specify an alignment (either 'left', 'center', or 'right')
				},
			},
		},
		version = "*", -- optional: only update when a new 1.x version is released
	},
	{
		"Bekaboo/dropbar.nvim",
		dependencies = {
			"nvim-telescope/telescope-fzf-native.nvim",
		},
	},
	{ "rcarriga/nvim-notify" },
}
