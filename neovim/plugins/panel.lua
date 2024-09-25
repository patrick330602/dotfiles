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
						"Lengends says this dude is still configuring this neovim",
					},
				},
				preview = {
					command = "lolcat",
					file_path = "$HOME/.dotfiles/nvim-header.txt",
					file_width = 39,
					file_height = 6,
				},
			})
		end,
		dependencies = { { "nvim-tree/nvim-web-devicons" } },
	},
}
