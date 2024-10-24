-- font settings
vim.opt.encoding = "utf-8"

-- general settings
vim.cmd("syntax on")
vim.opt.nu = true
vim.opt.relativenumber = true
vim.opt.mouse = "a"
vim.opt.laststatus = 2
vim.opt.scrolloff = 10
-- vim.opt.cmdheight = 0

vim.schedule(function()
	vim.opt.clipboard = "unnamedplus"
end)
vim.opt.updatetime = 100

-- tab settings
vim.opt.showtabline = 0

-- indent settings
vim.opt.tabstop = 4
vim.opt.softtabstop = 4
vim.opt.shiftwidth = 4
vim.expandtab = true
vim.opt.smartindent = true

-- temp file settings
vim.opt.swapfile = false
vim.opt.backup = false
vim.opt.undodir = vim.fn.stdpath("data") .. "/undodir"
vim.opt.undofile = true

-- search settings
vim.opt.hlsearch = false
vim.opt.incsearch = true

vim.g.loaded_netrw = 1
vim.g.loaded_netrwPlugin = 1
