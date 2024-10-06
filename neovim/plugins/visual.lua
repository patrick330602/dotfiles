return {
	{
		"rebelot/kanagawa.nvim",
		config = true,
		opts = {
			theme = "dragon",
			-- background = {
			-- 	dark = "dragon",
			-- 	light = "lotus",
			-- },
			overrides = function(colors)
				local theme = colors.theme
				return {
					NormalFloat = { bg = "none" },
					FloatBorder = { bg = "none" },
					FloatTitle = { bg = "none" },
					NormalDark = { fg = theme.ui.fg_dim, bg = theme.ui.bg_m3 },
					LazyNormal = { bg = theme.ui.bg_m3, fg = theme.ui.fg_dim },
					MasonNormal = { bg = theme.ui.bg_m3, fg = theme.ui.fg_dim },
					TelescopeTitle = { fg = theme.ui.special, bold = true },
					TelescopePromptNormal = { bg = theme.ui.bg_p1 },
					TelescopePromptBorder = { fg = theme.ui.bg_p1, bg = theme.ui.bg_p1 },
					TelescopeResultsNormal = { fg = theme.ui.fg_dim, bg = theme.ui.bg_m1 },
					TelescopeResultsBorder = { fg = theme.ui.bg_m1, bg = theme.ui.bg_m1 },
					TelescopePreviewNormal = { bg = theme.ui.bg_dim },
					TelescopePreviewBorder = { bg = theme.ui.bg_dim, fg = theme.ui.bg_dim },
				}
			end,
		},
	},
	-- {
	-- 	"f-person/auto-dark-mode.nvim",
	-- 	opts = {
	-- 		update_interval = 1000,
	-- 		set_dark_mode = function()
	-- 			vim.api.nvim_set_option_value("background", "dark", {})
	-- 			vim.cmd("colorscheme kanagawa")
	-- 		end,
	-- 		set_light_mode = function()
	-- 			vim.api.nvim_set_option_value("background", "light", {})
	-- 			vim.cmd("colorscheme kanagawa")
	-- 		end,
	-- 	},
	-- },
	{
		"nvim-lualine/lualine.nvim",
		dependencies = { "nvim-tree/nvim-web-devicons", "AndreM222/copilot-lualine" },
		config = function()
			require("lualine").setup({
				option = {
					theme = "auto",
				},
				sections = {
					lualine_a = { "mode" },
					lualine_b = { "branch", "diff", "diagnostics" },
					lualine_c = { "filename" },
					lualine_x = { "copilot", "encoding", "fileformat", "filetype" },
					lualine_y = { "progress" },
					lualine_z = { "location" },
				},
				extensions = { "nvim-tree", "lazy", "mason", "toggleterm", "trouble" },
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
	{ "j-hui/fidget.nvim", version = "*" },
	{ "nvchad/volt", lazy = true },
	{ "nvchad/menu", lazy = true },
	{ "nvchad/minty", lazy = true },
}
