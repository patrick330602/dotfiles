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

-- MacOS-specific settings
if vim.fn.has("macunix") == 1 then
	vim.api.nvim_set_keymap("n", "<D-v>", "a<C-r>+<Esc>", { noremap = true })
	vim.api.nvim_set_keymap("i", "<D-v>", "<C-r>+", { noremap = true })
	vim.api.nvim_set_keymap("c", "<D-v>", "<C-r>+", { noremap = true })
end
