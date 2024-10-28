return {
	{
		"amitds1997/remote-nvim.nvim",
		version = "*", -- Pin to GitHub releases
		dependencies = {
			"nvim-lua/plenary.nvim", -- For standard functions
			"MunifTanjim/nui.nvim", -- To build the plugin UI
			"nvim-telescope/telescope.nvim", -- For picking b/w different remote methods
		},
		opts = {
			offline_mode = {
				enabled = true,
				no_github = false,
			},
		},
	},
	{
		"rmagatti/auto-session",
		lazy = false,
		opts = {
			allowed_dirs = { "~/.dotfiles", "~/Git/*", "~/Git/_personal/*" },
			suppressed_dirs = { "~/Git/_personal" },
			args_allow_files_auto_save = true,
		},
	},
}
