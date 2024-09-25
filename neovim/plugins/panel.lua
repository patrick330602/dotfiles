return {
	{ "mbbill/undotree" },
	{
		"nvim-tree/nvim-tree.lua",
		version = "*",
		lazy = false,
		dependencies = { "nvim-tree/nvim-web-devicons" },
		config = function()
			require("nvim-tree").setup({})
		end,
	},
	{
		"nvimdev/dashboard-nvim",
		event = "VimEnter",
		config = function()
			require("dashboard").setup({
				theme = "hyper",
				config = {
					shortcut = {
						{
							desc = "Remote",
							group = "@property",
							key = "R",
							action = "RemoteStart",
						},
						{
							desc = "Plugins",
							group = "@property",
							key = "P",
							action = "Lazy",
						},
					},
					footer = {
						"",
						"Lengends says this dude is still configuring this neovim to this day.",
					},
				},
				preview = {
					command = "lolcat",
					file_path = "$HOME/.dotfiles/nvim-header.txt",
					file_width = 78,
					file_height = 17,
				},
			})
		end,
		dependencies = { { "nvim-tree/nvim-web-devicons" } },
	},
}
