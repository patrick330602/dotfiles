-- shortcut settings
vim.keymap.set(
	"",
	"<leader>S",
	require("telescope.builtin").live_grep,
	{ desc = "Search Texts within Working Directory" }
)
vim.keymap.set("", "<leader>F", require("oil").open, { desc = "Find Files within Working Directory" })
vim.keymap.set("", "<leader><leader>", require("telescope.builtin").buffers, { desc = "Show Current Opened Buffer" })
vim.keymap.set("v", "J", ":m '>+1<CR>gv=gv", { desc = "Move line(s) up" })
vim.keymap.set("v", "K", ":m '<-2<CR>gv=gv", { desc = "Move line(s) down" })

-- MacOS-specific settings
if vim.fn.has("macunix") == 1 then
	vim.api.nvim_set_keymap("n", "<D-v>", "a<C-r>+<Esc>", { noremap = true })
	vim.api.nvim_set_keymap("i", "<D-v>", "<C-r>+", { noremap = true })
	vim.api.nvim_set_keymap("c", "<D-v>", "<C-r>+", { noremap = true })
end
