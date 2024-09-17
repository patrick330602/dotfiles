-- Remove old plugins installed by vim-plug
local plug_dir = vim.fn.stdpath("data") .. "/plugged"
if vim.fn.isdirectory(plug_dir) == 1 then
    vim.fn.delete(plug_dir, "rf")
    vim.api.nvim_echo({
        {"Removed old plugins installed by vim-plug.\n", "WarningMsg"}
    }, true, {})
end

-- Remove vim-plug if installed
local plug_path = vim.fn.stdpath("data") .. "/site/autoload/plug.vim"
if vim.fn.filereadable(plug_path) == 1 then
    os.remove(plug_path)
    vim.api.nvim_echo({{"Removed vim-plug from Neovim.\n", "WarningMsg"}}, true,
                      {})
end

-- Bootstrap lazy.nvim
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not (vim.uv or vim.loop).fs_stat(lazypath) then
    local lazyrepo = "https://github.com/folke/lazy.nvim.git"
    local out = vim.fn.system({
        "git", "clone", "--filter=blob:none", "--branch=stable", lazyrepo,
        lazypath
    })
    if vim.v.shell_error ~= 0 then
        vim.api.nvim_echo({
            {"Failed to clone lazy.nvim:\n", "ErrorMsg"}, {out, "WarningMsg"},
            {"\nPress any key to exit..."}
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
    {'github/copilot.vim'},
    {'godlygeek/tabular'},
    {'vim-airline/vim-airline'},
    {'vim-airline/vim-airline-themes'},
    {'tpope/vim-fugitive'},
    {'sbdchd/neoformat'},
    {
        "nvim-tree/nvim-tree.lua",
        version = "*",
        lazy = false,
        dependencies = {"nvim-tree/nvim-web-devicons"},
        config = function() require("nvim-tree").setup {} end
    },
    {
        "chrisgrieser/nvim-tinygit",
        dependencies = {
            "stevearc/dressing.nvim", "nvim-telescope/telescope.nvim",
            "rcarriga/nvim-notify"
        }
    },
    {
        'nvimdev/dashboard-nvim',
        event = 'VimEnter',
        config = function()
            require('dashboard').setup {
                -- config
            }
        end,
        dependencies = {{'nvim-tree/nvim-web-devicons'}}
    },
    checker = {enabled = true}
})

-- font settings
vim.opt.encoding = 'utf-8'

-- general settings
vim.opt.number = true
vim.cmd('syntax on')
vim.opt.autoindent = true
vim.opt.laststatus = 2
vim.opt.mouse = 'a'

-- tab settings
vim.opt.tabstop = 4
vim.opt.shiftwidth = 4

-- display settings
vim.opt.listchars = {eol = '⏎', tab = '␉·', trail = '␠', nbsp = '⎵'}

-- shortcut settings
vim.api.nvim_set_keymap('n', '<F4>', ':bnext<CR>',
                        {noremap = true, silent = true})
vim.api.nvim_set_keymap('n', '<F3>', ':bprev<CR>',
                        {noremap = true, silent = true})
vim.api.nvim_set_keymap('n', '<C-Left>', ':tabprevious<CR>',
                        {noremap = true, silent = true})
vim.api.nvim_set_keymap('n', '<C-Right>', ':tabnext<CR>',
                        {noremap = true, silent = true})
vim.api.nvim_set_keymap('n', '<A-Left>',
                        ':execute "silent! tabmove " . (tabpagenr()-2)<CR>',
                        {noremap = true, silent = true})
vim.api.nvim_set_keymap('n', '<A-Right>',
                        ':execute "silent! tabmove " . (tabpagenr()+1)<CR>',
                        {noremap = true, silent = true})

-- MacOS-specific settings
if vim.fn.has('macunix') == 1 then
    vim.api.nvim_set_keymap('n', '<D-v>', 'a<C-r>+<Esc>', {noremap = true})
    vim.api.nvim_set_keymap('i', '<D-v>', '<C-r>+', {noremap = true})
    vim.api.nvim_set_keymap('c', '<D-v>', '<C-r>+', {noremap = true})
end

-- plugins settings
-- vim-airline settings
vim.g.airline_powerline_fonts = 1
vim.g.airline_theme = 'minimalist'
vim.g['airline#extensions#tabline#enabled'] = 1
vim.g['airline#extensions#tabline#left_sep'] = ' '
vim.g['airline#extensions#tabline#left_alt_sep'] = '|'

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
