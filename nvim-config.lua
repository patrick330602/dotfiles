-- Remove old plugins installed by vim-plug
local plug_dir = vim.fn.stdpath("data") .. "/plugged"
if vim.fn.isdirectory(plug_dir) == 1 then
	vim.fn.delete(plug_dir, "rf")
	vim.api.nvim_echo({
		{ "Removed old plugins installed by vim-plug.\n", "WarningMsg" },
	}, true, {})
end

-- Remove vim-plug if installed
local plug_path = vim.fn.stdpath("data") .. "/site/autoload/plug.vim"
if vim.fn.filereadable(plug_path) == 1 then
	os.remove(plug_path)
	vim.api.nvim_echo({ { "Removed vim-plug from Neovim.\n", "WarningMsg" } }, true, {})
end

-- Bootstrap lazy.nvim
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not (vim.uv or vim.loop).fs_stat(lazypath) then
	local lazyrepo = "https://github.com/folke/lazy.nvim.git"
	local out = vim.fn.system({
		"git",
		"clone",
		"--filter=blob:none",
		"--branch=stable",
		lazyrepo,
		lazypath,
	})
	if vim.v.shell_error ~= 0 then
		vim.api.nvim_echo({
			{ "Failed to clone lazy.nvim:\n", "ErrorMsg" },
			{ out, "WarningMsg" },
			{ "\nPress any key to exit..." },
		}, true, {})
		vim.fn.getchar()
		os.exit(1)
	end
end
vim.opt.rtp:prepend(lazypath)

-- Setup lazy.nvim
vim.g.mapleader = " "
vim.g.maplocalleader = "\\"

require("lazy").setup({
	{ "github/copilot.vim" },
	{
		"CopilotC-Nvim/CopilotChat.nvim",
		branch = "canary",
		dependencies = {
			{ "github/copilot.vim" }, -- or github/copilot.vim
			{ "nvim-lua/plenary.nvim" }, -- for curl, log wrapper
		},
		build = "make tiktoken", -- Only on MacOS or Linux
		opts = {
			debug = true, -- Enable debugging
			-- See Configuration section for rest
		},
		-- See Commands section for default commands if you want to lazy load on them
	},
	{
		"nanozuki/tabby.nvim",
		dependencies = "nvim-tree/nvim-web-devicons",
		config = function()
			require("tabby").setup({
				preset = "active_tab_with_wins",
				option = {
					nerdfont = true, -- whether use nerdfont
					lualine_theme = "iceberg", -- lualine theme name
				},
			})
		end,
	},
	{
		"nvim-lualine/lualine.nvim",
		dependencies = { "nvim-tree/nvim-web-devicons" },
		config = function()
			require("lualine").setup({
				option = {
					theme = "iceberg",
				},
			})
		end,
	},
	{ "tpope/vim-fugitive" },
	{ "sbdchd/neoformat" },
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
		"chrisgrieser/nvim-tinygit",
		dependencies = {
			"stevearc/dressing.nvim",
			"nvim-telescope/telescope.nvim",
			"rcarriga/nvim-notify",
		},
	},
	{ "mbbill/undotree" },
	{
		"nvim-treesitter/nvim-treesitter",
		build = ":TSUpdate",
		config = function()
			local configs = require("nvim-treesitter.configs")

			configs.setup({
				ensure_installed = {
					"bash",
					"c",
					"c_sharp",
					"cpp",
					"css",
					"csv",
					"dockerfile",
					"git_config",
					"go",
					"json",
					"make",
					"nim",
					"powershell",
					"python",
					"rust",
					"toml",
					"typescript",
					"xml",
					"yaml",
					"lua",
					"vim",
					"vimdoc",
					"javascript",
					"html",
				},
				sync_install = false,
				highlight = { enable = true },
				indent = { enable = true },
			})
		end,
	},
	{
		"lukas-reineke/indent-blankline.nvim",
		main = "ibl",
		---@module "ibl"
		---@type ibl.config
		opts = {},
		config = function()
			require("ibl").setup({})
		end,
	},
	{
		"amitds1997/remote-nvim.nvim",
		version = "*", -- Pin to GitHub releases
		dependencies = {
			"nvim-lua/plenary.nvim", -- For standard functions
			"MunifTanjim/nui.nvim", -- To build the plugin UI
			"nvim-telescope/telescope.nvim", -- For picking b/w different remote methods
		},
		config = true,
	},
	{
		"f-person/auto-dark-mode.nvim",
		opts = {
			update_interval = 1000,
			set_dark_mode = function()
				vim.api.nvim_set_option_value("background", "dark", {})
			end,
			set_light_mode = function()
				vim.api.nvim_set_option_value("background", "light", {})
			end,
		},
	},
	checker = { enabled = true },
})

-- font settings
vim.opt.encoding = "utf-8"

-- general settings
vim.cmd("syntax on")
vim.opt.nu = true
vim.opt.relativenumber = true
vim.opt.laststatus = 2
vim.opt.mouse = "a"
vim.opt.scrolloff = 4
vim.opt.colorcolumn = "80"

-- tab settings
vim.opt.showtabline = 2

-- indent settings
vim.opt.tabstop = 4
vim.opt.softtabstop = 4
vim.opt.shiftwidth = 4
vim.expandtab = true
vim.opt.smartindent = true

-- temp file settings
vim.opt.swapfile = false
vim.opt.backup = false
vim.opt.undodir = os.getenv("HOME") .. "/.vim/undodir"
vim.opt.undofile = true

-- search settings
vim.opt.hlsearch = false
vim.opt.incsearch = true

-- shortcut settings
vim.keymap.set("n", "<leader><F5>", vim.cmd.UndotreeToggle)
vim.keymap.set("v", "J", ":m '>+1<CR>gv=gv")
vim.keymap.set("v", "K", ":m '<-2<CR>gv=gv")
vim.api.nvim_set_keymap("n", "<F4>", ":bnext<CR>", { noremap = true, silent = true })
vim.api.nvim_set_keymap("n", "<F3>", ":bprev<CR>", { noremap = true, silent = true })
vim.api.nvim_set_keymap("n", "<C-Left>", ":tabprevious<CR>", { noremap = true, silent = true })
vim.api.nvim_set_keymap("n", "<C-Right>", ":tabnext<CR>", { noremap = true, silent = true })
vim.api.nvim_set_keymap(
	"n",
	"<A-Left>",
	':execute "silent! tabmove " . (tabpagenr()-2)<CR>',
	{ noremap = true, silent = true }
)
vim.api.nvim_set_keymap(
	"n",
	"<A-Right>",
	':execute "silent! tabmove " . (tabpagenr()+1)<CR>',
	{ noremap = true, silent = true }
)
vim.keymap.set("n", "gc", function()
	require("tinygit").smartCommit()
end)
vim.keymap.set("n", "gp", function()
	require("tinygit").push()
end)

-- MacOS-specific settings
if vim.fn.has("macunix") == 1 then
	vim.api.nvim_set_keymap("n", "<D-v>", "a<C-r>+<Esc>", { noremap = true })
	vim.api.nvim_set_keymap("i", "<D-v>", "<C-r>+", { noremap = true })
	vim.api.nvim_set_keymap("c", "<D-v>", "<C-r>+", { noremap = true })
end

-- plugins settings

-- nvim-tree settings
vim.g.loaded_netrw = 1
vim.g.loaded_netrwPlugin = 1

-- neovide settings
if vim.g.neovide then
	vim.o.guifont = "0xProto Nerd Font Mono:h14"
	vim.g.neovide_window_blurred = true
	vim.g.neovide_transparency = 0.8
	vim.opt.termguicolors = true
end
