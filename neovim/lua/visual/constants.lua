local M = {}
M.extensions_hidden = { "diff" }

M.extensions = {
	undotree = {
		hl_group = "StUndoTree",
		icon = "",
	},
	diff = {
		hl_group = "",
		icon = "",
	},
	oil = {
		hl_group = "StOil",
		icon = "󰼙",
	},
	trouble = {
		hl_group = "StTrouble",
		icon = "",
	},
	fugitive = {
		hl_group = "StGit",
		icon = "",
	},
	flog = {
		hl_group = "StGit",
		icon = "",
	},
	toggleterm = {
		hl_group = "StTerm",
		icon = "",
	},
	DiffviewFiles = {
		hl_group = "StDiffFile",
		icon = "",
	},
	grug = {
		hl_group = "StFzfLua",
		icon = "",
	},
	lazy = {
		hl_group = "StLazy",
		icon = "󰒲",
	},
	mason = {
		hl_group = "StMason",
		icon = "󱌣",
	},
}

M.modes = {
	-- Normal
	["n"] = "StNormalMode",
	["no"] = "StNormalMode",
	["nov"] = "StNormalMode",
	["noV"] = "StNormalMode",
	["noCTRL-V"] = "StNormalMode",
	["niI"] = "StNormalMode",
	["niR"] = "StNormalMode",
	["niV"] = "StNormalMode",
	["nt"] = "StNTerminalMode",
	["ntT"] = "StNTerminalMode",

	-- Visual
	["v"] = "StVisualMode",
	["vs"] = "StVisualMode",
	["V"] = "StVisualMode",
	["Vs"] = "StVisualMode",
	[""] = "StVisualMode",

	-- Insert
	["i"] = "StInsertMode",
	["ic"] = "StInsertMode",
	["ix"] = "StInsertMode",

	-- Terminal
	["t"] = "StTerminalMode",

	-- Replace
	["R"] = "StReplaceMode",
	["Rc"] = "StReplaceMode",
	["Rx"] = "StReplaceMode",
	["Rv"] = "StReplaceMode",
	["Rvc"] = "StReplaceMode",
	["Rvx"] = "StReplaceMode",

	-- Select
	["s"] = "StSelectMode",
	["S"] = "StSelectMode",
	[""] = "StSelectMode",

	-- Command
	["c"] = "StCommandMode",
	["cv"] = "StCommandMode",
	["ce"] = "StCommandMode",

	-- Confirm
	["r"] = "StConfirmMode",
	["rm"] = "StConfirmMode",
	["r?"] = "StConfirmMode",
	["x"] = "StConfirmMode",

	-- Shell
	["!"] = "StTerminalMode",
}

return M
