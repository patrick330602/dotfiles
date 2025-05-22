local utils = require("utils")
-- font settings
vim.opt.encoding = "utf-8"

-- general settings
vim.cmd("syntax on")
vim.opt.nu = true
vim.opt.relativenumber = true
vim.opt.mouse = "a"
vim.opt.mousemoveevent = true
vim.opt.laststatus = 3
vim.opt.scrolloff = 10
vim.opt.cmdheight = 0

-- clipboard
if utils.IsWayland() then
	vim.g.clipboard = "wl-copy"
end
vim.schedule(function()
	vim.opt.clipboard = "unnamedplus"
end)
vim.opt.updatetime = 100

-- tab settings
vim.opt.showtabline = 2

-- indent settings
vim.opt.tabstop = 4
vim.opt.softtabstop = 4
vim.opt.shiftwidth = 4
vim.expandtab = true
vim.opt.smartindent = true

-- character visual
vim.opt.list = false
vim.opt.listchars = {
	space = "·",
	tab = "→ ",
	trail = "·",
	extends = "▶",
	precedes = "◀",
	nbsp = "␣",
	eol = "↴",
}

-- temp file settings
vim.opt.swapfile = false
vim.opt.backup = false
vim.opt.undodir = vim.fn.stdpath("data") .. "/undodir"
vim.opt.undofile = true

-- search settings
-- vim.opt.hlsearch = false
-- vim.opt.incsearch = true

-- vim.g.loaded_netrw = 1
-- vim.g.loaded_netrwPlugin = 1

-- visual
vim.opt.statusline = "%{%v:lua.require('visual.statusline').generate_statusline()%}"
vim.opt.tabline = '%!v:lua.require("visual.tabline").tabline()'
vim.opt.statuscolumn = "%!v:lua.require('visual.statuscolumn').get()"

-- folding
vim.opt.foldcolumn = "1"
vim.opt.foldlevel = 99
vim.opt.foldlevelstart = 99
vim.opt.foldenable = true

-- Flog
vim.g.flog_enable_extended_chars = true
