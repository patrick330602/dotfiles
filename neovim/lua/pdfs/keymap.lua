local set = vim.keymap.set

-- shortcut settings
set("v", "J", ":m '>+1<CR>gv=gv", { desc = "Move line(s) up" })
set("v", "K", ":m '<-2<CR>gv=gv", { desc = "Move line(s) down" })
set({ "n", "t" }, "<C-t>", require("pdfs.visual.term").toggle, { desc = "Toggle Terminal" })

-- oil.nvim
set("", "<leader>F", require("oil").toggle_float, { desc = "Find Files within Working Directory" })

-- fzf-lua
local fl = require("fzf-lua")
set("", "<leader>S", fl.live_grep, { desc = "Search Texts within Working Directory" })
set("", "<leader>xw", fl.diagnostics_workspace, { desc = "Show workspace diagnostics" })
set("", "<leader>xd", fl.diagnostics_document, { desc = "Show document diagnostics" })
set("", "<leader>xq", fl.quickfix, { desc = "Show quickfix list" })
set("", "<leader>xl", fl.loclist, { desc = "Show location list" })

-- vim-ufo
local ufo = require("ufo")
set("n", "zR", ufo.openAllFolds, { desc = "Open all folds" })
set("n", "zM", ufo.closeAllFolds, { desc = "Close all folds" })
set("n", "zr", ufo.openFoldsExceptKinds, { desc = "Open folds except specified kinds" })
set("n", "zm", ufo.closeFoldsWith, { desc = "Close folds with specified level" })
set("n", "K", function()
	local winid = ufo.peekFoldedLinesUnderCursor()
	if not winid then
		vim.fn.CocActionAsync("definitionHover")
		vim.lsp.buf.hover()
	end
end, { desc = "Peek fold or show hover" })

-- hlslens
local kopts = { noremap = true, silent = true }

local function nN(char)
	local ok, winid = require("hlslens").nNPeekWithUFO(char)
	if ok and winid then
		set("n", "<CR>", function()
			return "<Tab><CR>"
		end, { buffer = true, remap = true, expr = true })
	end
end

set({ "n", "x" }, "n", function()
	nN("n")
end, { desc = "Next search result with lens" })

set({ "n", "x" }, "N", function()
	nN("N")
end, { desc = "Previous search result with lens" })

set(
	"n",
	"*",
	[[*<Cmd>lua require('hlslens').start()<CR>]],
	vim.tbl_extend("force", kopts, { desc = "Search word under cursor forward" })
)
set(
	"n",
	"#",
	[[#<Cmd>lua require('hlslens').start()<CR>]],
	vim.tbl_extend("force", kopts, { desc = "Search word under cursor backward" })
)
set(
	"n",
	"g*",
	[[g*<Cmd>lua require('hlslens').start()<CR>]],
	vim.tbl_extend("force", kopts, { desc = "Search word under cursor forward (partial)" })
)
set(
	"n",
	"g#",
	[[g#<Cmd>lua require('hlslens').start()<CR>]],
	vim.tbl_extend("force", kopts, { desc = "Search word under cursor backward (partial)" })
)
set("n", "<Leader>l", "<Cmd>noh<CR>", vim.tbl_extend("force", kopts, { desc = "Clear search highlights" }))

-- aerial.nvim
set("n", "<leader>L", "<cmd>AerialToggle!<CR>", { desc = "Open Symbols" })

-- multicursor.nvim
local mc = require("multicursor-nvim")
-- Add or skip cursor above/below the main cursor.
set({ "n", "v" }, "<up>", function()
	mc.lineAddCursor(-1)
end)
set({ "n", "v" }, "<down>", function()
	mc.lineAddCursor(1)
end)
set({ "n", "v" }, "<leader><up>", function()
	mc.lineSkipCursor(-1)
end)
set({ "n", "v" }, "<leader><down>", function()
	mc.lineSkipCursor(1)
end)

-- Add or skip adding a new cursor by matching word/selection
set({ "n", "v" }, "<leader>n", function()
	mc.matchAddCursor(1)
end)
set({ "n", "v" }, "<leader>s", function()
	mc.matchSkipCursor(1)
end)
set({ "n", "v" }, "<leader>N", function()
	mc.matchAddCursor(-1)
end)
set({ "n", "v" }, "<leader>S", function()
	mc.matchSkipCursor(-1)
end)
-- Add all matches in the document
set({ "n", "v" }, "<leader>A", mc.matchAllAddCursors)

-- Rotate the main cursor.
set({ "n", "v" }, "<left>", mc.nextCursor)
set({ "n", "v" }, "<right>", mc.prevCursor)

-- Delete the main cursor.
set({ "n", "v" }, "<leader>x", mc.deleteCursor)

-- Add and remove cursors with control + left click.
set("n", "<c-leftmouse>", mc.handleMouse)

-- Easy way to add and remove cursors using the main cursor.
set({ "n", "v" }, "<c-q>", mc.toggleCursor)

-- Clone every cursor and disable the originals.
set({ "n", "v" }, "<leader><c-q>", mc.duplicateCursors)

set("n", "<esc>", function()
	if not mc.cursorsEnabled() then
		mc.enableCursors()
	elseif mc.hasCursors() then
		mc.clearCursors()
	else
		-- Default <esc> handler.
	end
end)

-- bring back cursors if you accidentally clear them
set("n", "<leader>gv", mc.restoreCursors)

-- Align cursor columns.
set("n", "<leader>a", mc.alignCursors)

-- Split visual selections by regex.
set("v", "S", mc.splitCursors)

-- Append/insert for each line of visual selections.
set("v", "I", mc.insertVisual)
set("v", "A", mc.appendVisual)

-- match new cursors within visual selections by regex.
set("v", "M", mc.matchCursors)

-- Rotate visual selection contents.
set("v", "<leader>t", function()
	mc.transposeCursors(1)
end)
set("v", "<leader>T", function()
	mc.transposeCursors(-1)
end)

-- Jumplist support
set({ "v", "n" }, "<c-i>", mc.jumpForward)
set({ "v", "n" }, "<c-o>", mc.jumpBackward)

-- MacOS
if vim.fn.has("macunix") == 1 then
	vim.api.nvim_set_keymap("n", "<D-v>", "a<C-r>+<Esc>", { noremap = true, desc = "Paste in normal mode (MacOS)" })
	vim.api.nvim_set_keymap("i", "<D-v>", "<C-r>+", { noremap = true, desc = "Paste in insert mode (MacOS)" })
	vim.api.nvim_set_keymap("c", "<D-v>", "<C-r>+", { noremap = true, desc = "Paste in command mode (MacOS)" })
end
