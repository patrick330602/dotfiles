local shortcut = {
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
}
-- if find it is a git@git.wedotstud.io url in .git/config, then add the following:
local file = io.open(os.getenv("HOME") .. "/.dotfiles/.git/config", "r")
if file then
	for line in file:lines() do
		if string.find(line, "git@code.wedotstud.io") then
			table.insert(shortcut, {
				desc = "Dotfiles",
				group = "@property",
				key = "D",
				action = "NvimTreeOpen " .. os.getenv("HOME") .. "/.dotfiles",
			})
			break
		end
	end
end

return {
	{
		"echasnovski/mini.map",
		version = "*",
		config = function()
			local MiniMap = require("mini.map")
			MiniMap.setup({
				symbols = {
					encode = MiniMap.gen_encode_symbols.dot(),
				},
			})
		end,
	},
	{ "mbbill/undotree" },
	{
		"nvim-tree/nvim-tree.lua",
		version = "*",
		lazy = false,
		dependencies = { "nvim-tree/nvim-web-devicons" },
		config = true,
	},
	{
		"nvimdev/dashboard-nvim",
		event = "VimEnter",
		config = function()
			local logo = [[
░▒▓███████▓▒░░▒▓████████▓▒░▒▓██████▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░▒▓██████████████▓▒░ 
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░     ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░     ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░
░▒▓█▓▒░░▒▓█▓▒░▒▓██████▓▒░░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░     ░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▓█▓▒░ ░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░     ░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▓█▓▒░ ░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░
░▒▓█▓▒░░▒▓█▓▒░▒▓████████▓▒░▒▓██████▓▒░   ░▒▓██▓▒░  ░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░
]]

			logo = string.rep("\n", 8) .. logo .. "\n\n"

			require("dashboard").setup({
				theme = "hyper",
				config = {
					header = vim.split(logo, "\n"),
					shortcut = shortcut,
					footer = {
						"",
						"Legend says this dude is still configuring this neovim to this day.",
					},
				},
			})
		end,
		dependencies = { { "nvim-tree/nvim-web-devicons" } },
	},
	{ "akinsho/toggleterm.nvim", version = "*", opts = {
		open_mapping = [[<c-\>]],
		hide_numbers = true,
	} },
	{
		"folke/which-key.nvim",
		event = "VeryLazy",
		opts = {
			-- your configuration comes here
			-- or leave it empty to use the default settings
			-- refer to the configuration section below
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
