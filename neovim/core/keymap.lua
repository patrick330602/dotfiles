-- shortcut settings
vim.keymap.set("n", "<F2>", vim.cmd.NvimTreeToggle)
vim.keymap.set("n", "<F3>", vim.cmd.UndotreeToggle)
vim.keymap.set("n", "<leader>S", ":Telescope live_grep<CR>")
vim.keymap.set("v", "J", ":m '>+1<CR>gv=gv")
vim.keymap.set("v", "K", ":m '<-2<CR>gv=gv")

-- MacOS-specific settings
if vim.fn.has("macunix") == 1 then
	vim.api.nvim_set_keymap("n", "<D-v>", "a<C-r>+<Esc>", { noremap = true })
	vim.api.nvim_set_keymap("i", "<D-v>", "<C-r>+", { noremap = true })
	vim.api.nvim_set_keymap("c", "<D-v>", "<C-r>+", { noremap = true })
end

vim.keymap.set("", "<Leader>L", require("lsp_lines").toggle, { desc = "Toggle lsp_lines" })
