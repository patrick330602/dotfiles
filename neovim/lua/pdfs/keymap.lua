-- shortcut settings
vim.keymap.set("", "<leader>F", require("oil").toggle_float, { desc = "Find Files within Working Directory" })
vim.keymap.set("v", "J", ":m '>+1<CR>gv=gv", { desc = "Move line(s) up" })
vim.keymap.set("v", "K", ":m '<-2<CR>gv=gv", { desc = "Move line(s) down" })
vim.keymap.set({ "n", "t" }, "<C-t>", require("pdfs.visual.term").toggle, { desc = "Toggle Terminal" })

-- fzf-lua
vim.keymap.set("", "<leader>S", require("fzf-lua").live_grep, { desc = "Search Texts within Working Directory" })
vim.keymap.set("", "<leader>xw", require("fzf-lua").diagnostics_workspace, { desc = "Show workspace diagnostics" })
vim.keymap.set("", "<leader>xd", require("fzf-lua").diagnostics_document, { desc = "Show document diagnostics" })
vim.keymap.set("", "<leader>xq", require("fzf-lua").quickfix, { desc = "Show quickfix list" })
vim.keymap.set("", "<leader>xl", require("fzf-lua").loclist, { desc = "Show location list" })

-- vim-ufo
vim.keymap.set("n", "zR", require("ufo").openAllFolds, { desc = "Open all folds" })
vim.keymap.set("n", "zM", require("ufo").closeAllFolds, { desc = "Close all folds" })
vim.keymap.set("n", "zr", require("ufo").openFoldsExceptKinds, { desc = "Open folds except specified kinds" })
vim.keymap.set("n", "zm", require("ufo").closeFoldsWith, { desc = "Close folds with specified level" }) -- closeAllFolds == closeFoldsWith(0)
vim.keymap.set("n", "K", function()
	local winid = require("ufo").peekFoldedLinesUnderCursor()
	if not winid then
		-- choose one of coc.nvim and nvim lsp
		vim.fn.CocActionAsync("definitionHover") -- coc.nvim
		vim.lsp.buf.hover()
	end
end, { desc = "Peek fold or show hover" })

-- hlslens
local kopts = { noremap = true, silent = true }

local function nN(char)
	local ok, winid = require("hlslens").nNPeekWithUFO(char)
	if ok and winid then
		vim.keymap.set("n", "<CR>", function()
			return "<Tab><CR>"
		end, { buffer = true, remap = true, expr = true })
	end
end

vim.keymap.set({ "n", "x" }, "n", function()
	nN("n")
end, { desc = "Next search result with lens" })

vim.keymap.set({ "n", "x" }, "N", function()
	nN("N")
end, { desc = "Previous search result with lens" })

vim.keymap.set(
	"n",
	"*",
	[[*<Cmd>lua require('hlslens').start()<CR>]],
	vim.tbl_extend("force", kopts, { desc = "Search word under cursor forward" })
)
vim.keymap.set(
	"n",
	"#",
	[[#<Cmd>lua require('hlslens').start()<CR>]],
	vim.tbl_extend("force", kopts, { desc = "Search word under cursor backward" })
)
vim.keymap.set(
	"n",
	"g*",
	[[g*<Cmd>lua require('hlslens').start()<CR>]],
	vim.tbl_extend("force", kopts, { desc = "Search word under cursor forward (partial)" })
)
vim.keymap.set(
	"n",
	"g#",
	[[g#<Cmd>lua require('hlslens').start()<CR>]],
	vim.tbl_extend("force", kopts, { desc = "Search word under cursor backward (partial)" })
)
vim.keymap.set("n", "<Leader>l", "<Cmd>noh<CR>", vim.tbl_extend("force", kopts, { desc = "Clear search highlights" }))

-- MacOS
if vim.fn.has("macunix") == 1 then
	vim.api.nvim_set_keymap("n", "<D-v>", "a<C-r>+<Esc>", { noremap = true, desc = "Paste in normal mode (MacOS)" })
	vim.api.nvim_set_keymap("i", "<D-v>", "<C-r>+", { noremap = true, desc = "Paste in insert mode (MacOS)" })
	vim.api.nvim_set_keymap("c", "<D-v>", "<C-r>+", { noremap = true, desc = "Paste in command mode (MacOS)" })
end
