-- shortcut settings
vim.keymap.set("", "<Leader>U", vim.cmd.UndotreeToggle, { desc = "Toggle Undo Tree" })
vim.keymap.set(
	"",
	"<leader>S",
	require("telescope.builtin").live_grep,
	{ desc = "Search Texts within Working Directory" }
)
vim.keymap.set("", "<Leader>L", require("lsp_lines").toggle, { desc = "Toggle Inline Diagnostic" })
vim.keymap.set("", "<Leader>G", require("neogit").open, { desc = "Toggle Neogit" })
vim.keymap.set(
	"",
	"<Leader>F",
	require("telescope.builtin").find_files,
	{ desc = "Find Files within Working Directory" }
)
vim.keymap.set("", "<Leader>B", require("telescope.builtin").buffers, { desc = "Show Current Opened Buffer" })
vim.keymap.set("v", "J", ":m '>+1<CR>gv=gv")
vim.keymap.set("v", "K", ":m '<-2<CR>gv=gv")

-- MacOS-specific settings
if vim.fn.has("macunix") == 1 then
	vim.api.nvim_set_keymap("n", "<D-v>", "a<C-r>+<Esc>", { noremap = true })
	vim.api.nvim_set_keymap("i", "<D-v>", "<C-r>+", { noremap = true })
	vim.api.nvim_set_keymap("c", "<D-v>", "<C-r>+", { noremap = true })
end
