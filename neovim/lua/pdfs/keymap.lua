-- Define local shortcut for vim.keymap.set
local set = vim.keymap.set

------------------------------------------
-- BASIC EDITOR OPERATIONS
------------------------------------------

-- Line movement in visual mode
set("v", "J", ":m '>+1<CR>gv=gv", { desc = "Move line(s) down" })
set("v", "K", ":m '<-2<CR>gv=gv", { desc = "Move line(s) up" })

-- Clear search highlights
set("n", "<Leader>l", "<Cmd>noh<CR>", { noremap = true, silent = true, desc = "Clear search highlights" })

-- Terminal toggle
set({ "n", "t" }, "<C-t>", require("pdfs.visual.term").toggle, { desc = "Toggle Terminal" })

------------------------------------------
-- FILE NAVIGATION
------------------------------------------

-- Oil file explorer
set("", "<leader>e", require("oil").toggle_float, { desc = "Toggle file explorer in float window" })

-- Aerial symbol navigator
set("n", "<leader>L", "<cmd>AerialToggle!<CR>", { desc = "Toggle symbol outline" })

------------------------------------------
-- SEARCH AND DIAGNOSTICS
------------------------------------------

-- Trouble integration for lists
set("", "<leader>xq", "<cmd>Trouble qflist toggle<cr>", { desc = "Toggle quickfix list" })
set("", "<leader>xl", "<cmd>Trouble loclist toggle<cr>", { desc = "Toggle location list" })

-- GrugFar search and replace
set("n", "<leader>F", function()
	require("grug-far").open({ prefills = { paths = vim.fn.expand("%") } })
end, { desc = "Search Within Current File" })
set("v", "<leader>F", function()
	require("grug-far").with_visual_selection({ prefills = { paths = vim.fn.expand("%") } })
end, { desc = "Search Within Current File" })

-- HLSlens search enhancement
local kopts = { noremap = true, silent = true }

local function nN(char)
	local ok, winid = require("hlslens").nNPeekWithUFO(char)
	if ok and winid then
		set("n", "<CR>", function()
			return "<Tab><CR>"
		end, { buffer = true, remap = true, expr = true, desc = "Confirm search peek" })
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

------------------------------------------
-- CODE FOLDING (UFO)
------------------------------------------

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

------------------------------------------
-- MULTI-CURSOR OPERATIONS
------------------------------------------

local mc = require("multicursor-nvim")

-- Add or skip cursor above/below the main cursor
set({ "n", "v" }, "<up>", function()
	mc.lineAddCursor(-1)
end, { desc = "Add cursor above" })
set({ "n", "v" }, "<down>", function()
	mc.lineAddCursor(1)
end, { desc = "Add cursor below" })
set({ "n", "v" }, "<leader><up>", function()
	mc.lineSkipCursor(-1)
end, { desc = "Skip cursor above" })
set({ "n", "v" }, "<leader><down>", function()
	mc.lineSkipCursor(1)
end, { desc = "Skip cursor below" })

-- Add or skip adding a new cursor by matching word/selection
set({ "n", "v" }, "<leader>n", function()
	mc.matchAddCursor(1)
end, { desc = "Add cursor at next match" })
set({ "n", "v" }, "<leader>s", function()
	mc.matchSkipCursor(1)
end, { desc = "Skip cursor at next match" })
set({ "n", "v" }, "<leader>N", function()
	mc.matchAddCursor(-1)
end, { desc = "Add cursor at previous match" })
set({ "n", "v" }, "<leader>S", function()
	mc.matchSkipCursor(-1)
end, { desc = "Skip cursor at previous match" })
set({ "n", "v" }, "<leader>A", mc.matchAllAddCursors, { desc = "Add cursors at all matches" })

-- Cursor navigation and management
set({ "n", "v" }, "<left>", mc.nextCursor, { desc = "Go to next cursor" })
set({ "n", "v" }, "<right>", mc.prevCursor, { desc = "Go to previous cursor" })
set({ "n", "v" }, "<leader>x", mc.deleteCursor, { desc = "Delete current cursor" })
set("n", "<c-leftmouse>", mc.handleMouse, { desc = "Add/remove cursor with mouse" })
set({ "n", "v" }, "<c-q>", mc.toggleCursor, { desc = "Toggle cursor at position" })
set({ "n", "v" }, "<leader><c-q>", mc.duplicateCursors, { desc = "Duplicate all cursors" })
set("n", "<leader>gv", mc.restoreCursors, { desc = "Restore cleared cursors" })
set("n", "<leader>a", mc.alignCursors, { desc = "Align all cursors" })

