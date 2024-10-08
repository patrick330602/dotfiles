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
	{
		desc = "Tools",
		group = "@property",
		key = "T",
		action = "Mason",
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
				action = "Telescope find_files cwd=" .. os.getenv("HOME") .. "/.dotfiles",
			})
			break
		end
	end
end

local telescopeConfig = require("telescope.config")
local vimgrep_arguments = {  unpack(telescopeConfig.values.vimgrep_arguments) }

table.insert(vimgrep_arguments, "--hidden")
table.insert(vimgrep_arguments, "--glob")
table.insert(vimgrep_arguments, "!**/.git/*")

return {
	{ "mbbill/undotree" },
	{
		"stevearc/oil.nvim",
		---@module 'oil'
		---@type oil.SetupOpts
		opts = {},
		dependencies = { { "echasnovski/mini.icons", opts = {} } },
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
		"nvim-telescope/telescope.nvim",
		dependencies = { "nvim-lua/plenary.nvim" },
		config = true,
		opts = {
			defaults = {
				-- `hidden = true` is not supported in text grep commands.
				vimgrep_arguments = vimgrep_arguments,
			},
			pickers = {
				find_files = {
					-- `hidden = true` will still show the inside of `.git/` as it's not `.gitignore`d.
					find_command = { "rg", "--files", "--hidden", "--glob", "!**/.git/*" },
				},
				buffers = {
					previewer = false,
					layout_strategy = "center",
					layout_config = {
						width = function(_, max_columns)
							local percentage = 0.5
							local max = 50
							return math.min(math.floor(percentage * max_columns), max)
						end,
						height = function(_, _, max_lines)
							local percentage = 0.5
							local max = 30
							return math.min(math.floor(percentage * max_lines), max)
						end,
					},
				},
			},
		},
	},
}
