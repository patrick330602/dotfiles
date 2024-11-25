return {
	{
		"zbirenbaum/copilot.lua",
		cmd = "Copilot",
		event = "InsertEnter",
		config = true,
	},
	{
		"CopilotC-Nvim/CopilotChat.nvim",
		version = "*",
		dependencies = {
			{ "zbirenbaum/copilot.lua" },
			{ "nvim-lua/plenary.nvim" },
		},
		build = "make tiktoken",
		opts = {
			debug = false,
		},
	},
}
