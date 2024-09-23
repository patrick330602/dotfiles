return {
	{ "Mofiqul/vscode.nvim" },
	{
		"f-person/auto-dark-mode.nvim",
		opts = {
			update_interval = 1000,
			set_dark_mode = function()
				vim.api.nvim_set_option_value("background", "dark", {})
			end,
			set_light_mode = function()
				vim.api.nvim_set_option_value("background", "light", {})
			end,
		},
	},
	{
		"nvim-lualine/lualine.nvim",
		dependencies = { "nvim-tree/nvim-web-devicons" },
		config = function()
			require("lualine").setup({
				option = {
					theme = "vscode",
				},
			})
		end,
	},
	{
		"nanozuki/tabby.nvim",
		dependencies = "nvim-tree/nvim-web-devicons",
		config = function()
			require("tabby").setup({
				preset = "active_wins_at_tail",
				option = {
					nerdfont = true,
					lualine_theme = "vscode",
				},
			})
		end,
	}
}