-- Multi-cursor escape handling
set("n", "<esc>", function()
	if not mc.cursorsEnabled() then
		mc.enableCursors()
	elseif mc.hasCursors() then
		mc.clearCursors()
	else
		-- Default <esc> handler
	end
end, { desc = "Enable/clear cursors or default escape" })

-- Visual selection multi-cursor operations
set("v", "S", mc.splitCursors, { desc = "Split selection into multiple cursors" })
set("v", "I", mc.insertVisual, { desc = "Insert at start of each selected line" })
set("v", "A", mc.appendVisual, { desc = "Append at end of each selected line" })
set("v", "M", mc.matchCursors, { desc = "Match cursors in visual selection" })
set("v", "<leader>t", function()
	mc.transposeCursors(1)
end, { desc = "Transpose selections forward" })
set("v", "<leader>T", function()
	mc.transposeCursors(-1)
end, { desc = "Transpose selections backward" })

-- Jumplist support
set({ "v", "n" }, "<c-i>", mc.jumpForward, { desc = "Jump forward in cursor history" })
set({ "v", "n" }, "<c-o>", mc.jumpBackward, { desc = "Jump backward in cursor history" })

------------------------------------------
-- LSP CONFIGURATION
------------------------------------------

vim.api.nvim_create_autocmd("LspAttach", {
	group = vim.api.nvim_create_augroup("UserLspConfig", {}),
	callback = function(ev)
		local opts = { buffer = ev.buf, silent = true }

		set(
			"n",
			"gR",
			"<cmd>Trouble lsp_references toggle<CR>",
			vim.tbl_extend("force", opts, { desc = "Show LSP references" })
		)
		set("n", "gD", vim.lsp.buf.declaration, vim.tbl_extend("force", opts, { desc = "Go to declaration" }))
		set(
			"n",
			"gd",
			"<cmd>Trouble lsp_definitions toggle<CR>",
			vim.tbl_extend("force", opts, { desc = "Show LSP definitions" })
		)
		set(
			"n",
			"gi",
			"<cmd>Trouble lsp_implementations toggle<CR>",
			vim.tbl_extend("force", opts, { desc = "Show LSP implementations" })
		)
		set(
			"n",
			"gt",
			"<cmd>Trouble lsp_type_definitions toggle<CR>",
			vim.tbl_extend("force", opts, { desc = "Show LSP type definitions" })
		)
		set("n", "<leader>rn", vim.lsp.buf.rename, vim.tbl_extend("force", opts, { desc = "Smart rename" }))
		set(
			"n",
			"<leader>D",
			"<cmd>Trouble diagnostics toggle<CR>",
			vim.tbl_extend("force", opts, { desc = "Show buffer diagnostics" })
		)
		set(
			"n",
			"<leader>d",
			vim.diagnostic.open_float,
			vim.tbl_extend("force", opts, { desc = "Show line diagnostics" })
		)
		set("n", "[d", vim.diagnostic.goto_prev, vim.tbl_extend("force", opts, { desc = "Go to previous diagnostic" }))
		set("n", "]d", vim.diagnostic.goto_next, vim.tbl_extend("force", opts, { desc = "Go to next diagnostic" }))
		set(
			"n",
			"K",
			vim.lsp.buf.hover,
			vim.tbl_extend("force", opts, { desc = "Show documentation for what is under cursor" })
		)
		set("n", "<leader>rs", ":LspRestart<CR>", vim.tbl_extend("force", opts, { desc = "Restart LSP" }))
	end,
})

------------------------------------------
-- PLATFORM-SPECIFIC KEYMAPS
------------------------------------------

-- MacOS clipboard integration
if vim.fn.has("macunix") == 1 then
	set("n", "<D-v>", "a<C-r>+<Esc>", { noremap = true, desc = "Paste in normal mode (MacOS)" })
	set("i", "<D-v>", "<C-r>+", { noremap = true, desc = "Paste in insert mode (MacOS)" })
	set("c", "<D-v>", "<C-r>+", { noremap = true, desc = "Paste in command mode (MacOS)" })
end
