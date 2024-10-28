return {
	{
		"m4xshen/hardtime.nvim",
		dependencies = { "MunifTanjim/nui.nvim", "nvim-lua/plenary.nvim", "tris203/precognition.nvim" },
		opts = {
			callback = function(text)
				vim.notify(text, vim.log.levels.WARN, { title = "hardtime" })
				require("precognition").peek()
			end,
			disabled_filetypes = {
				"qf",
				"netrw",
				"lazy",
				"mason",
				"oil",
				"trouble",
				"Telescope",
				"TelescopePrompt",
				"copilot-diff",
				"copilot-system-prompt",
				"copilot-user-selection",
				"copilot-chat",
				"NeoGitCommitMessage",
				"NeoGitDiffView",
			},
		},
	},
}
