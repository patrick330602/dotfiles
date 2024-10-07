local function diff_source()
	local gitsigns = vim.b.gitsigns_status_dict
	if gitsigns then
		return {
			added = gitsigns.added,
			modified = gitsigns.changed,
			removed = gitsigns.removed,
		}
	end
end

return {
	{
		"comfysage/evergarden",
		priority = 1000, -- Colorscheme plugin is loaded first before any other plugins
		opts = {
			transparent_background = true,
			contrast_dark = "medium",
			style = {
				tabline = { reverse = true, color = "green" },
				search = { reverse = false, inc_reverse = true },
				types = { italic = true },
				keyword = { italic = true },
				comment = { italic = true },
				sign = { highlight = false },
			},
			overrides = {}, -- add custom overrides
		},
	}, -- {
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
		dependencies = { "nvim-tree/nvim-web-devicons", "AndreM222/copilot-lualine", "arkav/lualine-lsp-progress" },
		config = function()
			require("lualine").setup({
				options = {
					theme = "auto",
					component_separators = { left = "|", right = "|" },
					section_separators = { left = "", right = "" },
				},
				sections = {
					lualine_a = { "mode" },
					lualine_b = { { "b:gitsigns_head", icon = "" }, { "diff", source = diff_source }, "diagnostics" },
					lualine_c = {
						"filename",
						{
							"lsp_progress",
							display_components = { "lsp_client_name", "spinner" },
							spinner_symbols = { "⣷", "⣯", "⣟", "⡿", "⢿", "⣻", "⣽", "⣾" },
						},
					},
					lualine_x = {
						"copilot",
						"encoding",
						{
							"fileformat",
							icons_enabled = true,
							symbols = {
								unix = "LF",
								dos = "CRLF",
								mac = "CR",
							},
						},
						"filetype",
					},
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
	{ "rcarriga/nvim-notify" },
	{ "brenoprata10/nvim-highlight-colors", config = true, opts = { render = "virtual" } },
}
