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
set({ "n", "t" }, "<C-t>", require("visual.term").toggle, { desc = "Toggle Terminal" })

------------------------------------------
-- FILE NAVIGATION
------------------------------------------

-- Oil file explorer
set("", "<leader>e", require("oil").toggle_float, { desc = "Toggle file explorer in float window" })
set("", "<leader>G", require("neogit").open, { desc = "Open Neogit" })

------------------------------------------
-- SEARCH AND DIAGNOSTICS
------------------------------------------

-- Trouble integration for lists
local function toggle_quickfix()
	local windows = vim.fn.getwininfo()
	for _, win in pairs(windows) do
		if win["quickfix"] == 1 then
			vim.cmd.cclose()
			return
		end
	end
	vim.cmd.copen()
end

local function toggle_loclist()
	local winid = vim.fn.getloclist(0, { winid = 0 }).winid

	if winid == 0 then
		vim.cmd.lopen()
	else
		vim.cmd.lclose()
	end
end

set("", "<leader>xq", toggle_quickfix, { desc = "Toggle quickfix list" })
set("", "<leader>xl", toggle_loclist, { desc = "Toggle location list" })

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
-- LSP CONFIGURATION
------------------------------------------

vim.api.nvim_create_autocmd("LspAttach", {
	group = vim.api.nvim_create_augroup("UserLspConfig", {}),
	callback = function(ev)
		local opts = { buffer = ev.buf, silent = true }

		set("n", "grd", vim.lsp.buf.definition, vim.tbl_extend("force", opts, { desc = "Go to definition" }))
		set("n", "grt", vim.lsp.buf.type_definition, vim.tbl_extend("force", opts, { desc = "Go to type definitions" }))
		set("n", "gD", vim.diagnostic.show, vim.tbl_extend("force", opts, { desc = "Show buffer diagnostics" }))
		set("n", "gd", vim.diagnostic.open_float, vim.tbl_extend("force", opts, { desc = "Show line diagnostics" }))
		set("n", "K", vim.lsp.buf.hover, vim.tbl_extend("force", opts, { desc = "Show hover LSP Info" }))
	end,
})
