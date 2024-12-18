-- shortcut settings
vim.keymap.set(
	"",
	"<leader>S",
	require("telescope.builtin").live_grep,
	{ desc = "Search Texts within Working Directory" }
)
vim.keymap.set("", "<leader>F", require("oil").toggle_float, { desc = "Find Files within Working Directory" })
vim.keymap.set("v", "J", ":m '>+1<CR>gv=gv", { desc = "Move line(s) up" })
vim.keymap.set("v", "K", ":m '<-2<CR>gv=gv", { desc = "Move line(s) down" })
vim.keymap.set({ "n", "t" }, "<C-t>", require("pdfs.visual.term").toggle, { desc = "Toggle Terminal" })

--- AI
vim.keymap.set(
	"n",
	"<leader>Ct",
	require("copilot.suggestion").toggle_auto_trigger,
	{ desc = "Toggle Copilot Auto Trigger" }
)
vim.keymap.set("n", "<leader>Cc", require("CopilotChat").toggle, { desc = "Toggle Copilot Chat" })
vim.keymap.set("v", "<leader>Cc", function()
	require("CopilotChat").toggle({
		selection = require("CopilotChat.select").visual,
	})
end, { desc = "Toggle Copilot Chat" })

if vim.fn.has("macunix") == 1 then
	vim.api.nvim_set_keymap("n", "<D-v>", "a<C-r>+<Esc>", { noremap = true })
	vim.api.nvim_set_keymap("i", "<D-v>", "<C-r>+", { noremap = true })
	vim.api.nvim_set_keymap("c", "<D-v>", "<C-r>+", { noremap = true })
end
