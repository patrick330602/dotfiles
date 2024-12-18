return {
	{
		"sourcegraph/sg.nvim",
		dependencies = { "nvim-lua/plenary.nvim" },
		config = true,
	},
	{
		"zbirenbaum/copilot.lua",
		cmd = "Copilot",
		event = "InsertEnter",
	},
	{
		"CopilotC-Nvim/CopilotChat.nvim",
		version = "*",
		dependencies = {
			{ "nvim-lua/plenary.nvim" },
		},
		build = "make tiktoken",
		opts = {
			model = "claude-3.5-sonnet",
			debug = false,
			window = {
				width = 0.3,
			},
		},
	},
}
